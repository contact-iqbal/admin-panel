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

    const [totalUsers] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users WHERE role = "default"'
    );

    const [totalBerkas] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM berkas'
    );

    const [totalPembayaran] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM pembayaran WHERE status = "paid"'
    );

    const [totalKartu] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM kartu'
    );

    const [berkasStatus] = await pool.query<RowDataPacket[]>(
      'SELECT status, COUNT(*) as count FROM berkas GROUP BY status'
    );

    const [pembayaranStatus] = await pool.query<RowDataPacket[]>(
      'SELECT status, COUNT(*) as count FROM pembayaran GROUP BY status'
    );

    return NextResponse.json({
      data: {
        totalUsers: totalUsers[0].count,
        totalBerkas: totalBerkas[0].count,
        totalPembayaran: totalPembayaran[0].count,
        totalKartu: totalKartu[0].count,
        berkasStatus,
        pembayaranStatus,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
