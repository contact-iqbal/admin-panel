import { NextRequest, NextResponse } from "next/server";
import { ensureSocketServer, getSocketClient, emitMessage } from "@/lib/socket";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { from, message, user, is_from_me, type, data, mimetype, timestamp, quoted } = body;
  const id = Date.now();

  console.log("📥 Received message from webhook:", {
    id,
    type,
    from,
    message,
    hasData: !!data,
    mimetype,
    quoted,
  });

  // ✅ Emit to connected clients
  let socket;
  if (process.env.VERCEL === "true") {
    console.log("HIT VERCEL")
    // Production: use Railway Socket.IO client
    socket = getSocketClient();
  } else {
    console.log("HIT LOCAL")
    // Local dev: start/get local server
    const ioInstance = ensureSocketServer();
    socket = ioInstance!;
  }

  emitMessage({
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
  await fetch(`${process.env.SOCKET_URL}/api/emit_message`, {
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

  console.log("📤 Emitted and stored message to");

  return NextResponse.json({ success: true });
}
