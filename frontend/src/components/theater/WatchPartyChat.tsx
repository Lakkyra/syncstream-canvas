"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  user: { name: string; image: string };
  text: string;
  timestamp: number;
}

export function WatchPartyChat({ roomId, isFullscreen }: { roomId: string; isFullscreen: boolean }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to backend socket server
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.emit("join-room", roomId);

    socket.on("chat-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session?.user) return;

    socketRef.current?.emit("chat-message", {
      roomId,
      user: {
        name: session.user.name || "Anonymous",
        image: session.user.image || "",
      },
      text: input,
    });
    setInput("");
  };

  if (isFullscreen) return null; // Hide in fullscreen as requested

  return (
    <div className="w-80 h-[calc(100vh-64px)] fixed right-0 top-16 border-l border-white/10 glass-panel flex flex-col bg-surface/50 backdrop-blur-xl z-40">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-geist font-semibold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">chat</span>
          Watch Party
        </h3>
        <span className="text-xs text-on-surface-variant px-2 py-1 bg-white/5 rounded-full">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
              {msg.user.image ? (
                <img src={msg.user.image} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs">{msg.user.name.charAt(0)}</div>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-white">{msg.user.name}</span>
                <span className="text-[10px] text-on-surface-variant">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-on-surface mt-1 break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <form onSubmit={sendMessage} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chat with party..."
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white/10 transition-all placeholder:text-on-surface-variant/50"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center text-primary disabled:text-white/20 disabled:cursor-not-allowed hover:bg-primary/20 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
