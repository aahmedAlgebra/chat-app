"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Link from 'next/link';
import "./globals.css";
import { useRouter, usePathname } from 'next/navigation';
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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
      setDropdownVisible(false); // Close dropdown on logout
      if (pathname === "/chat") {
        router.push('/');
        setLoginPromptVisible(true);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setDropdownVisible(false); // Close dropdown on logout
    router.push('/');
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
                <div
                  className="w-8 h-8 rounded-full cursor-pointer bg-gray-400 flex items-center justify-center"
                  onClick={toggleDropdown}
                >
                  <span className="text-white">{user.displayName ? user.displayName[0] : "U"}</span>
                </div>
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
              <div>
                <Link href="/login" className="bg-blue-500 text-white p-2 rounded mr-4">Login</Link>
                <Link href="/register" className="bg-green-500 text-white p-2 rounded">Register</Link>
              </div>
            )}
          </div>
        </nav>
        {loginPromptVisible && (
          <LoginPromptModal onClose={handleLoginPromptClose} />
        )}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
