import React, { useState } from 'react'
import { db } from '../supabaseClient'
import { formatTanggalIndo } from '../utils/helpers'
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  X,
  Phone,
  Home,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'

export default function WargaManager({ wargaList, onRefreshWarga, rtProfile }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWarga, setEditingWarga] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const initialForm = {
    nik: '',
    no_kk: '',
    nama_lengkap: '',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: 'Islam',
    status_perkawinan: 'Kawin',
    pekerjaan: '',
    kewarganegaraan: 'WNI',
    alamat: '',
    rt: rtProfile?.rt_number || '005',
    rw: rtProfile?.rw_number || '012',
    no_hp: '',
    email: '',
    status_tinggal: 'Tetap'
  }

  const [formData, setFormData] = useState(initialForm)

  const handleOpenAdd = () => {
    setEditingWarga(null)
    setFormData(initialForm)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (w) => {
    setEditingWarga(w)
    setFormData({ ...w })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nik || !formData.nama_lengkap) {
      alert('NIK dan Nama Lengkap wajib diisi.')
      return
    }

    setIsSaving(true)
    try {
      await db.saveWarga(formData)
      setIsModalOpen(false)
      onRefreshWarga()
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id, nama) => {
    if (confirm(`Yakin ingin menghapus data warga "${nama}"?`)) {
      await db.deleteWarga(id)
      onRefreshWarga()
    }
  }

  const filtered = wargaList.filter(w =>
    w.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.nik.includes(searchTerm) ||
    (w.no_kk && w.no_kk.includes(searchTerm)) ||
    (w.alamat && w.alamat.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Buku Induk Kependudukan RT {rtProfile?.rt_number}
          </h3>
          <p className="text-xs text-slate-500">
            Daftar warga terdaftar ({wargaList.length} jiwa) untuk pembuatan surat cepat
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama, NIK, atau KK..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Warga
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">Tidak ada data warga ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nama & NIK</th>
                  <th className="px-5 py-3.5">Jenis Kelamin</th>
                  <th className="px-5 py-3.5">TTL & Agama</th>
                  <th className="px-5 py-3.5">Pekerjaan</th>
                  <th className="px-5 py-3.5">Alamat</th>
                  <th className="px-5 py-3.5">Kontak</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900 text-xs uppercase">{w.nama_lengkap}</p>
                      <p className="font-mono text-[11px] text-slate-500">NIK: {w.nik}</p>
                      {w.no_kk && <p className="font-mono text-[10px] text-slate-400">KK: {w.no_kk}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        w.jenis_kelamin === 'Laki-laki' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {w.jenis_kelamin}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="text-slate-800">{w.tempat_lahir}, {w.tanggal_lahir ? formatTanggalIndo(w.tanggal_lahir) : '-'}</p>
                      <p className="text-slate-400 text-[11px]">{w.agama || 'Islam'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="text-slate-800">{w.pekerjaan || '-'}</p>
                      <p className="text-slate-400 text-[11px]">{w.status_perkawinan}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs max-w-xs">
                      <p className="text-slate-800 truncate" title={w.alamat}>{w.alamat}</p>
                      <p className="text-slate-400 text-[10px]">RT {w.rt || '005'} / RW {w.rw || '012'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {w.no_hp ? (
                        <a
                          href={`https://wa.me/${w.no_hp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          {w.no_hp}
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Warga"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.nama_lengkap)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Warga"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Tambah/Edit Warga */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingWarga ? 'Edit Data Warga' : 'Tambah Warga Baru ke Buku Induk RT'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK (16 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={e => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="3276..."
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kartu Keluarga (KK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.no_kk}
                    onChange={e => setFormData({ ...formData, no_kk: e.target.value.replace(/\D/g, '') })}
                    placeholder="3276..."
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_lengkap}
                    onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 uppercase focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agama</label>
                  <select
                    value={formData.agama}
                    onChange={e => setFormData({ ...formData, agama: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempat_lahir}
                    onChange={e => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={e => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Perkawinan</label>
                  <select
                    value={formData.status_perkawinan}
                    onChange={e => setFormData({ ...formData, status_perkawinan: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Kawin">Kawin</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={formData.pekerjaan}
                    onChange={e => setFormData({ ...formData, pekerjaan: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={e => setFormData({ ...formData, no_hp: e.target.value })}
                    placeholder="08..."
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Tinggal</label>
                  <select
                    value={formData.status_tinggal}
                    onChange={e => setFormData({ ...formData, status_tinggal: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tetap">Warga Tetap</option>
                    <option value="Kontrak / Kost">Warga Kontrak / Kost</option>
                    <option value="Pindah">Pindah Domisili</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.alamat}
                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Jl. ..., No. ..."
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Data Warga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

