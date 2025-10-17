'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: number;
  from: string;
  message: string;
  timestamp: Date;
  is_from_me: boolean;
  status?: 'sent' | 'delivered' | 'read';
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
    const demoSessions: ChatSession[] = [
      {
        phone: '6281234567890',
        name: 'Budi Santoso',
        lastMessage: 'Bagaimana cara daftar SPMB?',
        lastMessageTime: new Date(),
        unreadCount: 2,
      },
      {
        phone: '6281234567891',
        name: 'Ani Wijaya',
        lastMessage: 'Terima kasih atas informasinya',
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 0,
      },
    ];
    setSessions(demoSessions);
  }, []);

  const handleSelectSession = (phone: string) => {
    setActivePhone(phone);

    const demoMessages: ChatMessage[] = [
      {
        id: 1,
        from: phone,
        message: 'Halo, saya ingin bertanya tentang SPMB',
        timestamp: new Date(Date.now() - 7200000),
        is_from_me: false,
      },
      {
        id: 2,
        from: 'admin',
        message: 'Halo, silakan tanyakan apa yang ingin Anda ketahui',
        timestamp: new Date(Date.now() - 7000000),
        is_from_me: true,
        status: 'read',
      },
      {
        id: 3,
        from: phone,
        message: 'Bagaimana cara daftar SPMB?',
        timestamp: new Date(Date.now() - 3600000),
        is_from_me: false,
      },
    ];

    console.log(`📱 Membuka chat dengan ${phone}`, demoMessages);
    setMessages(demoMessages);

    setSessions((prev) =>
      prev.map((s) => (s.phone === phone ? { ...s, unreadCount: 0 } : s))
    );
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
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

            <div className="flex-1 overflow-y-auto">
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
                    className={`p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      activePhone === session.phone ? 'bg-green-50 dark:bg-green-900' : ''
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

          <div className="flex-1 flex flex-col min-h-0">
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

                <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 dark:bg-gray-900">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-3 md:mb-4 flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-lg ${
                          msg.is_from_me
                            ? 'bg-green-500 dark:bg-green-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <p
                            className={`text-xs ${
                              msg.is_from_me ? 'text-green-100 dark:text-green-200' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {msg.is_from_me && (
                            <span className="text-xs text-green-100 dark:text-green-200">
                              {msg.status === 'read' && '✓✓'}
                              {msg.status === 'delivered' && '✓✓'}
                              {msg.status === 'sent' && '✓'}
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
