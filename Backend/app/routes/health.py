from pathlib import Path
from flask import Blueprint, current_app, jsonify

from app.services.local_llm_service import is_model_loaded

health_bp = Blueprint('health', __name__)


@health_bp.get('/health')
def health_check():
    model_path = Path(current_app.config.get('LOCAL_MODEL_PATH', ''))
    host = current_app.config.get('LLAMA_SERVER_HOST', '127.0.0.1')
    port = current_app.config.get('LLAMA_SERVER_PORT', 8081)

    return jsonify(
        {
            'status': 'ok',
            'model': current_app.config.get('LOCAL_MODEL_FILE'),
            'model_path': str(model_path),
            'model_downloaded': model_path.exists(),
            'model_loaded': is_model_loaded(f'http://{host}:{port}'),
            'threads': current_app.config.get('LLM_THREADS'),
        }
    ), 200
