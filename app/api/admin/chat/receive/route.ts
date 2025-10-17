import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, message, timestamp } = body;

    console.log('📥 API: Menerima pesan WhatsApp');
    console.log('   Pengirim:', from);
    console.log('   Pesan:', message);
    console.log('   Timestamp:', timestamp || new Date().toISOString());

    const response = {
      success: true,
      message: 'Pesan berhasil diterima (console)',
      data: {
        from,
        message,
        timestamp: timestamp || new Date().toISOString(),
        messageId: `msg_${Date.now()}`,
      },
    };

    console.log('✅ API: Pesan diterima:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menerima pesan' },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('📋 API: Webhook endpoint siap menerima pesan WhatsApp');

  return NextResponse.json({
    status: 'active',
    message: 'WhatsApp webhook endpoint',
    timestamp: new Date().toISOString(),
  });
}
