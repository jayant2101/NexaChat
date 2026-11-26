from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.routes.chat import chat_bp
from app.routes.health import health_bp


def create_app(config_object=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object)

    CORS(
        app,
        resources={r'/api/*': {'origins': app.config.get('CORS_ORIGINS', ['*'])}},
    )

    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')

    @app.errorhandler(404)
    def handle_not_found(_err):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(_err):
        return jsonify({'error': 'Method not allowed'}), 405

    return app
