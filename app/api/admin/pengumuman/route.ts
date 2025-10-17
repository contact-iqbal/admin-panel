import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import db from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT
        u.id as user_id,
        u.email,
        dd.nama_lengkap,
        dd.nisn,
        dd.asal_sekolah,
        COALESCE(k.status, 'pending') as status_kelulusan,
        k.catatan
      FROM users u
      LEFT JOIN data_diri dd ON u.id = dd.user_id
      LEFT JOIN kelulusan k ON u.id = k.user_id
      WHERE u.role = 'user'
      ORDER BY dd.nama_lengkap ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching pengumuman data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, status, catatan } = body;

    if (!user_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['lulus', 'tidak_lulus', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT id FROM kelulusan WHERE user_id = ?',
      [user_id]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE kelulusan
         SET status = ?, catatan = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [status, catatan || null, user_id]
      );
    } else {
      await db.query(
        `INSERT INTO kelulusan (user_id, status, catatan, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [user_id, status, catatan || null]
      );
    }

    return NextResponse.json({ message: 'Status kelulusan berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating kelulusan status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
