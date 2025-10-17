import { NextRequest, NextResponse } from 'next/server';

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

    const response = {
      success: true,
      message: 'Pesan berhasil dikirim (console)',
      data: {
        to,
        message,
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}`,
      },
    };

    console.log('✅ API: Response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim pesan' },
      { status: 500 }
    );
  }
}
