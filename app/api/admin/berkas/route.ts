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

    const [berkas] = await pool.query(`
      SELECT
        b.*,
        u.email,
        d.nama_lengkap
      FROM berkas b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN data_diri d ON b.user_id = d.user_id
      ORDER BY b.uploaded_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: berkas,
    });
  } catch (error) {
    console.error('Error fetching berkas:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
