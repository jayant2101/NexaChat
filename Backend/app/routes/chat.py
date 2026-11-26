import json
from flask import Blueprint, Response, current_app, jsonify, request, stream_with_context

from app.services.local_llm_service import LocalLLMError, generate_chat_reply, stream_chat_reply

chat_bp = Blueprint('chat', __name__)


def _parse_chat_payload():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return None, (jsonify({'detail': 'Request body must be valid JSON.'}), 400)

    message = payload.get('message')
    if not isinstance(message, str) or not message.strip():
        return None, (jsonify({'detail': 'Field "message" must be a non-empty string.'}), 400)

    history = payload.get('history') or []
    if not isinstance(history, list):
        return None, (jsonify({'detail': 'Field "history" must be a list.'}), 400)

    return {
        'conversation_id': payload.get('conversation_id'),
        'message': message.strip(),
        'history': history,
    }, None


def _llm_kwargs():
    return {
        'server_bin': current_app.config.get('LLAMA_SERVER_BIN', ''),
        'model_path': current_app.config.get('LOCAL_MODEL_PATH', ''),
        'model_name': current_app.config.get('LOCAL_MODEL_FILE', 'qwen2.5-1.5b-instruct-q4_k_m.gguf'),
        'host': current_app.config.get('LLAMA_SERVER_HOST', '127.0.0.1'),
        'port': current_app.config.get('LLAMA_SERVER_PORT', 8081),
        'n_ctx': current_app.config.get('LLM_CTX_SIZE', 2048),
        'n_threads': current_app.config.get('LLM_THREADS', 6),
        'max_new_tokens': current_app.config.get('MAX_NEW_TOKENS', 256),
        'system_instruction': current_app.config.get('SYSTEM_INSTRUCTION', ''),
    }


@chat_bp.post('/chat')
def chat():
    parsed, error_response = _parse_chat_payload()
    if error_response is not None:
        return error_response

    try:
        result = generate_chat_reply(
            message=parsed['message'],
            history=parsed['history'],
            **_llm_kwargs(),
        )
    except LocalLLMError as exc:
        return jsonify({'detail': str(exc)}), exc.status_code

    return jsonify(
        {
            'conversation_id': parsed['conversation_id'],
            'reply': result['reply'],
            'model': result['model'],
        }
    ), 200


@chat_bp.post('/chat/stream')
def chat_stream():
    parsed, error_response = _parse_chat_payload()
    if error_response is not None:
        return error_response

    kwargs = _llm_kwargs()
    model_name = kwargs['model_name']

    def event_stream():
        try:
            for delta in stream_chat_reply(
                message=parsed['message'],
                history=parsed['history'],
                **kwargs,
            ):
                yield f'data: {json.dumps({"delta": delta})}\n\n'
            yield f'data: {json.dumps({"done": True, "model": model_name})}\n\n'
        except LocalLLMError as exc:
            yield f'data: {json.dumps({"error": str(exc)})}\n\n'

    return Response(
        stream_with_context(event_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        },
    )
