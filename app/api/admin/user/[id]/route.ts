import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [dataDiri] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM data_diri WHERE user_id = ?',
      [id]
    );

    const [berkas] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM berkas WHERE user_id = ? ORDER BY uploaded_at DESC',
      [id]
    );

    const [pembayaran] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pembayaran WHERE user_id = ? ORDER BY created_at DESC',
      [id]
    );

    const [kartu] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM kartu WHERE user_id = ?',
      [id]
    );

    return NextResponse.json({
      data: {
        user: users[0],
        dataDiri: dataDiri[0] || null,
        berkas: berkas,
        pembayaran: pembayaran,
        kartu: kartu[0] || null,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user detail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
