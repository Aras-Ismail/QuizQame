import os
from datetime import timedelta
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from src.auth import auth_bp
from src.routes import quiz_bp
from src.shared import db
from src.models import User

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

app.config.update(
    SQLALCHEMY_DATABASE_URI='postgresql://quizuser:quizpass@db:5432/quizdb',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY='your-secret-key',
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=24)
)

jwt = JWTManager(app)
migrate = Migrate(app, db)
db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(quiz_bp)

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'msg': 'Token has expired', 'expired': True}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'msg': 'Invalid token', 'invalid': True}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'msg': 'Authorization token is required', 'missing': True}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Already registered'}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Registered'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "Username is incorrect"}), 401
    if not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Password is incorrect"}), 401

    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=24)
    )
    return jsonify({
        "access_token": access_token, 
        "user_id": user.id,
        "expires_in": 86400  
    }), 200

@app.route('/refresh-token', methods=['POST'])
@jwt_required()
def refresh_token():
    current_user_id = get_jwt_identity()
    new_token = create_access_token(
        identity=current_user_id,
        expires_delta=timedelta(hours=24)
    )
    return jsonify({
        'access_token': new_token,
        'expires_in': 86400
    }), 200

if __name__ == '__main__':
    if not os.path.exists('migrations'):
        with app.app_context():
            db.create_all()
    else:
        migrate.init_app(app, db)
    app.run(debug=True, host='0.0.0.0')