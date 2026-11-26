# NovaChat Backend (Flask + Local llama.cpp GGUF)

Modular Python Flask REST API running a 4-bit quantized local open-source model (`Qwen/Qwen2.5-1.5B-Instruct-GGUF`) using `llama.cpp` (`llama-server.exe`) with live SSE token streaming.

## Project Structure

```text
Backend/
├── .env
├── .gitignore
├── download_model.py               # Downloads Qwen2.5-1.5B-Instruct Q4_K_M GGUF (~1 GB)
├── requirements.txt
├── run.py                          # Starts local llama-server + Flask on port 8000
├── bin/llama-cpp/                  # llama.cpp Windows CPU binaries (ignored by git)
├── models/                         # Local GGUF model file (ignored by git)
├── app/
│   ├── __init__.py                 # Flask app factory, CORS, error handlers
│   ├── config.py                   # Model path, CPU threads, context, and CORS config
│   ├── routes/
│   │   ├── health.py               # GET /api/health
│   │   └── chat.py                 # POST /api/chat and POST /api/chat/stream (SSE)
│   └── services/
│       └── local_llm_service.py    # Manages local llama-server & SSE streaming
└── tests/
    └── test_chat_api.py            # Pytest API & streaming tests
```

## Setup & Run

```powershell
cd "c:\Users\basak\Desktop\College Project\chatbot\Backend"
.\venv\Scripts\python.exe run.py
```

The API listens on `http://127.0.0.1:8000`:
- `GET /api/health` — status, GGUF availability, thread count, and server state
- `POST /api/chat` — full JSON response `{ conversation_id, reply, model }`
- `POST /api/chat/stream` — Server-Sent Events (`text/event-stream`) token stream

## Run Tests

```powershell
.\venv\Scripts\python.exe -m pytest -v
```
