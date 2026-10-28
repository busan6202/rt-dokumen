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
  Briefcase,
  Sparkles,
  Building2,
  Clock,
  ChevronRight
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

  const recentSurat = suratList.slice(0, 6)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner - Dark Civic Luxe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#131c2e] via-[#0f172a] to-[#0b101d] border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          {/* Official RT / RW Emblem Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-4 text-xs font-semibold text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tracking-wide text-amber-300">
              RUKUN TETANGGA {rtProfile?.rt_number || '00'} / RW {rtProfile?.rw_number || '00'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 hidden sm:inline">Kel. {rtProfile?.kelurahan}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Sistem Administrasi <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">Surat Digital RT</span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 mt-2.5 max-w-2xl leading-relaxed">
            Portal terpadu penerbitan surat pengantar resmi, surat keterangan kependudukan, buku induk warga, serta verifikasi QR code anti-pemalsuan.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mt-6 sm:mt-7">
            <button
              onClick={onNewSurat}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              Buat Surat Pengantar Baru
            </button>

            <button
              onClick={onOpenArsip}
              className="inline-flex items-center justify-center gap-2 px-4.5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-semibold text-xs border border-white/10 backdrop-blur-md transition-all duration-200"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              Buku Arsip Registrasi ({suratList.length})
            </button>

            <button
              onClick={onOpenWarga}
              className="inline-flex items-center justify-center gap-2 px-4.5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 font-semibold text-xs border border-white/10 backdrop-blur-md transition-all duration-200"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              Buku Warga ({wargaList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Civic Instrument Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Surat */}
        <div className="relative overflow-hidden bg-[#131c2e] p-5 rounded-2xl border border-white/[0.08] shadow-lg flex items-center justify-between group hover:border-amber-400/40 transition">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">Total Surat Terbit</p>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">{suratList.length}</h3>
            <span className="text-[11px] text-amber-400/90 font-medium inline-flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              Terdokumentasi Resmi
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Surat Bulan Ini */}
        <div className="relative overflow-hidden bg-[#131c2e] p-5 rounded-2xl border border-white/[0.08] shadow-lg flex items-center justify-between group hover:border-amber-400/40 transition">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">Periode Bulan Ini</p>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">{suratBulanIni}</h3>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">Tahun {currentYear}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Total Warga */}
        <div
          onClick={onOpenWarga}
          className="relative overflow-hidden bg-[#131c2e] p-5 rounded-2xl border border-white/[0.08] shadow-lg flex items-center justify-between cursor-pointer hover:border-emerald-400/40 transition group"
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">Buku Induk Warga</p>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-mono tracking-tight">{wargaList.length}</h3>
            <span className="text-[11px] text-emerald-400 font-semibold inline-flex items-center gap-1 mt-1">
              Kelola Data <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Database Status */}
        <div
          onClick={onOpenSettings}
          className="relative overflow-hidden bg-[#131c2e] p-5 rounded-2xl border border-white/[0.08] shadow-lg flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition group"
        >
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">Sinkronisasi Cloud</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <h3 className="text-sm font-bold text-white font-mono">
                {isConnected ? 'Supabase Aktif' : 'Mode Offline/Lokal'}
              </h3>
            </div>
            <span className="text-[11px] text-amber-300 font-semibold inline-flex items-center gap-1 mt-1">
              Pengaturan Database <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Launch Jenis Surat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Template Surat Resmi Siap Terbit
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pilih format surat dinas sesuai permohonan warga</p>
          </div>
          <button
            onClick={onNewSurat}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition hidden sm:inline-flex items-center gap-1"
          >
            Formulir Lengkap <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {JENIS_SURAT_CONFIG.slice(0, 4).map(cfg => (
            <div
              key={cfg.id}
              onClick={onNewSurat}
              className="bg-[#131c2e] p-4.5 rounded-2xl border border-white/[0.08] hover:border-amber-400/50 hover:bg-[#16233a] transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {cfg.kode}
                </span>
                <h4 className="text-sm font-bold text-white mt-2.5 group-hover:text-amber-300 transition">
                  {cfg.nama}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{cfg.deskripsi}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center text-xs font-semibold text-amber-400 gap-1">
                Buka Formulir <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Letters Table - Administrative Ledger */}
      <div className="bg-[#131c2e] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Buku Register Surat Terakhir</h3>
            <p className="text-xs text-slate-400 mt-0.5">Catatan arsip dokumen yang baru saja diterbitkan</p>
          </div>
          <button
            onClick={onOpenArsip}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition"
          >
            Lihat Semua Arsip ({suratList.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSurat.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            Belum ada surat yang diterbitkan. Klik tombol <span className="text-amber-400 font-semibold">"Buat Surat Pengantar Baru"</span> untuk membuat surat perdana.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentSurat.map(s => (
              <div
                key={s.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] transition"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {s.nomor_surat}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-semibold border border-white/10">
                      {s.judul_surat}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 mt-1.5">
                    Pemohon: <span className="font-bold text-white">{s.pemohon_nama}</span> • <span className="text-slate-400">{formatTanggalIndo(s.tanggal_surat)}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">Keperluan: {s.keperluan}</p>
                </div>

                <button
                  onClick={() => onSelectSurat(s)}
                  className="self-end sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-slate-950 bg-white/[0.08] hover:bg-amber-400 rounded-lg border border-white/10 transition-all duration-150"
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
