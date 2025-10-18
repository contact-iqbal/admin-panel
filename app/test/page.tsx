"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ChatTestPage() {
    const [messages, setMessages] = useState<
        { from: string; message: string; timestamp: string }[]
    >([]);

    useEffect(() => {
        const socket = io("http://localhost:3001", {
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            console.log("🟢 Connected to Socket.IO:", socket.id);
        });

        socket.on("new_message", (data) => {
            console.log("📡 Received event: new_message", data);
            setMessages((prev) => [...prev, data]);
        });

        socket.on("disconnect", () => {
            console.log("🔴 Disconnected from Socket.IO");
        });

        // ✅ Return a cleanup function, not the socket itself
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-4">📨 Live Chat Test</h1>

            {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet...</p>
            ) : (
                <ul className="space-y-2">
                    {messages.map((m, i) => (
                        <li key={i} className="p-3 border rounded-lg shadow">
                            <p><b>From:</b> {m.from}</p>
                            <p><b>Message:</b> {m.message}</p>
                            <p className="text-sm text-gray-500">{m.timestamp}</p>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
