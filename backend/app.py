from flask import Flask, request, jsonify
from flask_cors import CORS
from cryptography.fernet import Fernet
import firebase_admin
from firebase_admin import credentials, db
import os

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"*": {"origins": "*"}})

dir_path = os.path.dirname(os.path.realpath(__file__))
cred = credentials.Certificate(os.path.join(dir_path, "chat-13865-firebase-adminsdk-pr0k7-643d3e5eeb.json"))
firebase_admin.initialize_app(
    cred, {"databaseURL": "https://chat-13865-default-rtdb.europe-west1.firebasedatabase.app"}
)

# Assume FERNET_KEY is set in your environment variables
fernet_key = os.environ.get('FERNET_KEY')
if not fernet_key:
    raise ValueError("FERNET_KEY is not set in the environment variables.")
fernet = Fernet(fernet_key)

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
