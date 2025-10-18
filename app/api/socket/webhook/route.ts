import { NextRequest, NextResponse } from "next/server";
import { io, ensureSocketServer } from "@/lib/socket";

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

  // ✅ Ensure Socket.IO is running
  let ioInstance = io;
  if (!ioInstance) {
    console.warn("⚠️ No active Socket.IO instance, starting one...");
    ioInstance = ensureSocketServer();
  }

  // ✅ Emit to connected clients
  ioInstance.emit("new_message", {
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
  await fetch(`http://localhost:3000/api/admin/chat/store`, {
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
