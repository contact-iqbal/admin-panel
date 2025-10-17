'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalBerkas: number;
  totalPembayaran: number;
  totalKartu: number;
  berkasStatus: Array<{ status: string; count: number }>;
  pembayaranStatus: Array<{ status: string; count: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const statsRes = await axios.get('/api/admin/stats', config);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Selamat datang di Admin Panel PPDB Antartika</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/peserta">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="text-4xl font-bold">{stats?.totalUsers || 0}</div>
              <i className="fas fa-users text-3xl opacity-50"></i>
            </div>
            <div className="text-lg font-medium">Total Peserta</div>
            <div className="text-sm opacity-75 mt-1">Lihat semua peserta</div>
          </div>
        </Link>

        <Link href="/admin/pembayaran">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="text-4xl font-bold">{stats?.totalPembayaran || 0}</div>
              <i className="fas fa-credit-card text-3xl opacity-50"></i>
            </div>
            <div className="text-lg font-medium">Pembayaran Lunas</div>
            <div className="text-sm opacity-75 mt-1">Kelola pembayaran</div>
          </div>
        </Link>

        <Link href="/admin/berkas">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
              <div className="text-4xl font-bold">{stats?.totalBerkas || 0}</div>
              <i className="fas fa-folder-open text-3xl opacity-50"></i>
            </div>
            <div className="text-lg font-medium">Total Berkas</div>
            <div className="text-sm opacity-75 mt-1">Verifikasi berkas</div>
          </div>
        </Link>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="text-4xl font-bold">{stats?.totalKartu || 0}</div>
            <i className="fas fa-id-card text-3xl opacity-50"></i>
          </div>
          <div className="text-lg font-medium">Kartu Diterbitkan</div>
          <div className="text-sm opacity-75 mt-1">Kartu peserta aktif</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Status Berkas</h2>
            <Link href="/admin/berkas" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.berkasStatus.map((item) => {
              const getColor = (status: string) => {
                switch (status) {
                  case 'verified':
                    return 'bg-green-100 text-green-800 border-green-200';
                  case 'rejected':
                    return 'bg-red-100 text-red-800 border-red-200';
                  default:
                    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                }
              };

              return (
                <div
                  key={item.status}
                  className={`border-l-4 p-4 rounded ${getColor(item.status)}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{item.status}</span>
                    <span className="text-2xl font-bold">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Status Pembayaran</h2>
            <Link href="/admin/pembayaran" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.pembayaranStatus.map((item) => {
              const getColor = (status: string) => {
                switch (status) {
                  case 'paid':
                    return 'bg-green-100 text-green-800 border-green-200';
                  case 'expired':
                    return 'bg-gray-100 text-gray-800 border-gray-200';
                  case 'cancelled':
                    return 'bg-red-100 text-red-800 border-red-200';
                  default:
                    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                }
              };

              return (
                <div
                  key={item.status}
                  className={`border-l-4 p-4 rounded ${getColor(item.status)}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">{item.status}</span>
                    <span className="text-2xl font-bold">{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/peserta">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-blue-500">
            <i className="fas fa-users text-3xl mb-2 text-blue-500"></i>
            <h3 className="text-lg font-bold mb-1 dark:text-white">Kelola Peserta</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Manajemen data peserta PPDB</p>
          </div>
        </Link>

        <Link href="/admin/jalur">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-green-500">
            <i className="fas fa-route text-3xl mb-2 text-green-500"></i>
            <h3 className="text-lg font-bold mb-1 dark:text-white">Jalur PPDB</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Atur jalur pendaftaran</p>
          </div>
        </Link>

        <Link href="/admin/laporan">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer border-l-4 border-orange-500">
            <i className="fas fa-chart-bar text-3xl mb-2 text-orange-500"></i>
            <h3 className="text-lg font-bold mb-1 dark:text-white">Laporan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Statistik dan export data</p>
          </div>
        </Link>
      </div>
    </DashboardLayout>
  );
}
