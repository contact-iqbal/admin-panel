import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const [pembayaran] = await pool.query(`
      SELECT
        p.*,
        u.email,
        d.nama_lengkap,
        j.nama as jalur_nama
      FROM pembayaran p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN data_diri d ON p.user_id = d.user_id
      LEFT JOIN jalur j ON p.jalur_id = j.id
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: pembayaran,
    });
  } catch (error) {
    console.error('Error fetching pembayaran:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
