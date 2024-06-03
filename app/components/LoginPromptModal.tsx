// components/LoginPromptModal.tsx
import React from 'react';
import Link from 'next/link';

interface LoginPromptModalProps {
  onClose: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-lg">
        <h2 className="text-xl mb-4 dark:text-white">You need to log in to access the chat.</h2>
        <div className="flex space-x-4">
          <Link href="/login" className="bg-blue-500 text-white p-2 rounded" onClick={onClose}>Login</Link>
          <Link href="/register" className="bg-green-500 text-white p-2 rounded" onClick={onClose}>Register</Link>
        </div>
        <button onClick={onClose} className="bg-gray-500 text-white p-2 rounded mt-4">Close</button>
      </div>
    </div>
  );
};

export default LoginPromptModal;
