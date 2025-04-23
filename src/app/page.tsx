"use client";

import { useLogger } from "@/lib/logger/LoggerContext";
import { useSocket } from "@/lib/SocketContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Message {
  id: number;
  user: string;
  content: string;
  createdAt: string;
}

export default function Home() {
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [user, setUser] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { socket, isConnected } = useSocket();
  const logger = useLogger();

  const queryClient = useQueryClient();

  const {
    data: messages = [],
    error,
    refetch,
    isLoading: isLoadingMessages,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await fetch("/api/messages");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch messages: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    },
    retry: false,
  });

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingMessages) {
      return;
    }

    try {
      setIsSendingMessage(true);
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
      } else {
        toast.error("Error sending message");
      }
    } catch (error) {
      toast.error("Error sending message");
      logger.error("Error sending message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
      document.documentElement.setAttribute("data-theme", savedTheme);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = prefersDark ? "dark" : "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on("receive-message", (message: Message) => {
      queryClient.setQueryData(["messages"], (prevMessages: Message[]) => {
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

    socket.on("error", (error: Error) => {
      logger.error("Socket error:", error);
      toast.error("Error connecting to server");
    });

    socket.on("reconnect", () => {
      refetch();
    });

    return () => {
      socket.off("receive-message");
      socket.off("error");
      socket.off("reconnect");
    };
  }, [logger, queryClient, socket, refetch]);

  return (
    <main className="flex min-h-[100dvh] w-full flex-col items-center">
      {error ? (
        <div>{error.message}</div>
      ) : (
        <div className="w-full max-w-2xl flex flex-col h-[100dvh] py-4">
          <div className="flex justify-between items-center mb-4 flex-none">
            <h1 className="text-2xl font-bold">Chat App</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs">🌞</span>
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={theme === "dark"}
                onChange={toggleTheme}
                aria-label={`Switch to ${
                  theme === "light" ? "dark" : "light"
                } mode`}
              />
              <span className="text-xs">🌙</span>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 flex-none">
            <label className="input flex-1">
              <span className="label">Name: </span>
              <input
                type="text"
                placeholder="Enter your name"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </label>
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            ></div>
          </div>

          <div className="border rounded-lg p-4 overflow-y-auto flex-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  "chat " + (message.user === user ? "chat-end" : "chat-start")
                }
              >
                <div className="chat-header">{message.user}:</div>
                <div className="chat-bubble">{message.content}</div>
                <div className="chat-footer">
                  {new Date(message.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 flex-none mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 input"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSendingMessage || !newMessage.trim() || !user.trim() || isLoadingMessages}
              title={
                isSendingMessage
                  ? "Sending..."
                  : !newMessage.trim() || !user.trim()
                  ? "Enter a message and your name"
                  : undefined
              }
            >
              Send
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
