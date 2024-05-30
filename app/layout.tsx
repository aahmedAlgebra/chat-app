// app/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from 'next/link';
import "./globals.css";
import { useRouter, usePathname } from 'next/navigation';
import { auth, provider } from "./firebase"; // Ensure correct import path
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import LoginPromptModal from "./components/LoginPromptModal"; // Ensure correct import path

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<any>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setDropdownVisible(false); // Close dropdown on logout
        if (pathname === "/chat") {
          router.push('/');
          setLoginPromptVisible(true);
        }
      }
    });

    return () => unsubscribe();
  }, [pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setDropdownVisible(false); // Close dropdown on login
      setLoginPromptVisible(false); // Close login prompt on successful login
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownVisible(false); // Close dropdown on logout
      router.push('/');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  const handleLoginPromptClose = () => {
    setLoginPromptVisible(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <html lang="en">
      <body className={inter.className} onClick={closeDropdown}>
        <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
          <div>
            <Link href="/" className="mr-4">Home</Link>
          </div>
          <div className="flex items-center">
            <button onClick={toggleTheme} className="bg-gray-500 text-white p-2 rounded mr-4">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                  onClick={toggleDropdown}
                />
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">Login with Google</button>
            )}
          </div>
        </nav>
        {loginPromptVisible && (
          <LoginPromptModal onClose={handleLoginPromptClose} onLogin={handleLogin} />
        )}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
