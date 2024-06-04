"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Correcting the import
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database'; // Assuming correct imports based on your setup
import { Message, User } from '../types';

export default function Chat() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadUsers = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.log("No stored user found, redirecting to login.");
        router.push("/login");
        return;
      }
      
      const currentUser = JSON.parse(storedUser);
      const usersRef = ref(db, "users");

      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          console.log("No users data found in Firebase.");
          return;
        }
        
        const usersList = Object.keys(data)
          .map((key) => ({ ...data[key], id: key }))
          .filter((user) => user.email !== currentUser.email);

        console.log("Users loaded:", usersList);
        setUsers(usersList);
      }, (error) => {
        console.error("Firebase error fetching users:", error);
      });
    };

    loadUsers();
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-1/4 p-4 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Users
        </h2>
        {users.map((user) => (
          <div key={user.id} className="p-2 cursor-pointer">
            {user.displayName}
          </div>
        ))}
      </div>
      <div className="flex-1"> {/* Rest of your chat component code */} </div>
    </div>
  );
}
