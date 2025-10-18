'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface ChatMessage {
  mimetype: any;
  data: boolean;
  id: number;
  from: string;
  message: string;
  quoted?: string;
  type: string;
  timestamp: Date;
  is_from_me: boolean;
  status?: "sent" | "delivered" | "read";
}


interface ChatSession {
  phone: string;
  name: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activePhone, setActivePhone] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch("/api/admin/chat/store");
      const history = await res.json();
      console.log("activephone: ", activePhone)
      setMessages(history.messages.map((m: { from: string; }) => ({
        ...m,
        from: m.from.split("@")[0],
      })));

      setSessions(history.sessions.map((s: { phone: string; }) => ({
        ...s,
        phone: s.phone.split("@")[0],
      })));
    };
    fetchHistory();
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [activePhone]);
  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to Socket.IO server:", socket.id);
    });

    socket.on("new_message", (msg) => {
      console.log("📡 new_message payload:", msg);

      if (!msg?.from) {
        console.warn("⚠️ 'from' not found in new_message payload");
        return;
      }

      const from = msg.from.split("@")[0];

      setActivePhone((prev) => prev || from);

      setSessions((prev) => {
        const existing = prev.find((s) => s.phone === from);

        let preview = msg.message;
        if (msg.type === "sticker") preview = "🖼️ [Sticker]";
        if (msg.type === "image") preview = "📷 [Image]";

        if (existing) {
          return prev.map((s) =>
            s.phone === from
              ? {
                ...s,
                lastMessage: preview,
                lastMessageTime: new Date(msg.timestamp),
                unreadCount:
                  from === activePhone
                    ? 0 
                    : s.unreadCount + 1, 
              }
              : s
          );
        } else {
          return [
            ...prev,
            {
              phone: from,
              name: msg.user,
              lastMessage: preview,
              lastMessageTime: new Date(msg.timestamp),
              unreadCount: from === activePhone ? 0 : 1,
            },
          ];
        }
      });

      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          id: Date.now(),
          from,
          type: msg.type,
          data: msg.data,
          timestamp: msg.timestamp,
          is_from_me: msg.is_from_me,
        },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSelectSession = (phone: string) => {
    setActivePhone(phone);
    setSessions((prev) =>
      prev.map((s) =>
        s.phone === phone
          ? { ...s, unreadCount: 0 } 
          : s
      )
    );
    fetch("/api/admin/chat/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "update_session",
        phone: `${phone}@s.whatsapp.net`,
        unreadCount: 0,
      }),
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePhone) return;

    const message: ChatMessage = {
      id: Date.now(),
      from: 'admin',
      message: newMessage,
      timestamp: new Date(),
      is_from_me: true,
      status: 'sent',
      type: 'text',
      mimetype: undefined,
      data: false
    };

    console.log('📤 Mengirim pesan ke', activePhone, ':', message);

    setMessages([...messages, message]);
    setNewMessage('');

    setSessions((prev) =>
      prev.map((s) =>
        s.phone === activePhone
          ? { ...s, lastMessage: message.message, lastMessageTime: message.timestamp }
          : s
      )
    );

    try {
      const response = await fetch('/api/admin/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: activePhone,
          message: newMessage,
        }),
      });

      const data = await response.json();
      console.log('✅ Response dari API:', data);
    } catch (error) {
      console.error('❌ Error mengirim pesan:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-[calc(100vh-180px)] md:h-[calc(100vh-125px)]">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-col max-h-48 md:max-h-full">
            <div className="bg-green-600 dark:bg-green-700 text-white p-3 md:p-4">
              <h2 className="text-base md:text-lg font-semibold flex items-center">
                <i className="fa-brands fa-whatsapp mr-2 text-lg md:text-xl"></i>
                WhatsApp Chat
              </h2>
              <p className="text-xs md:text-sm text-green-100 dark:text-green-200 mt-1">
                {sessions.length} percakapan aktif
              </p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none">
              {sessions.length === 0 ? (
                <div className="p-4 md:p-8 text-center text-gray-500 dark:text-gray-400">
                  <i className="fa-regular fa-comments text-2xl md:text-4xl mb-2"></i>
                  <p className="text-sm md:text-base">Belum ada pesan</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.phone}
                    onClick={() => handleSelectSession(session.phone)}
                    className={`p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${activePhone === session.phone ? 'bg-green-50 dark:bg-green-900' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h3 className="font-semibold text-sm md:text-base text-gray-800 dark:text-white truncate">{session.name}</h3>
                          {session.unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 md:py-1 font-bold shrink-0">
                              {session.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{session.phone}</p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {session.lastMessage}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(session.lastMessageTime).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col h-full">
            {!activePhone ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-4">
                <div className="text-center">
                  <i className="fa-regular fa-comment-dots text-4xl md:text-6xl mb-2 md:mb-4"></i>
                  <p className="text-sm md:text-lg">Pilih percakapan untuk memulai chat</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm md:text-base text-gray-800 dark:text-white truncate">
                        {sessions.find((s) => s.phone === activePhone)?.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{activePhone}</p>
                    </div>
                    <button className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition ml-2 shrink-0">
                      <i className="fa-solid fa-ellipsis-v text-sm md:text-base"></i>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 dark:bg-gray-900 scrollbar-none">
                  {messages
                    .filter((m) => m.from === activePhone)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-3 md:mb-4 flex ${msg.is_from_me ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg ${msg.is_from_me
                            ? "bg-green-500 dark:bg-green-600 text-white"
                            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                            }`}
                        >
                          {msg.quoted && (
                            <div className="text-xs text-gray-500 border-l-2 border-gray-300 pl-2 mb-1">
                              {msg.quoted}
                            </div>
                          )}

                          {msg.type === "image" && msg.data ? (
                            <><img
                              src={`data:${msg.mimetype};base64,${msg.data}`}
                              alt="received"
                              className="max-w-xs rounded" /><p className="text-xs md:text-sm whitespace-pre-wrap break-words">
                                {msg.message}
                              </p></>
                          ) : msg.type === "sticker" && msg.data ? (
                            <img
                              src={`data:image/webp;base64,${msg.data}`}
                              alt="sticker"
                              className="w-24 h-24 object-contain rounded"
                            />
                          ) : (
                            <p className="text-xs md:text-sm whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1">
                            <p
                              className={`text-xs ${msg.is_from_me
                                ? "text-green-100 dark:text-green-200"
                                : "text-gray-500 dark:text-gray-400"
                                }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {msg.is_from_me && (
                              <span className="text-xs text-green-100 dark:text-green-200">
                                {msg.status === "read" && "✓✓"}
                                {msg.status === "delivered" && "✓✓"}
                                {msg.status === "sent" && "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik pesan..."
                      className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg px-4 md:px-6 py-2 md:py-3 transition shrink-0"
                    >
                      <i className="fa-solid fa-paper-plane text-sm md:text-base"></i>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
