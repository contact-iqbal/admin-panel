import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let csvContent = '';

    if (type === 'peserta') {
      const [users] = await pool.query(`
        SELECT
          u.id,
          u.email,
          u.created_at,
          d.nama_lengkap,
          d.nisn,
          d.nik,
          d.tempat_lahir,
          d.tanggal_lahir,
          d.jenis_kelamin,
          d.alamat,
          d.asal_sekolah,
          d.nama_ayah,
          d.nama_ibu,
          k.nomor_peserta
        FROM users u
        LEFT JOIN data_diri d ON u.id = d.user_id
        LEFT JOIN kartu k ON u.id = k.user_id
        WHERE u.role = 'user'
        ORDER BY u.id
      `);

      csvContent = 'ID,Email,Nama Lengkap,NISN,NIK,Tempat Lahir,Tanggal Lahir,Jenis Kelamin,Alamat,Asal Sekolah,Nama Ayah,Nama Ibu,No Peserta,Tanggal Daftar\n';
      (users as any[]).forEach((user) => {
        csvContent += `${user.id},"${user.email}","${user.nama_lengkap || ''}","${user.nisn || ''}","${user.nik || ''}","${user.tempat_lahir || ''}","${user.tanggal_lahir || ''}","${user.jenis_kelamin || ''}","${user.alamat || ''}","${user.asal_sekolah || ''}","${user.nama_ayah || ''}","${user.nama_ibu || ''}","${user.nomor_peserta || ''}","${user.created_at}"\n`;
      });
    } else if (type === 'berkas') {
      const [berkas] = await pool.query(`
        SELECT
          b.id,
          u.email,
          d.nama_lengkap,
          b.jenis_berkas,
          b.status,
          b.uploaded_at
        FROM berkas b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN data_diri d ON b.user_id = d.user_id
        ORDER BY b.id
      `);

      csvContent = 'ID,Email,Nama Lengkap,Jenis Berkas,Status,Upload Date\n';
      (berkas as any[]).forEach((item) => {
        csvContent += `${item.id},"${item.email}","${item.nama_lengkap || ''}","${item.jenis_berkas}","${item.status}","${item.uploaded_at}"\n`;
      });
    } else if (type === 'pembayaran') {
      const [pembayaran] = await pool.query(`
        SELECT
          p.id,
          u.email,
          d.nama_lengkap,
          p.invoice_id,
          p.amount,
          p.status,
          j.nama as jalur_nama,
          p.paid_at,
          p.created_at
        FROM pembayaran p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN data_diri d ON p.user_id = d.user_id
        LEFT JOIN jalur j ON p.jalur_id = j.id
        ORDER BY p.id
      `);

      csvContent = 'ID,Email,Nama Lengkap,Invoice ID,Jumlah,Status,Jalur,Tanggal Bayar,Tanggal Dibuat\n';
      (pembayaran as any[]).forEach((item) => {
        csvContent += `${item.id},"${item.email}","${item.nama_lengkap || ''}","${item.invoice_id}",${item.amount},"${item.status}","${item.jalur_nama || ''}","${item.paid_at || ''}","${item.created_at}"\n`;
      });
    } else {
      return NextResponse.json({ message: 'Invalid export type' }, { status: 400 });
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="laporan_${type}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
