'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface LaporanData {
  totalUsers: number;
  totalBerkas: number;
  totalPembayaran: number;
  totalKartu: number;
  berkasStatus: Array<{ status: string; count: number }>;
  pembayaranStatus: Array<{ status: string; count: number }>;
  jalurStats: Array<{ nama: string; count: number }>;
  pendapatanPerBulan: Array<{ bulan: string; total: number }>;
}

export default function Laporan() {
  const [data, setData] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get('/api/admin/laporan', config);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan_${type}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error exporting:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal mengekspor data'
      });
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const berkasChartData = {
    labels: data.berkasStatus.map((item) => item.status),
    datasets: [
      {
        label: 'Jumlah Berkas',
        data: data.berkasStatus.map((item) => item.count),
        backgroundColor: ['#fbbf24', '#10b981', '#ef4444'],
      },
    ],
  };

  const pembayaranChartData = {
    labels: data.pembayaranStatus.map((item) => item.status),
    datasets: [
      {
        label: 'Jumlah Pembayaran',
        data: data.pembayaranStatus.map((item) => item.count),
        backgroundColor: ['#fbbf24', '#10b981', '#6b7280', '#ef4444'],
      },
    ],
  };

  const jalurChartData = {
    labels: data.jalurStats.map((item) => item.nama),
    datasets: [
      {
        label: 'Jumlah Pendaftar',
        data: data.jalurStats.map((item) => item.count),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  return (
    <DashboardLayout>
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Laporan & Statistik</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Data statistik dan laporan PPDB</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{data.totalUsers}</div>
          <div className="text-sm md:text-lg">Total Peserta</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{data.totalPembayaran}</div>
          <div className="text-sm md:text-lg">Pembayaran Lunas</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{data.totalBerkas}</div>
          <div className="text-sm md:text-lg">Total Berkas</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 md:p-6 rounded-lg shadow-lg">
          <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{data.totalKartu}</div>
          <div className="text-sm md:text-lg">Kartu Diterbitkan</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 dark:text-white">Status Berkas</h2>
          <div className="h-48 md:h-64 flex items-center justify-center">
            <Pie data={berkasChartData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { font: { size: window.innerWidth < 768 ? 10 : 12 } } } } }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 dark:text-white">Status Pembayaran</h2>
          <div className="h-48 md:h-64 flex items-center justify-center">
            <Pie data={pembayaranChartData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { font: { size: window.innerWidth < 768 ? 10 : 12 } } } } }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 dark:text-white">Pendaftar per Jalur</h2>
        <div className="h-64 md:h-80">
          <Bar
            data={jalurChartData}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    font: {
                      size: window.innerWidth < 768 ? 10 : 12
                    }
                  },
                },
                x: {
                  ticks: {
                    font: {
                      size: window.innerWidth < 768 ? 10 : 12
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  labels: {
                    font: {
                      size: window.innerWidth < 768 ? 10 : 12
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 dark:text-white">Export Data</h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
          Download data dalam format CSV untuk analisis lebih lanjut
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => handleExport('peserta')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition font-medium text-sm md:text-base flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-download"></i>
            <span>Export Data Peserta</span>
          </button>
          <button
            onClick={() => handleExport('berkas')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition font-medium text-sm md:text-base flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-download"></i>
            <span>Export Data Berkas</span>
          </button>
          <button
            onClick={() => handleExport('pembayaran')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition font-medium text-sm md:text-base flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-download"></i>
            <span>Export Data Pembayaran</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
