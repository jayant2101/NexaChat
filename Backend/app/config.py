import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env', override=True)

DEFAULT_MODEL_REPO = 'Qwen/Qwen2.5-1.5B-Instruct-GGUF'
DEFAULT_MODEL_FILE = 'qwen2.5-1.5b-instruct-q4_k_m.gguf'
DEFAULT_MODEL_PATH = BASE_DIR / 'models' / DEFAULT_MODEL_FILE
DEFAULT_LLAMA_SERVER_BIN = BASE_DIR / 'bin' / 'llama-cpp' / 'llama-server.exe'


def _resolve_path(env_key: str, default_path: Path) -> str:
    raw = os.getenv(env_key, '').strip()
    if not raw:
        return str(default_path)
    candidate = Path(raw)
    if not candidate.is_absolute():
        candidate = (BASE_DIR / candidate).resolve()
    return str(candidate)


def _default_threads() -> int:
    cpu_count = os.cpu_count() or 6
    return max(4, min(cpu_count // 2 if cpu_count >= 8 else cpu_count, 8))


class Config:
    LOCAL_MODEL_REPO: str = os.getenv('LOCAL_MODEL_REPO', DEFAULT_MODEL_REPO).strip() or DEFAULT_MODEL_REPO
    LOCAL_MODEL_FILE: str = os.getenv('LOCAL_MODEL_FILE', DEFAULT_MODEL_FILE).strip() or DEFAULT_MODEL_FILE
    LOCAL_MODEL_PATH: str = _resolve_path('LOCAL_MODEL_PATH', DEFAULT_MODEL_PATH)
    LLAMA_SERVER_BIN: str = _resolve_path('LLAMA_SERVER_BIN', DEFAULT_LLAMA_SERVER_BIN)
    LLAMA_SERVER_HOST: str = os.getenv('LLAMA_SERVER_HOST', '127.0.0.1').strip() or '127.0.0.1'
    LLAMA_SERVER_PORT: int = int(os.getenv('LLAMA_SERVER_PORT', '8081'))
    LLM_THREADS: int = int(os.getenv('LLM_THREADS', str(_default_threads())))
    LLM_CTX_SIZE: int = int(os.getenv('LLM_CTX_SIZE', '2048'))
    MAX_NEW_TOKENS: int = int(os.getenv('MAX_NEW_TOKENS', '256'))
    PRELOAD_MODEL: bool = os.getenv('PRELOAD_MODEL', 'true').lower() in ('1', 'true', 'yes')
    SYSTEM_INSTRUCTION: str = os.getenv(
        'SYSTEM_INSTRUCTION',
        'You are NovaChat, a helpful, concise, and accurate AI assistant.',
    )
    PORT: int = int(os.getenv('PORT', '8000'))
    DEBUG: bool = os.getenv('FLASK_DEBUG', 'true').lower() in ('1', 'true', 'yes')
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            'CORS_ORIGINS',
            'http://localhost:3000,http://127.0.0.1:3000',
        ).split(',')
        if origin.strip()
    ]
