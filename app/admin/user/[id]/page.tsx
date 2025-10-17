'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

interface UserDetail {
  user: {
    id: number;
    email: string;
    role: string;
    created_at: string;
  };
  dataDiri: any;
  berkas: any[];
  pembayaran: any[];
  kartu: any;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchUserDetail();
  }, []);

  const fetchUserDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`/api/admin/user/${params.id}`, config);
      setData(response.data.data);
      setFormData(response.data.data.dataDiri || {});
    } catch (error) {
      console.error('Error fetching user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDataDiri = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.patch(`/api/admin/data-diri/${params.id}`, formData, config);
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diupdate',
        timer: 2000,
        showConfirmButton: false
      });
      setEditing(false);
      fetchUserDetail();
    } catch (error) {
      console.error('Error updating data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal update data'
      });
    }
  };

  const handleUpdateBerkasStatus = async (berkasId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.patch(`/api/admin/berkas/${berkasId}`, { status }, config);
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Status berkas diupdate',
        timer: 2000,
        showConfirmButton: false
      });
      fetchUserDetail();
    } catch (error) {
      console.error('Error updating berkas status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Gagal update status berkas'
      });
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

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center">Data tidak ditemukan</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin')}
          className="text-blue-600 hover:underline mb-4"
        >
          &larr; Kembali ke Dashboard
        </button>
        <h1 className="text-3xl font-bold">Detail Peserta</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Data Akun</h2>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">ID:</span> {data.user.id}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {data.user.email}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {data.user.role}
            </div>
            <div>
              <span className="font-semibold">Terdaftar:</span>{' '}
              {new Date(data.user.created_at).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Data Diri</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editing ? 'Batal' : 'Edit'}
            </button>
          </div>

          {data.dataDiri ? (
            editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={formData.nama_lengkap || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_lengkap: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="NISN"
                  value={formData.nisn || ''}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="NIK"
                  value={formData.nik || ''}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Tempat Lahir"
                  value={formData.tempat_lahir || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tempat_lahir: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="date"
                  value={formData.tanggal_lahir?.split('T')[0] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal_lahir: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <select
                  value={formData.jenis_kelamin || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, jenis_kelamin: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <textarea
                  placeholder="Alamat"
                  value={formData.alamat || ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Asal Sekolah"
                  value={formData.asal_sekolah || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, asal_sekolah: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Tahun Lulus"
                  value={formData.tahun_lulus || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tahun_lulus: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleSaveDataDiri}
                  className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Simpan
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Nama:</span>{' '}
                  {data.dataDiri.nama_lengkap}
                </div>
                <div>
                  <span className="font-semibold">NISN:</span> {data.dataDiri.nisn || '-'}
                </div>
                <div>
                  <span className="font-semibold">NIK:</span> {data.dataDiri.nik || '-'}
                </div>
                <div>
                  <span className="font-semibold">Tempat, Tanggal Lahir:</span>{' '}
                  {data.dataDiri.tempat_lahir || '-'},{' '}
                  {data.dataDiri.tanggal_lahir
                    ? new Date(data.dataDiri.tanggal_lahir).toLocaleDateString('id-ID')
                    : '-'}
                </div>
                <div>
                  <span className="font-semibold">Jenis Kelamin:</span>{' '}
                  {data.dataDiri.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </div>
                <div>
                  <span className="font-semibold">Alamat:</span> {data.dataDiri.alamat || '-'}
                </div>
                <div>
                  <span className="font-semibold">Asal Sekolah:</span>{' '}
                  {data.dataDiri.asal_sekolah || '-'}
                </div>
                <div>
                  <span className="font-semibold">Tahun Lulus:</span>{' '}
                  {data.dataDiri.tahun_lulus || '-'}
                </div>
              </div>
            )
          ) : (
            <div className="text-gray-500">Belum ada data diri</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Berkas</h2>
          {data.berkas.length > 0 ? (
            <div className="space-y-3">
              {data.berkas.map((berkas) => (
                <div key={berkas.id} className="border rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{berkas.jenis_berkas}</div>
                      <div className="text-sm text-gray-500">{berkas.path_file}</div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        berkas.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : berkas.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {berkas.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateBerkasStatus(berkas.id, 'verified')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Verifikasi
                    </button>
                    <button
                      onClick={() => handleUpdateBerkasStatus(berkas.id, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Belum ada berkas</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Pembayaran</h2>
          {data.pembayaran.length > 0 ? (
            <div className="space-y-3">
              {data.pembayaran.map((payment) => (
                <div key={payment.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Invoice: {payment.invoice_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        payment.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Belum ada pembayaran</div>
          )}
        </div>

        {data.kartu && (
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Kartu Peserta</h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Nomor Peserta:</span>{' '}
                {data.kartu.nomor_peserta}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    data.kartu.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {data.kartu.status}
                </span>
              </div>
              <div>
                <span className="font-semibold">Dibuat:</span>{' '}
                {new Date(data.kartu.created_at).toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
