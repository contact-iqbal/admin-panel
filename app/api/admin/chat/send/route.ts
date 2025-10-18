import { NextRequest, NextResponse } from 'next/server';
import { io } from "socket.io-client";
import axios from "axios";

let socket: any;
if (!socket) {
  socket = io("http://localhost:3001", { transports: ["websocket"] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Parameter to dan message wajib diisi' },
        { status: 400 }
      );
    }
    console.log('📤 API: Mengirim pesan WhatsApp');
    console.log('   Tujuan:', to);
    console.log('   Pesan:', message);
    console.log('   Timestamp:', new Date().toISOString());
    await axios.post("http://localhost:4000/send-message", { to, message });

    // socket.emit("new_message", {
    //   from: to,
    //   message,
    //   timestamp: new Date(),
    //   is_from_me: true,
    //   status: "sent",
    // });

    // const response = {
    //   success: true,
    //   message: 'Pesan berhasil dikirim (console)',
    //   data: {
    //     to,
    //     message,
    //     timestamp: new Date().toISOString(),
    //     messageId: `msg_${Date.now()}`,
    //   },
    // };

    // console.log('✅ API: Response:', response);

    // return NextResponse.json(response);
    return NextResponse.json({
      success: true,
      message: "Pesan sedang dikirim",
      data: { to, message, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim pesan' },
      { status: 500 }
    );
  }
}
