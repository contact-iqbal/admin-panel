import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const { nama, deskripsi, periode_mulai, periode_selesai, biaya, status, kuota } = body;

    await pool.query(
      'UPDATE jalur SET nama = ?, deskripsi = ?, periode_mulai = ?, periode_selesai = ?, biaya = ?, status = ?, kuota = ? WHERE id = ?',
      [nama, deskripsi, periode_mulai, periode_selesai, biaya, status, kuota, id]
    );

    return NextResponse.json({
      success: true,
      message: 'Jalur berhasil diupdate',
    });
  } catch (error) {
    console.error('Error updating jalur:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await pool.query('DELETE FROM jalur WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Jalur berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting jalur:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
