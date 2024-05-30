// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, provider } from "./firebase"; // Ensure correct import path
import { signInWithPopup } from "firebase/auth";
import LoginPromptModal from "./components/LoginPromptModal"; // Ensure correct import path

export default function Home() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);

  const handleChatNavigation = () => {
    if (user) {
      router.push('/chat');
    } else {
      setLoginPromptVisible(true); // Trigger login prompt
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setLoginPromptVisible(false); // Close login prompt on successful login
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const handleLoginPromptClose = () => {
    setLoginPromptVisible(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <h1 className="text-3xl font-bold mb-6">Welcome to the App</h1>
      <button onClick={handleChatNavigation} className="bg-blue-500 text-white p-3 rounded">
        Go to Chat
      </button>
      {loginPromptVisible && (
        <LoginPromptModal onClose={handleLoginPromptClose} onLogin={handleLogin} />
      )}
    </div>
  );
}
