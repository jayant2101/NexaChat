from app import create_app
from app.services.local_llm_service import LocalLLMError, preload_model

app = create_app()

if __name__ == '__main__':
    if app.config.get('PRELOAD_MODEL'):
        try:
            print('Starting local llama-server with Q4_K_M GGUF model...')
            preload_model(
                server_bin=app.config['LLAMA_SERVER_BIN'],
                model_path=app.config['LOCAL_MODEL_PATH'],
                host=app.config['LLAMA_SERVER_HOST'],
                port=app.config['LLAMA_SERVER_PORT'],
                n_ctx=app.config['LLM_CTX_SIZE'],
                n_threads=app.config['LLM_THREADS'],
            )
            print('Local LLM server ready.')
        except LocalLLMError as exc:
            print(f'Warning: {exc}')

    app.run(
        host='127.0.0.1',
        port=app.config['PORT'],
        debug=app.config['DEBUG'],
        use_reloader=False,
        threaded=True,
    )
