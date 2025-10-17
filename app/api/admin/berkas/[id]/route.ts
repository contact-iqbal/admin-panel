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

    const body = await req.json();
    const { status } = body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await pool.query<ResultSetHeader>(
      'UPDATE berkas SET status = ? WHERE id = ?',
      [status, id]
    );

    return NextResponse.json({ message: 'Status berkas updated' }, { status: 200 });
  } catch (error) {
    console.error('Error updating berkas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
