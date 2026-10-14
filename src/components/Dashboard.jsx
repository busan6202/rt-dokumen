import React from 'react'
import {
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Printer,
  ShieldCheck,
  CreditCard,
  Home,
  HeartOff,
  Briefcase
} from 'lucide-react'
import { JENIS_SURAT_CONFIG, formatTanggalIndo } from '../utils/helpers'
import { isSupabaseConfigured } from '../supabaseClient'

export default function Dashboard({
  rtProfile,
  suratList,
  wargaList,
  onNewSurat,
  onSelectSurat,
  onOpenSettings,
  onOpenWarga,
  onOpenArsip
}) {
  const isConnected = isSupabaseConfigured()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const suratBulanIni = suratList.filter(s => {
    if (!s.tanggal_surat) return false
    const d = new Date(s.tanggal_surat)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  }).length

  const recentSurat = suratList.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-700/15">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold tracking-wide text-blue-100 mb-3">
            <Building className="w-3.5 h-3.5" />
            Rukun Tetangga {rtProfile?.rt_number} / Rukun Warga {rtProfile?.rw_number}
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Sistem Layanan Surat Digital RT
          </h1>
          <p className="text-sm text-blue-100 mt-2 leading-relaxed">
            Kelurahan {rtProfile?.kelurahan}, Kecamatan {rtProfile?.kecamatan}, {rtProfile?.kota_kabupaten}. Terbitkan surat pengantar resmi, domisili, kematian, dan SKU dalam hitungan detik.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onNewSurat}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-xs shadow-md shadow-blue-900/20 hover:bg-blue-50 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Buat Surat Pengantar Baru
            </button>

            <button
              onClick={onOpenArsip}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs backdrop-blur-xs transition"
            >
              <FileText className="w-4 h-4" />
              Lihat Buku Arsip
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Surat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Surat Terbit</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{suratList.length}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold inline-flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Terdokumentasi
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Surat Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bulan Ini</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{suratBulanIni}</h3>
            <span className="text-[11px] text-slate-400 mt-1 block">Periode berjalan</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Total Warga */}
        <div
          onClick={onOpenWarga}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Warga Terdaftar</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{wargaList.length}</h3>
            <span className="text-[11px] text-blue-600 font-semibold inline-flex items-center gap-0.5 mt-1">
              Buku Induk <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Database Supabase Status */}
        <div
          onClick={onOpenSettings}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-300 transition"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Cloud</p>
            <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Supabase Aktif
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Mode Demo / Lokal
                </>
              )}
            </h3>
            <span className="text-[11px] text-blue-600 font-semibold inline-flex items-center gap-0.5 mt-1">
              Atur Koneksi <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className={`p-3 rounded-xl ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Launch Jenis Surat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Format Surat Siap Cetak</h3>
          <span className="text-xs text-slate-400">Pilih template untuk pembuatan langsung</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {JENIS_SURAT_CONFIG.slice(0, 4).map(cfg => (
            <div
              key={cfg.id}
              onClick={onNewSurat}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{cfg.kode}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition">
                  {cfg.nama}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cfg.deskripsi}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 gap-1">
                Buat Surat <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Letters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Arsip Surat Terakhir</h3>
            <p className="text-xs text-slate-500">Daftar surat yang baru diterbitkan</p>
          </div>
          <button
            onClick={onOpenArsip}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            Lihat Semua Arsip <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSurat.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada surat yang diterbitkan. Klik tombol "Buat Surat Pengantar Baru" di atas untuk memulai.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSurat.map(s => (
              <div
                key={s.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{s.nomor_surat}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                      {s.judul_surat}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-1">
                    Warga: <span className="font-semibold text-slate-900">{s.pemohon_nama}</span> • {formatTanggalIndo(s.tanggal_surat)}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Keperluan: {s.keperluan}</p>
                </div>

                <button
                  onClick={() => onSelectSurat(s)}
                  className="self-end sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Pratinjau / Cetak
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Building(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </svg>
  )
}

