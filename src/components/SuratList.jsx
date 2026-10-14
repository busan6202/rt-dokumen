import React, { useState } from 'react'
import { formatTanggalIndo, exportToCSV, JENIS_SURAT_CONFIG } from '../utils/helpers'
import {
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  ExternalLink,
  FileText,
  Calendar,
  User,
  PlusCircle,
  Eye
} from 'lucide-react'

export default function SuratList({ suratList, onSelectSurat, onDeleteSurat, onNewSurat }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  const filteredSurat = suratList.filter(s => {
    const matchSearch =
      s.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pemohon_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.pemohon_nik && s.pemohon_nik.includes(searchTerm)) ||
      (s.keperluan && s.keperluan.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchCategory = selectedFilter === 'ALL' || s.jenis_surat === selectedFilter

    return matchSearch && matchCategory
  })

  const handleExport = () => {
    const exportData = filteredSurat.map(s => ({
      'Nomor Surat': s.nomor_surat,
      'Tanggal Surat': s.tanggal_surat,
      'Jenis Surat': s.judul_surat,
      'Nama Pemohon': s.pemohon_nama,
      'NIK': s.pemohon_nik,
      'Keperluan': s.keperluan,
      'Status': s.status,
      'Token QR': s.qr_token
    }))
    exportToCSV(exportData, `buku-arsip-surat-rt-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Category Filter */}
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nomor surat, nama warga, atau NIK..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-white focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 hover:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Jenis Surat ({suratList.length})</option>
              {JENIS_SURAT_CONFIG.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={filteredSurat.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-40"
            title="Download Arsip CSV/Excel"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>

          {onNewSurat && (
            <button
              onClick={onNewSurat}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Surat Baru
            </button>
          )}
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSurat.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700">Belum Ada Arsip Surat</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Surat yang telah diterbitkan akan tersimpan otomatis di sini dan dapat dicetak ulang kapan saja.
            </p>
            {onNewSurat && (
              <button
                onClick={onNewSurat}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Mulai Buat Surat Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nomor & Tanggal</th>
                  <th className="px-5 py-3.5">Jenis Dokumen</th>
                  <th className="px-5 py-3.5">Pemohon</th>
                  <th className="px-5 py-3.5">Keperluan</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSurat.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    {/* Nomor & Tanggal */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-slate-900 block text-xs">
                        {s.nomor_surat}
                      </span>
                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatTanggalIndo(s.tanggal_surat)}
                      </span>
                    </td>

                    {/* Jenis Dokumen */}
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-900 block text-xs">
                        {s.judul_surat}
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                        {s.jenis_surat?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Pemohon */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-900 block text-xs">
                        {s.pemohon_nama}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        NIK: {s.pemohon_nik}
                      </span>
                    </td>

                    {/* Keperluan */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2" title={s.keperluan}>
                        {s.keperluan}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status || 'Diterbitkan'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectSurat(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition"
                          title="Lihat Pratinjau & Cetak Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Pratinjau
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus arsip surat nomor ${s.nomor_surat}?`)) {
                              onDeleteSurat(s.id)
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Surat"
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
    </div>
  )
}

