'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Pembayaran {
  id: number;
  user_id: number;
  invoice_id: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  nama_lengkap: string;
  email: string;
  jalur_nama: string;
}

export default function KelolaPembayaran() {
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPembayaran();
  }, []);

  const fetchPembayaran = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get('/api/admin/pembayaran', config);
      setPembayaranList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pembayaran:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPembayaran = pembayaranList.filter((pembayaran) => {
    const matchesSearch =
      pembayaran.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pembayaran.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pembayaran.invoice_id.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && pembayaran.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Lunas';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Pending';
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const totalAmount = filteredPembayaran
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

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
        <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Kelola Pembayaran</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitoring pembayaran peserta PPDB</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{pembayaranList.length}</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Total Transaksi</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {pembayaranList.filter((p) => p.status === 'paid').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Lunas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {pembayaranList.filter((p) => p.status === 'pending').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {pembayaranList.filter((p) => p.status === 'expired').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Expired</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow col-span-2 md:col-span-1">
          <div className="text-base md:text-xl font-bold text-blue-600 dark:text-blue-400">{formatRupiah(totalAmount)}</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Total Pendapatan</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Cari pembayaran..."
            className="form-control flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-control sm:w-48 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="paid">Lunas</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <th className="text-left p-3 font-semibold dark:text-gray-200">Invoice ID</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Nama Peserta</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Email</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Jalur</th>
                <th className="text-right p-3 font-semibold dark:text-gray-200">Jumlah</th>
                <th className="text-center p-3 font-semibold dark:text-gray-200">Status</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredPembayaran.map((pembayaran) => (
                <tr key={pembayaran.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="p-3 font-mono text-sm dark:text-gray-300">{pembayaran.invoice_id}</td>
                  <td className="p-3 font-medium dark:text-white">{pembayaran.nama_lengkap || '-'}</td>
                  <td className="p-3 dark:text-gray-300">{pembayaran.email}</td>
                  <td className="p-3 dark:text-gray-300">{pembayaran.jalur_nama || '-'}</td>
                  <td className="p-3 text-right font-semibold dark:text-gray-200">
                    {formatRupiah(pembayaran.amount)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusBadge(
                        pembayaran.status
                      )}`}
                    >
                      {getStatusText(pembayaran.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    {pembayaran.paid_at
                      ? new Date(pembayaran.paid_at).toLocaleDateString('id-ID')
                      : new Date(pembayaran.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
              {filteredPembayaran.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500 dark:text-gray-400">
                    Tidak ada data pembayaran ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {filteredPembayaran.map((pembayaran) => (
            <div key={pembayaran.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{pembayaran.nama_lengkap || 'Belum diisi'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{pembayaran.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(pembayaran.status)}`}>
                  {getStatusText(pembayaran.status)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice:</span>
                  <span className="font-mono text-xs dark:text-gray-300">{pembayaran.invoice_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jalur:</span>
                  <span className="font-medium dark:text-gray-200">{pembayaran.jalur_nama || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jumlah:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatRupiah(pembayaran.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tanggal:</span>
                  <span className="font-medium dark:text-gray-200">
                    {pembayaran.paid_at
                      ? new Date(pembayaran.paid_at).toLocaleDateString('id-ID')
                      : new Date(pembayaran.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredPembayaran.length === 0 && (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              Tidak ada data pembayaran ditemukan
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
