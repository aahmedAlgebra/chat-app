// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
import { getDatabase, ref, onValue, set, push, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBUBDtpuKqcHyV-3nNyGnSUtidMwZ5NJmI",
  authDomain: "chat-13865.firebaseapp.com",
  projectId: "chat-13865",
  storageBucket: "chat-13865.appspot.com",
  messagingSenderId: "912355852337",
  appId: "1:912355852337:web:5e5c0a2b5c018745d3d510",
  measurementId: "G-6REKVTXKET",
  databaseURL: "https://chat-13865-default-rtdb.europe-west1.firebasedatabase.app"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

export { db, auth, provider, set, get,  ref, onValue, push };
