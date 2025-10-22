// import { NextRequest, NextResponse } from "next/server";
// import { put } from "@vercel/blob";

// const BUCKET_NAME = "chat-storage";
// const FILE_NAME = "chat_store.json";

// const isVercel = process.env.VERCEL === "true";
// const LOCAL_FILE = "./chat_store.json";

// // Get public blob URL
// function getBlobUrl() {
//   return `https://ed5uvumrhqqw9cs3.public.blob.vercel-storage.com/${BUCKET_NAME}/${FILE_NAME}`;
// }

// // Load store
// // async function loadStore() {
// //   if (isVercel) {
// //     const fs = await import('fs/promises');
// //     // try {
// //     //   const res = await fetch(getBlobUrl());
// //     //   if (!res.ok) return { messages: [], sessions: [] };
// //     //   const text = await res.text();
// //     //   return JSON.parse(text);
// //     // } catch {
// //     //   return { messages: [], sessions: [] };
// //     // }
// //     try {
// //       const data = await fs.readFile(LOCAL_FILE, 'utf-8');
// //       return JSON.parse(data);
// //     } catch {
// //       return { messages: [], sessions: [] };
// //     }
// //   } else {
// //     try {
// //       const fs = await import("fs/promises");
// //       const data = await fs.readFile(LOCAL_FILE, "utf-8");
// //       return JSON.parse(data);
// //     } catch {
// //       return { messages: [], sessions: [] };
// //     }
// //   }
// // }
// async function loadStore() {
//   if (isVercel) {
//     try {
//       const res = await fetch(getBlobUrl());
//       if (!res.ok) return { messages: [], sessions: [] };
//       const text = await res.text();
//       return JSON.parse(text);
//     } catch {
//       return { messages: [], sessions: [] };
//     }
//   } else {
//     try {
//       const fs = await import("fs/promises");
//       const data = await fs.readFile(LOCAL_FILE, "utf-8");
//       return JSON.parse(data);
//     } catch {
//       return { messages: [], sessions: [] };
//     }
//   }
// }


// // Save store
// async function saveStore(store: any) {
//   const data = JSON.stringify(store, null, 2);
//   if (isVercel) {
//     await put(`${BUCKET_NAME}/${FILE_NAME}`, Buffer.from(data), {
//       access: "public",
//       contentType: "application/json",
//       allowOverwrite: true,
//     });
//   } else {
//     const fs = await import("fs/promises");
//     await fs.writeFile(LOCAL_FILE, data, "utf-8");
//   }
// }

// // POST — add message or update session
// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { id, user, from, type, message, data, mimetype, quoted, timestamp, is_from_me } = body;

//   const store = await loadStore();

//   if (body.type === "update_session") {
//     const session = store.sessions.find((s: any) => s.phone === body.phone);
//     if (session) session.unreadCount = body.unreadCount;
//     await saveStore(store);
//     return NextResponse.json({ success: true, sessions: store.sessions });
//   }

//   const msg = {
//     id: id || Date.now(),
//     user,
//     from,
//     type,
//     message,
//     data,
//     mimetype,
//     quoted,
//     timestamp,
//     is_from_me,
//   };
//   store.messages.push(msg);

//   const phone = from;
//   const existing = store.sessions.find((s: any) => s.phone === phone);

//   if (existing) {
//     existing.lastMessage = type === "image" ? "[image]" : message;
//     existing.lastMessageTime = timestamp;
//     existing.unreadCount = is_from_me ? existing.unreadCount : existing.unreadCount + 1;
//   } else {
//     store.sessions.push({
//       phone,
//       name: user || phone,
//       lastMessage: type === "image" ? "[image]" : message,
//       lastMessageTime: timestamp,
//       unreadCount: is_from_me ? 0 : 1,
//     });
//   }

//   await saveStore(store);
//   return NextResponse.json({ success: true, msg, sessions: store.sessions });
// }

// // GET — retrieve store
// export async function GET() {
//   const store = await loadStore();
//   return NextResponse.json(store);
// }
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verifyToken } from "@/lib/auth";

const BUCKET_NAME = "chat-storage";
const FILE_NAME = "chat_store.json";

const isVercel = process.env.VERCEL === "true";
const LOCAL_FILE = "./chat_store.json";

// In-memory store and flush queue
let inMemoryStore: { messages: any[]; sessions: any[] } | null = null;
let flushTimeout: NodeJS.Timeout | null = null;

// Get public blob URL
function getBlobUrl() {
  return `https://ed5uvumrhqqw9cs3.public.blob.vercel-storage.com/${BUCKET_NAME}/${FILE_NAME}`;
}

// Flush in-memory store to Vercel Blob
async function flushStore() {
  if (!inMemoryStore || !isVercel) return;

  const data = JSON.stringify(inMemoryStore, null, 2);
  try {
    await put(`${BUCKET_NAME}/${FILE_NAME}`, Buffer.from(data), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });
    console.log("💾 Store flushed to Vercel Blob");
  } catch (err) {
    console.error("❌ Failed to flush store:", err);
  }
  flushTimeout = null;
}

// Schedule a flush in 1 second (batch writes)
function scheduleFlush() {
  if (flushTimeout) return;
  flushTimeout = setTimeout(flushStore, 1000);
}

// Load store
async function loadStore(): Promise<{ messages: any[]; sessions: any[] }> {
  if (inMemoryStore) return inMemoryStore;

  let store: { messages: any[]; sessions: any[] } = { messages: [], sessions: [] };

  if (isVercel) {
    try {
      const res = await fetch(getBlobUrl());
      if (res.ok) {
        const text = await res.text();
        store = JSON.parse(text);
      }
    } catch { }
  } else {
    try {
      const fs = await import("fs/promises");
      const data = await fs.readFile(LOCAL_FILE, "utf-8");
      store = JSON.parse(data);
    } catch { }
  }

  inMemoryStore = store;
  return store;
}

// Save store (updates in-memory + flush)
async function saveStore(store: any) {
  inMemoryStore = store;

  if (isVercel) {
    scheduleFlush();
  } else {
    const fs = await import("fs/promises");
    await fs.writeFile(LOCAL_FILE, JSON.stringify(store, null, 2), "utf-8");
  }
}

// POST — add message or update session
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, user, from, type, message, data, mimetype, quoted, timestamp, is_from_me } = body;

  const store = await loadStore();

  if (body.type === "update_session") {
    const session = store.sessions.find((s: any) => s.phone === body.phone);
    if (session) session.unreadCount = body.unreadCount;
    await saveStore(store);
    return NextResponse.json({ success: true, sessions: store.sessions });
  }

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

  await saveStore(store);
  return NextResponse.json({ success: true, msg, sessions: store.sessions });
}

// GET — retrieve store
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  const store = await loadStore();
  return NextResponse.json(store);
}
