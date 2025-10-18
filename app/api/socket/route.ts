import { NextResponse } from "next/server";
import { ensureSocketServer } from "@/lib/socket";

export async function GET() {
  const io = ensureSocketServer();

  if (io) {
    return NextResponse.json({
      success: true,
      message: "✅ Local Socket.IO server active on port 3001",
    });
  } else {
    return NextResponse.json({
      success: true,
      message: "♻️ Running on Vercel — no local Socket.IO server",
    });
  }
}
