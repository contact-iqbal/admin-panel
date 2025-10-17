'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Swal from 'sweetalert2';

interface Peserta {
  user_id: number;
  email: string;
  nama_lengkap: string;
  nisn?: string;
  asal_sekolah?: string;
  status_kelulusan: 'lulus' | 'tidak_lulus' | 'pending';
  catatan?: string;
}

export default function PengumumanPage() {
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lulus' | 'tidak_lulus' | 'pending'>('all');

  useEffect(() => {
    fetchPeserta();
  }, []);

  const fetchPeserta = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pengumuman', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPeserta(data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data peserta',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: number, status: 'lulus' | 'tidak_lulus' | 'pending') => {
    const result = await Swal.fire({
      title: 'Update Status Kelulusan',
      html: `
        <div class="text-left">
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select id="status" class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4">
            <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="lulus" ${status === 'lulus' ? 'selected' : ''}>Lulus</option>
            <option value="tidak_lulus" ${status === 'tidak_lulus' ? 'selected' : ''}>Tidak Lulus</option>
          </select>
          <label class="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
          <textarea id="catatan" class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3" placeholder="Tambahkan catatan..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        const statusSelect = document.getElementById('status') as HTMLSelectElement;
        const catatanInput = document.getElementById('catatan') as HTMLTextAreaElement;
        return {
          status: statusSelect.value,
          catatan: catatanInput.value,
        };
      },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/pengumuman', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userId,
            status: result.value.status,
            catatan: result.value.catatan,
          }),
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Status kelulusan berhasil diperbarui',
            timer: 2000,
            showConfirmButton: false,
          });
          fetchPeserta();
        } else {
          throw new Error('Failed to update status');
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memperbarui status kelulusan',
        });
      }
    }
  };

  const handleExportData = () => {
    Swal.fire({
      icon: 'info',
      title: 'Export Data',
      text: 'Fitur export data pengumuman akan segera tersedia',
    });
  };

  const getFilteredPeserta = () => {
    return peserta.filter((p) => {
      const matchesSearch =
        p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nisn?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || p.status_kelulusan === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const filteredPeserta = getFilteredPeserta();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'lulus':
        return 'bg-green-100 text-green-800';
      case 'tidak_lulus':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'lulus':
        return 'Lulus';
      case 'tidak_lulus':
        return 'Tidak Lulus';
      default:
        return 'Pending';
    }
  };

  const stats = {
    total: peserta.length,
    lulus: peserta.filter((p) => p.status_kelulusan === 'lulus').length,
    tidak_lulus: peserta.filter((p) => p.status_kelulusan === 'tidak_lulus').length,
    pending: peserta.filter((p) => p.status_kelulusan === 'pending').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Peserta</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
              </div>
              <i className="fa-solid fa-users text-3xl text-gray-400 dark:text-gray-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lulus</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.lulus}</p>
              </div>
              <i className="fa-solid fa-check-circle text-3xl text-gray-400 dark:text-gray-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tidak Lulus</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.tidak_lulus}</p>
              </div>
              <i className="fa-solid fa-times-circle text-3xl text-gray-400 dark:text-gray-500"></i>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <i className="fa-solid fa-clock text-3xl text-gray-400 dark:text-gray-500"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Pengumuman Kelulusan</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola status kelulusan setiap peserta secara individual</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari peserta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="lulus">Lulus</option>
                <option value="tidak_lulus">Tidak Lulus</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-gray-400 dark:text-gray-500"></i>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Memuat data...</p>
              </div>
            ) : filteredPeserta.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fa-solid fa-inbox text-5xl text-gray-300 dark:text-gray-600"></i>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Tidak ada data peserta</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nama Lengkap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      NISN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Asal Sekolah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPeserta.map((p, index) => (
                    <tr key={p.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{p.nama_lengkap}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {p.nisn || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {p.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {p.asal_sekolah || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(p.status_kelulusan)}`}>
                          {getStatusText(p.status_kelulusan)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleUpdateStatus(p.user_id, p.status_kelulusan)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          <i className="fa-solid fa-edit mr-1"></i>
                          Edit Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
