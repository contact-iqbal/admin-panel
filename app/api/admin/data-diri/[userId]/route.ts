import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { ResultSetHeader } from 'mysql2';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      nama_lengkap,
      nisn,
      nik,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      asal_sekolah,
      nama_ayah,
      nama_ibu,
      penghasilan_ortu,
      tahun_lulus,
    } = body;

    await pool.query<ResultSetHeader>(
      `UPDATE data_diri SET
        nama_lengkap = ?, nisn = ?, nik = ?, tempat_lahir = ?, tanggal_lahir = ?,
        jenis_kelamin = ?, alamat = ?, asal_sekolah = ?, nama_ayah = ?, nama_ibu = ?,
        penghasilan_ortu = ?, tahun_lulus = ?
      WHERE user_id = ?`,
      [
        nama_lengkap,
        nisn,
        nik,
        tempat_lahir,
        tanggal_lahir,
        jenis_kelamin,
        alamat,
        asal_sekolah,
        nama_ayah,
        nama_ibu,
        penghasilan_ortu,
        tahun_lulus,
        userId,
      ]
    );

    return NextResponse.json({ message: 'Data diri updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating data diri:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
