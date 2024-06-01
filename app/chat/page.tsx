"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth, provider, set, get, ref, onValue, push } from "../firebase";
import { sendMessage as sendEncryptedMessage, receiveMessages } from "../api";
import { ApiMessage, Message, User } from "../types";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  async function loadMessages() {
    if (selectedUser && auth.currentUser) {
      try {
        const currentUserEmail = auth.currentUser.email!;
        const apiMessages: ApiMessage[] = await receiveMessages(selectedUser.email);
        console.log('Messages received:', apiMessages);

        const transformedMessages: Message[] = apiMessages
          .filter(msg => (msg.sender === selectedUser.email && msg.recipient === currentUserEmail) || 
                         (msg.sender === currentUserEmail && msg.recipient === selectedUser.email))
          .map(msg => ({
            text: msg.message,
            sender: msg.sender,
            displayName: msg.displayName,
            recipient: msg.recipient,
            timestamp: msg.timestamp
          }));

        setMessages(transformedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        if (!userSnapshot.exists()) {
          const userData: User = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || user.email!.split("@")[0],
            photoURL: user.photoURL || "",
          };
          await set(userRef, userData);
        }

        const usersRef = ref(db, "users");
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const currentUser = auth.currentUser;
            const usersList = Object.keys(data)
              .map((key) => data[key])
              .filter((user) => user.uid !== currentUser?.uid);
            setUsers(usersList);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    loadMessages();
  }, [selectedUser]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const messageData = {
      sender: currentUser.email!,
      recipient: selectedUser.email,
      message: input,
      displayName:
        currentUser.displayName ||
        currentUser.email!.split("@")[0] ||
        "Anonymous",
    };

    try {
      await sendEncryptedMessage(
        messageData.sender,
        messageData.recipient,
        messageData.message
      );
      console.log("Message sent successfully");
      setInput("");
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-1/4 p-4 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Users
        </h2>
        {users.map((user) => (
          <div
            key={user.uid}
            className={`p-2 cursor-pointer ${
              selectedUser?.uid === user.uid
                ? "bg-gray-300 dark:bg-gray-700"
                : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            {user.displayName}
          </div>
        ))}
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4">
          {selectedUser ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                {selectedUser.displayName}
              </h2>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`my-2 ${
                    msg.sender === auth.currentUser?.email
                      ? "self-end"
                      : "self-start"
                  }`}
                >
                  <div
                    className={`text-sm text-gray-500 dark:text-gray-400 mb-1 ${
                      msg.sender === auth.currentUser?.email
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {msg.displayName}
                  </div>
                  <div
                    className={`p-2 rounded max-w-xs ${
                      msg.sender === auth.currentUser?.email
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-300 dark:bg-gray-700 dark:text-white mr-auto"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={endOfMessagesRef}></div>
            </>
          ) : (
            <p className="text-gray-800 dark:text-gray-200">
              Select a user to start chatting
            </p>
          )}
        </div>
        {selectedUser && (
          <form
            onSubmit={sendMessage}
            className="flex p-4 bg-white dark:bg-gray-800"
          >
            <input
              type="text"
              className="flex-1 border rounded p-2 mr-2 text-black dark:text-white dark:bg-gray-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}