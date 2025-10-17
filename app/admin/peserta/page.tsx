'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
  nama_lengkap: string;
  nisn: string;
  asal_sekolah: string;
  total_berkas: number;
  total_pembayaran: number;
  nomor_peserta: string;
}

export default function KelolaA() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get('/api/admin/users', config);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nisn?.includes(searchTerm);

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'paid') return matchesSearch && user.total_pembayaran > 0;
    if (filterStatus === 'unpaid') return matchesSearch && user.total_pembayaran === 0;
    return matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Kelola Peserta PPDB</h1>
        <p className="text-gray-600 dark:text-gray-400">Manajemen data peserta pendaftaran</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Cari peserta..."
              className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-control sm:w-48 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="paid">Sudah Bayar</option>
              <option value="unpaid">Belum Bayar</option>
            </select>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Total: <strong className="dark:text-white">{filteredUsers.length}</strong> peserta
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <th className="text-left p-3 font-semibold dark:text-gray-200">ID</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Email</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Nama Lengkap</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">NISN</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Asal Sekolah</th>
                <th className="text-center p-3 font-semibold dark:text-gray-200">Berkas</th>
                <th className="text-center p-3 font-semibold dark:text-gray-200">Pembayaran</th>
                <th className="text-center p-3 font-semibold dark:text-gray-200">No. Peserta</th>
                <th className="text-center p-3 font-semibold dark:text-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="p-3 dark:text-gray-300">{user.id}</td>
                  <td className="p-3 dark:text-gray-300">{user.email}</td>
                  <td className="p-3 font-medium dark:text-white">{user.nama_lengkap || '-'}</td>
                  <td className="p-3 dark:text-gray-300">{user.nisn || '-'}</td>
                  <td className="p-3 dark:text-gray-300">{user.asal_sekolah || '-'}</td>
                  <td className="p-3 text-center">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                      {user.total_berkas}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                        user.total_pembayaran > 0
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {user.total_pembayaran > 0 ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </td>
                  <td className="p-3 text-center dark:text-gray-300">
                    {user.nomor_peserta || '-'}
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/user/${user.id}`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition text-sm"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-gray-500 dark:text-gray-400">
                    Tidak ada data peserta ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{user.nama_lengkap || 'Belum diisi'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.total_pembayaran > 0
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {user.total_pembayaran > 0 ? 'Lunas' : 'Belum Bayar'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID:</span>
                  <span className="font-medium dark:text-gray-200">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">NISN:</span>
                  <span className="font-medium dark:text-gray-200">{user.nisn || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Asal Sekolah:</span>
                  <span className="font-medium dark:text-gray-200">{user.asal_sekolah || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Berkas:</span>
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                    {user.total_berkas}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">No. Peserta:</span>
                  <span className="font-medium dark:text-gray-200">{user.nomor_peserta || '-'}</span>
                </div>
              </div>
              <Link
                href={`/admin/user/${user.id}`}
                className="mt-3 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
              >
                Lihat Detail
              </Link>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              Tidak ada data peserta ditemukan
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
