import { NextRequest, NextResponse } from "next/server";
import { ensureSocketServer } from "@/lib/socket";

export async function GET(req: NextRequest) {
  ensureSocketServer();
  return NextResponse.json({ success: true, message: "Socket.IO server active" });
}

export { ensureSocketServer };
