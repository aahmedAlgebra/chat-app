from flask import Flask, request, jsonify
from flask_cors import CORS
from cryptography.fernet import Fernet
import firebase_admin
from firebase_admin import credentials, db
import bcrypt
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"*": {"origins": "*"}})

dir_path = os.path.dirname(os.path.realpath(__file__))
firebase_credentials_path = os.getenv("FIREBASE_JSON")
firebase_database_url = os.getenv("DATABASE_URL")

# Check if environment variables are set
if not firebase_credentials_path:
    raise ValueError("FIREBASE_CREDENTIALS is not set in the environment variables.")
if not firebase_database_url:
    raise ValueError("FIREBASE_DATABASE_URL is not set in the environment variables.")

cred = credentials.Certificate(os.path.join(dir_path, firebase_credentials_path))
firebase_admin.initialize_app(
    cred, {"databaseURL": firebase_database_url}
)

# Assume FERNET_KEY is set in your environment variables
fernet_key = os.environ.get('FERNET_KEY')
if not fernet_key:
    raise ValueError("FERNET_KEY is not set in the environment variables.")
fernet = Fernet(fernet_key)

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        email = data["email"]
        password = data["password"]
        display_name = data.get("displayName", email.split("@")[0])
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_ref = db.reference("users").order_by_child("email").equal_to(email).get()
        if user_ref:
            return jsonify({"error": "User already exists"}), 400
        
        new_user_ref = db.reference("users").push({
            "email": email,
            "password": hashed_password.decode('utf-8'),
            "displayName": display_name,
        })
        
        # Retrieve the user details to return
        user_id = new_user_ref.key
        user_data = {
            "uid": user_id,
            "email": email,
            "displayName": display_name,
        }
        
        return jsonify({"status": "success", "user": user_data}), 200
    except Exception as e:
        app.logger.error(f"Error in register: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data["email"]
        password = data["password"]
        
        user_ref = db.reference("users").order_by_child("email").equal_to(email).get()
        if not user_ref:
            return jsonify({"error": "User does not exist"}), 400
        
        user = list(user_ref.values())[0]
        if bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
            return jsonify({
                "status": "success",
                "uid": list(user_ref.keys())[0],
                "email": user["email"],
                "displayName": user["displayName"],
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 400
    except Exception as e:
        app.logger.error(f"Error in login: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/send_message", methods=["POST"])
def send_message():
    try:
        data = request.json
        app.logger.debug(f"Received data: {data}")
        sender = data["sender"]
        recipient = data["recipient"]
        message = data["message"]
        encrypted_message = fernet.encrypt(message.encode()).decode()
        app.logger.debug(f"Encrypted message: {encrypted_message}")

        ref = db.reference("messages")
        ref.push({"sender": sender, "recipient": recipient, "message": encrypted_message})

        return jsonify({"status": "success"}), 200
    except Exception as e:
        app.logger.error(f"Error in send_message: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/receive_messages", methods=["POST"])
def receive_messages():
    try:
        data = request.json
        app.logger.debug(f"Received data: {data}")
        recipient = data["recipient"]

        ref = db.reference("messages")
        all_messages = ref.get()

        decrypted_messages = []
        if all_messages:
            for key, value in all_messages.items():
                if value["recipient"] == recipient or value["sender"] == recipient:
                    decrypted_message = fernet.decrypt(value["message"].encode()).decode()
                    decrypted_messages.append({
                        "sender": value["sender"],
                        "recipient": value["recipient"],
                        "message": decrypted_message,
                    })
        app.logger.debug(f"Decrypted messages: {decrypted_messages}")
        return jsonify(decrypted_messages), 200
    except Exception as e:
        app.logger.error(f"Error in receive_messages: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
