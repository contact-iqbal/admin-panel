import { NextRequest, NextResponse } from "next/server";
import { io as ClientIO, Socket } from "socket.io-client";
import axios from "axios";

let socket: Socket | null = null;

/**
 * Initialize socket connection (dual-mode)
 */
function getSocket(): Socket {
  if (socket) return socket;

  const url =
    process.env.VERCEL === "1"
      ? process.env.NEXT_PUBLIC_SOCKET_URL! // Railway in prod
      : "http://localhost:3001"; // local dev

  socket = ClientIO(url, { transports: ["websocket"] });

  socket.on("connect", () =>
    console.log("✅ Connected to Socket.IO server:", url)
  );
  socket.on("disconnect", () =>
    console.log("❌ Disconnected from Socket.IO server:", url)
  );

  return socket;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Parameter 'to' dan 'message' wajib diisi" },
        { status: 400 }
      );
    }

    console.log("📤 API: Mengirim pesan WhatsApp");
    console.log("   Tujuan:", to);
    console.log("   Pesan:", message);
    console.log("   Timestamp:", new Date().toISOString());

    await axios.post(`${process.env.WA_URL}/send-message`, { to, message });

    // Emit event to clients
    getSocket().emit("new_message", {
      from: to,
      message,
      timestamp: new Date(),
      is_from_me: true,
      status: "sent",
    });

    return NextResponse.json({
      success: true,
      message: "Pesan sedang dikirim",
      data: { to, message, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim pesan" },
      { status: 500 }
    );
  }
}
