from app import create_app
from app.config import Config
from app.services import local_llm_service


class TestConfig(Config):
    TESTING = True
    LOCAL_MODEL_FILE = 'qwen2.5-1.5b-instruct-q4_k_m.gguf'


def test_health_endpoint():
    app = create_app(TestConfig)
    client = app.test_client()

    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert data['model'] == 'qwen2.5-1.5b-instruct-q4_k_m.gguf'
    assert 'model_downloaded' in data
    assert 'model_loaded' in data


def test_chat_requires_message():
    app = create_app(TestConfig)
    client = app.test_client()

    response = client.post('/api/chat', json={'message': '   '})
    assert response.status_code == 400
    assert 'detail' in response.get_json()


def test_chat_returns_reply_with_mocked_local_llm(monkeypatch):
    def fake_generate_chat_reply(**kwargs):
        assert kwargs['message'] == 'Hello!'
        assert len(kwargs['history']) == 1
        return {'reply': 'Hi there from local GGUF!', 'model': kwargs['model_name']}

    monkeypatch.setattr('app.routes.chat.generate_chat_reply', fake_generate_chat_reply)

    app = create_app(TestConfig)
    client = app.test_client()

    response = client.post(
        '/api/chat',
        json={
            'conversation_id': 'chat_1',
            'message': 'Hello!',
            'history': [{'role': 'user', 'content': 'Previous prompt'}],
        },
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data == {
        'conversation_id': 'chat_1',
        'reply': 'Hi there from local GGUF!',
        'model': 'qwen2.5-1.5b-instruct-q4_k_m.gguf',
    }


def test_chat_stream_returns_sse_chunks(monkeypatch):
    def fake_stream_chat_reply(**_kwargs):
        yield 'Hello '
        yield 'world!'

    monkeypatch.setattr('app.routes.chat.stream_chat_reply', fake_stream_chat_reply)

    app = create_app(TestConfig)
    client = app.test_client()

    response = client.post('/api/chat/stream', json={'message': 'Hi', 'history': []})
    assert response.status_code == 200
    assert response.mimetype == 'text/event-stream'
    body = response.get_data(as_text=True)
    assert '"delta": "Hello "' in body
    assert '"delta": "world!"' in body
    assert '"done": true' in body


def test_build_messages_maps_roles():
    messages = local_llm_service._build_messages(
        history=[
            {'role': 'user', 'content': 'Hi'},
            {'role': 'assistant', 'content': 'Hello!'},
        ],
        message='How are you?',
        system_instruction='Be concise.',
    )

    assert messages == [
        {'role': 'system', 'content': 'Be concise.'},
        {'role': 'user', 'content': 'Hi'},
        {'role': 'assistant', 'content': 'Hello!'},
        {'role': 'user', 'content': 'How are you?'},
    ]
