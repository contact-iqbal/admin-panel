'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Jalur {
  kuota: number;
  id: number;
  nama: string;
  deskripsi: string;
  periode_mulai: string;
  periode_selesai: string;
  biaya: number;
  status: string;
}

export default function KelolaJalur() {
  const [jalurList, setJalurList] = useState<Jalur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    periode_mulai: '',
    periode_selesai: '',
    biaya: '',
    status: 'active',
    kuota: '',
  });

  useEffect(() => {
    fetchJalur();
  }, []);

  const fetchJalur = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get('/api/admin/jalur', config);
      setJalurList(response.data.data || []);
      console.log(response.data.data)
    } catch (error) {
      console.error('Error fetching jalur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (editingId) {
        await axios.put(`/api/admin/jalur/${editingId}`, formData, config);
      } else {
        await axios.post('/api/admin/jalur', formData, config);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        nama: '',
        deskripsi: '',
        periode_mulai: '',
        periode_selesai: '',
        biaya: '',
        status: 'active',
        kuota: '',
      });
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data jalur berhasil disimpan',
        timer: 2000,
        showConfirmButton: false
      });
      fetchJalur();
    } catch (error) {
      console.error('Error saving jalur:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menyimpan data jalur'
      });
    }
  };

  const handleEdit = (jalur: Jalur) => {
    setEditingId(jalur.id);
    setFormData({
      nama: jalur.nama,
      deskripsi: jalur.deskripsi || '',
      periode_mulai: jalur.periode_mulai ? jalur.periode_mulai.split('T')[0] : '',
      periode_selesai: jalur.periode_selesai ? jalur.periode_selesai.split('T')[0] : '',
      biaya: jalur.biaya?.toString() || '',
      status: jalur.status,
      kuota: jalur.kuota?.toString() || '',
    });
    setShowForm(true);
    window.location.href='#'
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Yakin ingin menghapus jalur ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/jalur/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Jalur berhasil dihapus',
        timer: 2000,
        showConfirmButton: false
      });
      fetchJalur();
    } catch (error) {
      console.error('Error deleting jalur:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal menghapus jalur'
      });
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">Kelola Jalur SPMB</h1>
            <p className="text-gray-600 dark:text-gray-400">Manajemen jalur pendaftaran</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                nama: '',
                deskripsi: '',
                periode_mulai: '',
                periode_selesai: '',
                biaya: '',
                status: 'aktif',
                kuota: '',
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium w-full sm:w-auto"
          >
            {showForm ? 'Batal' : '+ Tambah Jalur'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            {editingId ? 'Edit Jalur' : 'Tambah Jalur Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Nama Jalur</label>
                <input
                  type="text"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Biaya</label>
                <input
                  type="number"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formData.biaya}
                  onChange={(e) => setFormData({ ...formData, biaya: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Periode Mulai</label>
                <input
                  type="date"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formData.periode_mulai}
                  onChange={(e) => setFormData({ ...formData, periode_mulai: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Periode Selesai</label>
                <input
                  type="date"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formData.periode_selesai}
                  onChange={(e) => setFormData({ ...formData, periode_selesai: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Status</label>
                <select
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Tidak Aktif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Kuota</label>
                <input
                  type="number"
                  className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  value={formData.kuota}
                  onChange={(e) => setFormData({ ...formData, kuota: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Deskripsi</label>
              <textarea
                className="form-control dark:bg-gray-700 dark:text-white dark:border-gray-600"
                rows={3}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Daftar Jalur SPMB</h2>
        <div className="space-y-4">
          {jalurList.map((jalur) => (
            <div
              key={jalur.id}
              className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition dark:bg-gray-700"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg font-bold dark:text-white">{jalur.nama}</h3>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium self-start uppercase ${
                        jalur.status === 'aktif'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {jalur.status === 'aktif' ? 'aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{jalur.deskripsi || '-'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Biaya:</span>
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatRupiah(jalur.biaya || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Periode Mulai:</span>
                      <div className="font-medium dark:text-gray-200">
                        {jalur.periode_mulai
                          ? new Date(jalur.periode_mulai).toLocaleDateString('id-ID')
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Periode Selesai:</span>
                      <div className="font-medium dark:text-gray-200">
                        {jalur.periode_selesai
                          ? new Date(jalur.periode_selesai).toLocaleDateString('id-ID')
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Kuota</span>
                      <div className="font-medium dark:text-gray-200">
                        {jalur.kuota}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => handleEdit(jalur)}
                    className="flex-1 lg:flex-none bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(jalur.id)}
                    className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
          {jalurList.length === 0 && (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              Belum ada jalur SPMB. Klik tombol &quot;Tambah Jalur&quot; untuk membuat jalur baru.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
