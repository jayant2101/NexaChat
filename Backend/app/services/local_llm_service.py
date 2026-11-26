import atexit
from collections.abc import Iterator
import json
from pathlib import Path
import subprocess
import threading
import time
import requests

_server_lock = threading.Lock()
_server_process: subprocess.Popen | None = None
_active_server_url: str | None = None


class LocalLLMError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code


def _stop_server() -> None:
    global _server_process
    if _server_process is not None and _server_process.poll() is None:
        _server_process.terminate()
        try:
            _server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            _server_process.kill()
    _server_process = None


atexit.register(_stop_server)


def _server_is_healthy(base_url: str) -> bool:
    try:
        res = requests.get(f'{base_url}/health', timeout=1.5)
        return res.status_code == 200
    except requests.RequestException:
        return False


def is_model_loaded(base_url: str | None = None) -> bool:
    url = base_url or _active_server_url
    return _server_is_healthy(url) if url else False


def _ensure_server(
    *,
    server_bin: str,
    model_path: str,
    host: str,
    port: int,
    n_ctx: int,
    n_threads: int,
) -> str:
    global _server_process, _active_server_url

    base_url = f'http://{host}:{port}'
    if _server_is_healthy(base_url):
        _active_server_url = base_url
        return base_url

    with _server_lock:
        if _server_is_healthy(base_url):
            _active_server_url = base_url
            return base_url

        bin_path = Path(server_bin)
        if not bin_path.exists():
            raise LocalLLMError(
                f'llama-server binary not found at "{bin_path}".',
                status_code=500,
            )

        gguf_path = Path(model_path)
        if not gguf_path.exists():
            raise LocalLLMError(
                f'Local GGUF model not found at "{gguf_path}". Run "python download_model.py" first.',
                status_code=500,
            )

        _stop_server()

        cmd = [
            str(bin_path),
            '--model',
            str(gguf_path),
            '--host',
            host,
            '--port',
            str(port),
            '--ctx-size',
            str(n_ctx),
            '--threads',
            str(n_threads),
            '--threads-batch',
            str(n_threads),
            '--batch-size',
            '512',
            '--no-webui',
        ]

        _server_process = subprocess.Popen(
            cmd,
            cwd=str(bin_path.parent),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        deadline = time.monotonic() + 30.0
        while time.monotonic() < deadline:
            if _server_process.poll() is not None:
                raise LocalLLMError(
                    f'llama-server exited unexpectedly with code {_server_process.returncode}.',
                    status_code=500,
                )
            if _server_is_healthy(base_url):
                _active_server_url = base_url
                return base_url
            time.sleep(0.2)

        _stop_server()
        raise LocalLLMError('Timed out waiting for local llama-server to start.', status_code=500)


def preload_model(
    *,
    server_bin: str,
    model_path: str,
    host: str = '127.0.0.1',
    port: int = 8081,
    n_ctx: int = 2048,
    n_threads: int = 6,
) -> str:
    return _ensure_server(
        server_bin=server_bin,
        model_path=model_path,
        host=host,
        port=port,
        n_ctx=n_ctx,
        n_threads=n_threads,
    )


def _build_messages(history: list[dict], message: str, system_instruction: str) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = []
    if system_instruction:
        messages.append({'role': 'system', 'content': system_instruction})

    for item in history[-12:]:
        if not isinstance(item, dict):
            continue
        text = str(item.get('content', '')).strip()
        if not text:
            continue
        role = 'assistant' if item.get('role') == 'assistant' else 'user'
        messages.append({'role': role, 'content': text})

    messages.append({'role': 'user', 'content': message})
    return messages


def _prepare_completion(
    *,
    message: str,
    history: list[dict],
    server_bin: str,
    model_path: str,
    model_name: str,
    host: str,
    port: int,
    n_ctx: int,
    n_threads: int,
    max_new_tokens: int,
    system_instruction: str,
    stream: bool,
) -> tuple[str, dict]:
    base_url = _ensure_server(
        server_bin=server_bin,
        model_path=model_path,
        host=host,
        port=port,
        n_ctx=n_ctx,
        n_threads=n_threads,
    )
    payload = {
        'model': model_name,
        'messages': _build_messages(history, message, system_instruction),
        'max_tokens': max_new_tokens,
        'temperature': 0.7,
        'top_p': 0.9,
        'stream': stream,
    }
    return f'{base_url}/v1/chat/completions', payload


def stream_chat_reply(
    *,
    message: str,
    history: list[dict],
    server_bin: str,
    model_path: str,
    model_name: str,
    host: str = '127.0.0.1',
    port: int = 8081,
    n_ctx: int = 2048,
    n_threads: int = 6,
    max_new_tokens: int = 256,
    system_instruction: str = '',
) -> Iterator[str]:
    endpoint, payload = _prepare_completion(
        message=message,
        history=history,
        server_bin=server_bin,
        model_path=model_path,
        model_name=model_name,
        host=host,
        port=port,
        n_ctx=n_ctx,
        n_threads=n_threads,
        max_new_tokens=max_new_tokens,
        system_instruction=system_instruction,
        stream=True,
    )

    try:
        with requests.post(endpoint, json=payload, stream=True, timeout=120) as response:
            response.raise_for_status()
            for raw_line in response.iter_lines(chunk_size=1, decode_unicode=True):
                if not raw_line or not raw_line.startswith('data: '):
                    continue
                payload_text = raw_line[6:].strip()
                if payload_text == '[DONE]':
                    break
                try:
                    chunk = json.loads(payload_text)
                except json.JSONDecodeError:
                    continue
                choices = chunk.get('choices') or []
                if not choices:
                    continue
                delta = choices[0].get('delta', {}).get('content')
                if delta:
                    yield delta
    except requests.RequestException as exc:
        raise LocalLLMError(f'Local text generation failed ({model_name}): {exc}', status_code=500) from exc


def generate_chat_reply(
    *,
    message: str,
    history: list[dict],
    server_bin: str,
    model_path: str,
    model_name: str,
    host: str = '127.0.0.1',
    port: int = 8081,
    n_ctx: int = 2048,
    n_threads: int = 6,
    max_new_tokens: int = 256,
    system_instruction: str = '',
) -> dict[str, str]:
    endpoint, payload = _prepare_completion(
        message=message,
        history=history,
        server_bin=server_bin,
        model_path=model_path,
        model_name=model_name,
        host=host,
        port=port,
        n_ctx=n_ctx,
        n_threads=n_threads,
        max_new_tokens=max_new_tokens,
        system_instruction=system_instruction,
        stream=False,
    )

    try:
        response = requests.post(endpoint, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        raise LocalLLMError(f'Local text generation failed ({model_name}): {exc}', status_code=500) from exc

    choices = data.get('choices') or []
    reply_text = (choices[0].get('message', {}).get('content', '') if choices else '').strip()
    if not reply_text:
        raise LocalLLMError('Model returned an empty response.', status_code=500)

    return {
        'reply': reply_text,
        'model': model_name,
    }
