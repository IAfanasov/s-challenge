"use client";

import { useSocket } from "@/lib/SocketContext";
import { useEffect, useState } from "react";

interface Message {
  id: number;
  user: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const { socket, isConnected } = useSocket();

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user,
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("receive-message", (message: Message) => {
        setMessages((prevMessages) => {
          if (prevMessages.some((m) => m.id === message.id)) {
            return prevMessages;
          }

          // TODO prevMessages already sorted. insert message at the respective index instead of sorting again
          const updatedMessages = [...prevMessages, message].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          return updatedMessages;
        });
      });

      return () => {
        socket.off("receive-message");
      };
    }
  }, [socket]);

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Chat App</h1>

        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter your name"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
            title={isConnected ? "Connected" : "Disconnected"}
          ></div>
        </div>

        <div className="border rounded-lg p-4 mb-4 h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-2">
              <strong>{message.user}: </strong>
              {message.content}
              <div className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
