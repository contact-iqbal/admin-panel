export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'default';
  created_at: Date;
}

export interface DataDiri {
  id: number;
  user_id: number;
  nama_lengkap: string;
  nisn?: string;
  nik?: string;
  tempat_lahir?: string;
  tanggal_lahir?: Date;
  jenis_kelamin?: 'L' | 'P';
  alamat?: string;
  asal_sekolah?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  penghasilan_ortu?: string;
  tahun_lulus?: number;
}

export interface Berkas {
  id: number;
  user_id: number;
  jenis_berkas: string;
  path_file: string;
  status: 'pending' | 'verified' | 'rejected';
  uploaded_at: Date;
}

export interface Jalur {
  id: number;
  nama: string;
  deskripsi?: string;
  periode_mulai?: Date;
  periode_selesai?: Date;
  biaya?: number;
  status: 'active' | 'inactive';
}

export interface Kartu {
  id: number;
  user_id: number;
  nomor_peserta: string;
  status: 'active' | 'inactive';
  created_at: Date;
}

export interface Pembayaran {
  id: number;
  user_id: number;
  jalur_id?: number;
  invoice_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  payment_url?: string;
  paid_at?: Date;
  expired_at?: Date;
  created_at: Date;
}

export interface PasswordReset {
  id: number;
  user_id: number;
  otp: string;
  expires_at: Date;
  created_at: Date;
}

export interface ChatMessage {
  id: number;
  from: string;
  message: string;
  timestamp: Date;
  is_from_me: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Kelulusan {
  id: number;
  user_id: number;
  status: 'lulus' | 'tidak_lulus' | 'pending';
  catatan?: string;
  diumumkan_at?: Date;
  created_at: Date;
  updated_at: Date;
}
