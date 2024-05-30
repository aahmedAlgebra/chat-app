// components/LoginPromptModal.tsx
import React from 'react';

interface LoginPromptModalProps {
  onClose: () => void;
  onLogin: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ onClose, onLogin }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-lg">
        <h2 className="text-xl mb-4 dark:text-white">You need to log in to access the chat.</h2>
        <button onClick={onLogin} className="bg-blue-500 text-white p-2 rounded mr-4">Login with Google</button>
        <button onClick={onClose} className="bg-gray-500 text-white p-2 rounded">Close</button>
      </div>
    </div>
  );
};

export default LoginPromptModal;
