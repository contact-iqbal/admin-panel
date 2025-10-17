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

    const [jalur] = await pool.query('SELECT * FROM jalur ORDER BY id DESC');

    return NextResponse.json({
      success: true,
      data: jalur,
    });
  } catch (error) {
    console.error('Error fetching jalur:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { nama, deskripsi, periode_mulai, periode_selesai, biaya, status } = body;

    await pool.query(
      'INSERT INTO jalur (nama, deskripsi, periode_mulai, periode_selesai, biaya, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nama, deskripsi, periode_mulai, periode_selesai, biaya, status]
    );

    return NextResponse.json({
      success: true,
      message: 'Jalur berhasil ditambahkan',
    });
  } catch (error) {
    console.error('Error creating jalur:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
