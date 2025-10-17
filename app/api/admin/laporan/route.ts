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

    const [totalUsersResult] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
    );

    const [totalBerkasResult] = await pool.query(
      'SELECT COUNT(*) as count FROM berkas'
    );

    const [totalPembayaranResult] = await pool.query(
      "SELECT COUNT(*) as count FROM pembayaran WHERE status = 'paid'"
    );

    const [totalKartuResult] = await pool.query(
      'SELECT COUNT(*) as count FROM kartu'
    );

    const [berkasStatusResult] = await pool.query(
      'SELECT status, COUNT(*) as count FROM berkas GROUP BY status'
    );

    const [pembayaranStatusResult] = await pool.query(
      'SELECT status, COUNT(*) as count FROM pembayaran GROUP BY status'
    );

    const [jalurStatsResult] = await pool.query(`
      SELECT j.nama, COUNT(p.id) as count
      FROM jalur j
      LEFT JOIN pembayaran p ON j.id = p.jalur_id
      GROUP BY j.id, j.nama
    `);

    const data = {
      totalUsers: (totalUsersResult as any)[0].count,
      totalBerkas: (totalBerkasResult as any)[0].count,
      totalPembayaran: (totalPembayaranResult as any)[0].count,
      totalKartu: (totalKartuResult as any)[0].count,
      berkasStatus: berkasStatusResult,
      pembayaranStatus: pembayaranStatusResult,
      jalurStats: jalurStatsResult,
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
