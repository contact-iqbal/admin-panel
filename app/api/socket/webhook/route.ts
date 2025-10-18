import { NextRequest, NextResponse } from "next/server";
import { ensureSocketServer, getSocketClient } from "@/lib/socket";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { from, message, user, is_from_me, type, data, mimetype, timestamp, quoted } = body;
  const id = Date.now();

  console.log("📥 Received message from webhook:", {
    id,
    type,
    message,
    hasData: !!data,
    mimetype,
    quoted,
  });

  // ✅ Emit to connected clients
  let socket;
  if (process.env.VERCEL === "1") {
    // Production: use Railway Socket.IO client
    socket = getSocketClient();
  } else {
    // Local dev: start/get local server
    const ioInstance = ensureSocketServer();
    socket = ioInstance!;
  }

  socket.emit("new_message", {
    id,
    user,
    from,
    type: type || "text",
    message: message || null,
    data: data || null,
    mimetype: mimetype || null,
    quoted: quoted || null,
    timestamp: timestamp || new Date(),
    is_from_me,
  });

  // ✅ Save message to chat store
  await fetch(`${process.env.BASE_URL}/api/admin/chat/store`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      user,
      from,
      type,
      message,
      data,
      mimetype,
      quoted,
      timestamp,
      is_from_me,
    }),
  });

  console.log("📤 Emitted and stored message");

  return NextResponse.json({ success: true });
}
