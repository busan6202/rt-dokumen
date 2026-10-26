import React, { useState } from 'react'
import { db } from '../supabaseClient'
import { formatTanggalIndo, formatWhatsAppNumber } from '../utils/helpers'
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
  FileSpreadsheet,
  Building2,
  ShieldCheck
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
    rt: rtProfile?.rt_number || '00',
    rw: rtProfile?.rw_number || '00',
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="bg-[#131c2e] p-5 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-amber-400" />
            Buku Induk Kependudukan RT {rtProfile?.rt_number}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar data penduduk terdaftar ({wargaList.length} jiwa) untuk pembuatan surat instan
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
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#0c1322] text-white placeholder-slate-500 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition whitespace-nowrap active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Warga
          </button>
        </div>
      </div>

      {/* Table List - Civic Ledger */}
      <div className="bg-[#131c2e] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-xs font-semibold text-slate-300">Tidak ada data warga ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1322] border-b border-white/[0.08] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nama & NIK</th>
                  <th className="px-5 py-3.5">Jenis Kelamin</th>
                  <th className="px-5 py-3.5">TTL & Agama</th>
                  <th className="px-5 py-3.5">Pekerjaan</th>
                  <th className="px-5 py-3.5">Alamat Domisili</th>
                  <th className="px-5 py-3.5">Kontak WhatsApp</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {filtered.map(w => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-white text-xs uppercase">{w.nama_lengkap}</p>
                      <p className="font-mono text-[11px] text-amber-300">NIK: {w.nik}</p>
                      {w.no_kk && <p className="font-mono text-[10px] text-slate-400">KK: {w.no_kk}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        w.jenis_kelamin === 'Laki-laki'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {w.jenis_kelamin}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="text-slate-200">{w.tempat_lahir}, {w.tanggal_lahir ? formatTanggalIndo(w.tanggal_lahir) : '-'}</p>
                      <p className="text-slate-400 text-[11px]">{w.agama || 'Islam'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="text-slate-200">{w.pekerjaan || '-'}</p>
                      <p className="text-slate-400 text-[11px]">{w.status_perkawinan}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs max-w-xs">
                      <p className="text-slate-200 truncate" title={w.alamat}>{w.alamat}</p>
                      <p className="text-slate-400 text-[10px] font-mono">RT {w.rt || '00'} / RW {w.rw || '00'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {w.no_hp ? (
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(w.no_hp)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          {w.no_hp}
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(w)}
                          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/[0.05] rounded-lg transition"
                          title="Edit Warga"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.nama_lengkap)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131c2e] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0c1322]">
              <h3 className="font-bold text-white text-base tracking-tight">
                {editingWarga ? 'Edit Data Warga' : 'Tambah Warga Baru ke Buku Induk RT'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NIK (16 Digit) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={e => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="3276..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor Kartu Keluarga (KK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.no_kk}
                    onChange={e => setFormData({ ...formData, no_kk: e.target.value.replace(/\D/g, '') })}
                    placeholder="3276..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Sesuai KTP <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_lengkap}
                    onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 uppercase font-semibold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Agama</label>
                  <select
                    value={formData.agama}
                    onChange={e => setFormData({ ...formData, agama: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempat_lahir}
                    onChange={e => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={e => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Perkawinan</label>
                  <select
                    value={formData.status_perkawinan}
                    onChange={e => setFormData({ ...formData, status_perkawinan: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Kawin">Kawin</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={formData.pekerjaan}
                    onChange={e => setFormData({ ...formData, pekerjaan: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={e => setFormData({ ...formData, no_hp: e.target.value })}
                    placeholder="08..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Tinggal</label>
                  <select
                    value={formData.status_tinggal}
                    onChange={e => setFormData({ ...formData, status_tinggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Tetap">Warga Tetap</option>
                    <option value="Kontrak / Kost">Warga Kontrak / Kost</option>
                    <option value="Pindah">Pindah Domisili</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Domisili Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.alamat}
                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Jl. ..., No. ..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl border border-white/10 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
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
