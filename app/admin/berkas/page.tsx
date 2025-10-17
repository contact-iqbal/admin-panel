'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Berkas {
  id: number;
  user_id: number;
  jenis_berkas: string;
  path_file: string;
  status: string;
  uploaded_at: string;
  nama_lengkap: string;
  email: string;
}

export default function KelolaBerkas() {
  const [berkasList, setBerkasList] = useState<Berkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBerkas();
  }, []);

  const fetchBerkas = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get('/api/admin/berkas', config);
      setBerkasList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching berkas:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBerkasStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/admin/berkas/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Status berkas berhasil diupdate',
        timer: 2000,
        showConfirmButton: false
      });
      fetchBerkas();
    } catch (error) {
      console.error('Error updating berkas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal mengupdate status berkas'
      });
    }
  };

  const filteredBerkas = berkasList.filter((berkas) => {
    const matchesSearch =
      berkas.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      berkas.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      berkas.jenis_berkas.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && berkas.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Terverifikasi';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Pending';
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Kelola Berkas</h1>
        <p className="text-gray-600 dark:text-gray-400">Verifikasi dan kelola berkas peserta</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{berkasList.length}</div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Total Berkas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {berkasList.filter((b) => b.status === 'pending').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Menunggu Verifikasi</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {berkasList.filter((b) => b.status === 'verified').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Terverifikasi</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {berkasList.filter((b) => b.status === 'rejected').length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Ditolak</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Cari berkas..."
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
            <option value="pending">Pending</option>
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <th className="text-left p-3 font-semibold dark:text-gray-200">ID</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Nama Peserta</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Email</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Jenis Berkas</th>
                <th className="text-center p-3 font-semibold dark:text-gray-200">Status</th>
                <th className="text-left p-3 font-semibold dark:text-gray-200">Upload</th>
                <th className="text-center p-3 font-semibold dark:text-gray-200">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBerkas.map((berkas) => (
                <tr key={berkas.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="p-3 dark:text-gray-300">{berkas.id}</td>
                  <td className="p-3 font-medium dark:text-white">{berkas.nama_lengkap || '-'}</td>
                  <td className="p-3 dark:text-gray-300">{berkas.email}</td>
                  <td className="p-3 capitalize dark:text-gray-300">{berkas.jenis_berkas}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusBadge(berkas.status)}`}>
                      {getStatusText(berkas.status)}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(berkas.uploaded_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <a
                        href={berkas.path_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Lihat
                      </a>
                      {berkas.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBerkasStatus(berkas.id, 'verified')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Verifikasi
                          </button>
                          <button
                            onClick={() => updateBerkasStatus(berkas.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBerkas.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500 dark:text-gray-400">
                    Tidak ada data berkas ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {filteredBerkas.map((berkas) => (
            <div key={berkas.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{berkas.nama_lengkap || 'Belum diisi'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{berkas.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(berkas.status)}`}>
                  {getStatusText(berkas.status)}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID:</span>
                  <span className="font-medium dark:text-gray-200">{berkas.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jenis Berkas:</span>
                  <span className="font-medium dark:text-gray-200 capitalize">{berkas.jenis_berkas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Upload:</span>
                  <span className="font-medium dark:text-gray-200">
                    {new Date(berkas.uploaded_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={berkas.path_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition"
                >
                  Lihat
                </a>
                {berkas.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateBerkasStatus(berkas.id, 'verified')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm transition"
                    >
                      Verifikasi
                    </button>
                    <button
                      onClick={() => updateBerkasStatus(berkas.id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition"
                    >
                      Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredBerkas.length === 0 && (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              Tidak ada data berkas ditemukan
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
