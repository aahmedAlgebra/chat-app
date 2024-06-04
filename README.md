# Chat Application

This is a simple chat application built using Next.js with TypeScript, Tailwind CSS, and Firebase for the frontend, and Flask with Firebase Realtime Database for the backend. It supports user registration, login, and real-time messaging.

## Features

- User registration and login
- Real-time messaging
- Dark mode support
- User authentication
- Secure message encryption

## Technologies Used

- Frontend: Next.js, Tailwind CSS
- Backend: Flask, Firebase Realtime Database
- Authentication: Custom email and password authentication
- Message Encryption: Fernet (from `cryptography` library)

## Installation

### Prerequisites

- Node.js and npm
- Python and pip
- Firebase account and project

### Frontend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/aahmedAlgebra/chat-app.git
    cd chat-app
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure Firebase:
    - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable Firebase Realtime Database.
    - Download the `firebaseConfig` object from the Firebase Console and add it to `firebase.ts`.

4. Create a `firebase.ts` file in the root directory with the following content:
    ```typescript
    // firebase.ts
    import { initializeApp } from 'firebase/app';
    import { getAuth, GoogleAuthProvider  } from "firebase/auth";
    import { getDatabase, ref, onValue, set, push, get } from 'firebase/database';

    const firebaseConfig = {
      apiKey: "xxxx",
      authDomain: "xxxx",
      projectId: "xxxx",
      storageBucket: "xxxx",
      messagingSenderId: "xxxx",
      appId: "xxxx",
      measurementId: "xxxx",
      databaseURL: "xxxx"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getDatabase(app);

    export { db, auth, provider, set, get, ref, onValue, push };
    ```

5. Create a `.env` file in the root directory with the following content:
    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

    # Firebase Admin SDK
    FIREBASE_JSON=zzz.json

    #  Database URL
    DATABASE_URL=zzz
    ```

6. Run the frontend:
    ```bash
    npm run dev
    ```

### Backend Setup

1. Create a virtual environment:
    ```bash
    python -m venv myvenv
    myvenv/Scripts/activate
    ```

2. Install dependencies:
    ```bash
    pip install Flask flask-cors cryptography firebase-admin bcrypt
    ```

3. Configure Firebase Admin SDK:
    - Go to the Firebase Console and generate a new private key under Project Settings -> Service Accounts.
    - Download the JSON file and place it in the backend directory.
    - Update the path to this JSON file in your `.env` file.

4. Generate and set the Fernet key:
    - Run the `fernet.py` script to generate the Fernet key and set it as an environment variable:
      ```bash
      python fernet.py
      ```

5. Run the backend:
    ```bash
    python app.py
    ```

### Firebase Database Rules

Update your Firebase Realtime Database rules to include indexing on the email field:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "users": {
      ".indexOn": ["email"]
    }
  }
}
```

## Usage

1. Open the frontend application in your browser.
2. Register a new user.
3. Log in with the registered user.
4. Start chatting with other users.

## Contributing

Feel free to submit issues and pull requests for new features, bug fixes, and improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.