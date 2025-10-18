import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const STORE_FILE = path.join(process.cwd(), "chat_store.json");

// Load store from file
async function loadStore() {
    try {
        const data = await fs.readFile(STORE_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return { messages: [], sessions: [] }; // default if file not found
    }
}

// Save store to file
async function saveStore(store: any) {
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { id, user, from, type, message, data, mimetype, quoted, timestamp, is_from_me } = body;

    const store = await loadStore();

    const msg = {
        id: id || Date.now(),
        user,
        from,
        type,
        message,
        data,
        mimetype,
        quoted,
        timestamp,
        is_from_me,
    };
    store.messages.push(msg);

    const phone = from;
    const existing = store.sessions.find((s: any) => s.phone === phone);

    if (existing) {
        existing.lastMessage = type === "image" ? "[image]" : message;
        existing.lastMessageTime = timestamp;
        existing.unreadCount = is_from_me ? existing.unreadCount : existing.unreadCount + 1;
    } else {
        store.sessions.push({
            phone,
            name: user || phone,
            lastMessage: type === "image" ? "[image]" : message,
            lastMessageTime: timestamp,
            unreadCount: is_from_me ? 0 : 1,
        });
    }
    if (body.type === "update_session") {
        const store = await loadStore();
        const session = store.sessions.find((s: { phone: String; }) => s.phone === body.phone);
        if (session) session.unreadCount = body.unreadCount;
        await saveStore(store);
        return NextResponse.json({ success: true, sessions: store.sessions });
    }
    await saveStore(store);

    return NextResponse.json({ success: true, msg, sessions: store.sessions });
}

export async function GET() {
    const store = await loadStore();
    return NextResponse.json(store);
}
