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
  Eye,
  CheckCircle2,
  FileSpreadsheet
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Controls */}
      <div className="bg-[#131c2e] p-5 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Category Filter */}
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nomor surat, nama warga, atau NIK..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#0c1322] text-white placeholder-slate-500 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value)}
              className="px-3 py-2.5 text-xs bg-[#0c1322] text-slate-200 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Semua Jenis Dokumen ({suratList.length})</option>
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition disabled:opacity-40"
            title="Download Arsip CSV/Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Ekspor CSV
          </button>

          {onNewSurat && (
            <button
              onClick={onNewSurat}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Surat Baru
            </button>
          )}
        </div>
      </div>

      {/* Table & Cards - Register Ledger View */}
      <div className="bg-[#131c2e] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
        {filteredSurat.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-white">Belum Ada Catatan Arsip</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Surat yang telah diterbitkan akan tersimpan rapi di buku register ini dan siap dicetak ulang sewaktu-waktu.
            </p>
            {onNewSurat && (
              <button
                onClick={onNewSurat}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded-xl transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Mulai Buat Surat Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1322] border-b border-white/[0.08] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nomor Register & Tanggal</th>
                  <th className="px-5 py-3.5">Klasifikasi Dokumen</th>
                  <th className="px-5 py-3.5">Identitas Pemohon</th>
                  <th className="px-5 py-3.5">Perihal / Keperluan</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {filteredSurat.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition">
                    {/* Nomor & Tanggal */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-amber-300 block text-xs">
                        {s.nomor_surat}
                      </span>
                      <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatTanggalIndo(s.tanggal_surat)}
                      </span>
                    </td>

                    {/* Jenis Dokumen */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-white block text-xs">
                        {s.judul_surat}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400/80 font-semibold uppercase tracking-wider">
                        {s.jenis_surat?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Pemohon */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-white block text-xs">
                        {s.pemohon_nama}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        NIK: {s.pemohon_nik}
                      </span>
                    </td>

                    {/* Keperluan */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed" title={s.keperluan}>
                        {s.keperluan}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="w-3 h-3" />
                        {s.status || 'Diterbitkan'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectSurat(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-slate-950 bg-white/[0.08] hover:bg-amber-400 rounded-lg border border-white/10 transition-all duration-150"
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
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
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
