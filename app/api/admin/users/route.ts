import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.email, u.role, u.created_at,
              COALESCE(NULLIF(d.nama_lengkap, ''), u.nama) AS nama_lengkap, COALESCE(NULLIF(d.nisn, ''), u.nisn) AS nisn, COALESCE(NULLIF(d.asal_sekolah, ''), 'Kosong') AS asal_sekolah,
              (SELECT COUNT(*) FROM berkas WHERE user_id = u.id) as total_berkas,
              (SELECT COUNT(*) FROM pembayaran WHERE user_id = u.id AND status = 'paid') as total_pembayaran,
              (SELECT nomor_peserta FROM kartu WHERE user_id = u.id) as nomor_peserta
       FROM users u
       LEFT JOIN data_diri d ON u.id = d.user_id
       ORDER BY u.created_at DESC`
    );
    

    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
