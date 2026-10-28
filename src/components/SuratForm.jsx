import React, { useState, useEffect } from 'react'
import {
  JENIS_SURAT_CONFIG,
  generateNomorSurat,
  BULAN_ROMAWI
} from '../utils/helpers'
import { db } from '../supabaseClient'
import confetti from 'canvas-confetti'
import {
  FileText,
  CreditCard,
  Home,
  HeartOff,
  Briefcase,
  Users,
  Truck,
  UserCheck,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  FileCheck2,
  Calendar,
  Hash,
  ShieldCheck,
  Lock
} from 'lucide-react'

// Icon mapping
const ICONS = {
  FileText,
  CreditCard,
  Home,
  HeartOff,
  Briefcase,
  Users,
  Truck
}

export default function SuratForm({ rtProfile, wargaList, onSuratCreated, onCancel, currentSession }) {
  const isPengurus = currentSession?.role === 'pengurus'
  const [selectedJenis, setSelectedJenis] = useState(JENIS_SURAT_CONFIG[0].id)
  const [selectedWargaId, setSelectedWargaId] = useState('')
  const [wargaSearch, setWargaSearch] = useState('')
  const [isNewWarga, setIsNewWarga] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form Fields
  const [nomorSurat, setNomorSurat] = useState('')
  const [nomorUrut, setNomorUrut] = useState(1)
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().split('T')[0])
  const [keperluan, setKeperluan] = useState(JENIS_SURAT_CONFIG[0].defaultKeperluan)

  // Pemohon data
  const [pemohon, setPemohon] = useState({
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
    rt: rtProfile.rt_number || '00',
    rw: rtProfile.rw_number || '00',
    no_hp: '',
    email: ''
  })

  // Specific letter data
  const [khusus, setKhusus] = useState({
    // Kematian
    hari_tanggal_kematian: '',
    jam_kematian: '08:30',
    tempat_kematian: 'Rumah Duka',
    penyebab_kematian: 'Sakit / Usia Lanjut',
    nama_pelapor: '',
    hubungan_pelapor: 'Anak Kandung',
    // Usaha
    nama_usaha: '',
    jenis_usaha: 'Warung Kelontong & Sembako',
    alamat_usaha: '',
    tahun_berdiri: new Date().getFullYear() - 2,
    // Domisili
    sejak_tahun: new Date().getFullYear() - 3,
    // KTP
    jenis_ktp: 'Pembuatan KTP Baru (Usia 17 Tahun)',
    // Pindah
    alamat_tujuan: '',
    kelurahan_tujuan: '',
    kecamatan_tujuan: '',
    kota_tujuan: '',
    alasan_pindah: 'Pekerjaan / Mengikuti Keluarga'
  })

  // Auto generate next sequence number on load
  useEffect(() => {
    async function loadNextNomor() {
      const year = new Date(tanggalSurat).getFullYear()
      const nextNum = await db.getNextNomorSurat(year)
      setNomorUrut(nextNum)
      const generated = generateNomorSurat(
        rtProfile.format_nomor_surat,
        nextNum,
        rtProfile.rt_number,
        rtProfile.rw_number,
        new Date(tanggalSurat)
      )
      setNomorSurat(generated)
    }
    loadNextNomor()
  }, [rtProfile, tanggalSurat])

  // Pre-fill if warga is logged in with linked resident profile
  useEffect(() => {
    if (currentSession && currentSession.role === 'warga') {
      if (currentSession.nik) {
        const found = wargaList.find(w => w.nik === currentSession.nik)
        if (found) {
          handleSelectWarga(found)
          return
        }
      }
      if (currentSession.nama) {
        const found = wargaList.find(w => w.nama_lengkap.toLowerCase() === currentSession.nama.toLowerCase())
        if (found) {
          handleSelectWarga(found)
          return
        }
        setPemohon(prev => ({
          ...prev,
          nama_lengkap: currentSession.nama,
          nik: currentSession.nik || prev.nik,
          no_hp: currentSession.no_hp || prev.no_hp
        }))
      }
    }
  }, [currentSession, wargaList])

  // Update keperluan default when jenis surat changes
  const handleJenisChange = (id) => {
    setSelectedJenis(id)
    const conf = JENIS_SURAT_CONFIG.find(c => c.id === id)
    if (conf) {
      setKeperluan(conf.defaultKeperluan)
    }
  }

  // Handle select existing resident
  const handleSelectWarga = (w) => {
    setSelectedWargaId(w.id)
    setIsNewWarga(false)
    setPemohon({
      nik: w.nik || '',
      no_kk: w.no_kk || '',
      nama_lengkap: w.nama_lengkap || '',
      jenis_kelamin: w.jenis_kelamin || 'Laki-laki',
      tempat_lahir: w.tempat_lahir || '',
      tanggal_lahir: w.tanggal_lahir || '',
      agama: w.agama || 'Islam',
      status_perkawinan: w.status_perkawinan || 'Kawin',
      pekerjaan: w.pekerjaan || '',
      kewarganegaraan: w.kewarganegaraan || 'WNI',
      alamat: w.alamat || '',
      rt: w.rt || rtProfile.rt_number,
      rw: w.rw || rtProfile.rw_number,
      no_hp: w.no_hp || '',
      email: w.email || ''
    })

    if (selectedJenis === 'kematian') {
      setKhusus(prev => ({ ...prev, nama_pelapor: '' }))
    }
    if (selectedJenis === 'usaha') {
      setKhusus(prev => ({ ...prev, alamat_usaha: w.alamat || '' }))
    }
  }

  // Regenerate nomor surat with current counter
  const handleRegenerateNomor = () => {
    const generated = generateNomorSurat(
      rtProfile.format_nomor_surat,
      nomorUrut,
      rtProfile.rt_number,
      rtProfile.rw_number,
      new Date(tanggalSurat)
    )
    setNomorSurat(generated)
  }

  // Filtered residents for quick pick
  const filteredWarga = wargaList.filter(w =>
    w.nama_lengkap.toLowerCase().includes(wargaSearch.toLowerCase()) ||
    w.nik.includes(wargaSearch)
  )

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!pemohon.nama_lengkap || !pemohon.nik) {
      alert('Mohon lengkapi Nama Pemohon dan NIK.')
      return
    }

    if (pemohon.nik.length !== 16 && !confirm(`Panjang NIK (${pemohon.nik.length} digit) tidak standar (16 digit). Lanjutkan?`)) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isNewWarga && pemohon.nik) {
        await db.saveWarga({
          ...pemohon,
          rt: pemohon.rt || rtProfile.rt_number,
          rw: pemohon.rw || rtProfile.rw_number
        })
      }

      const activeConfig = JENIS_SURAT_CONFIG.find(j => j.id === selectedJenis)
      const token = 'rt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8)

      const suratPayload = {
        nomor_surat: nomorSurat,
        nomor_urut: nomorUrut,
        tahun: new Date(tanggalSurat).getFullYear(),
        bulan: new Date(tanggalSurat).getMonth() + 1,
        jenis_surat: selectedJenis,
        judul_surat: activeConfig ? activeConfig.judulDokumen : 'SURAT PENGANTAR',
        tanggal_surat: tanggalSurat,
        pemohon_nik: pemohon.nik,
        pemohon_nama: pemohon.nama_lengkap,
        pemohon_data: pemohon,
        data_khusus: khusus,
        keperluan: keperluan,
        status: 'Diterbitkan',
        qr_token: token,
        signed_by: rtProfile.nama_ketua_rt
      }

      const created = await db.saveSurat(suratPayload)

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      })

      if (onSuratCreated) {
        onSuratCreated(created)
      }
    } catch (err) {
      console.error('Gagal membuat surat:', err)
      alert(`Terjadi kesalahan: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeConfig = JENIS_SURAT_CONFIG.find(j => j.id === selectedJenis)

  return (
    <form onSubmit={handleSubmit} className="space-y-7 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 1. PILIH JENIS SURAT */}
      <div className="bg-[#131c2e] p-6 sm:p-7 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-mono font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Pilih Klasifikasi Dokumen RT</h3>
            <p className="text-xs text-slate-400">Pilih format surat keterangan atau pengantar resmi yang akan diterbitkan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {JENIS_SURAT_CONFIG.map(cfg => {
            const IconComponent = ICONS[cfg.icon] || FileText
            const isSelected = selectedJenis === cfg.id

            return (
              <button
                key={cfg.id}
                type="button"
                onClick={() => handleJenisChange(cfg.id)}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'border-white/[0.08] hover:border-white/20 bg-[#0c1322] hover:bg-[#10192b]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/[0.06] text-slate-300'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      TERPILIH
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-white leading-snug">{cfg.nama}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{cfg.deskripsi}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. DATA PEMOHON / WARGA */}
      <div className="bg-[#131c2e] p-6 sm:p-7 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-mono font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Identitas Pemohon / Warga</h3>
              <p className="text-xs text-slate-400">
                {isPengurus
                  ? 'Pilih warga dari Buku Induk atau input data warga baru'
                  : 'Identitas resmi sesuai akun warga yang meminta surat'}
              </p>
            </div>
          </div>

          {/* Opsi Buku Warga & Input Warga Baru hanya untuk Pengurus RT */}
          {isPengurus && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewWarga(false)
                  if (wargaList.length > 0) handleSelectWarga(wargaList[0])
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  !isNewWarga ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/10'
                }`}
              >
                Pilih dari Buku Warga ({wargaList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNewWarga(true)
                  setSelectedWargaId('')
                  setPemohon({
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
                    rt: rtProfile.rt_number || '00',
                    rw: rtProfile.rw_number || '00',
                    no_hp: '',
                    email: ''
                  })
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  isNewWarga ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/10'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Input Warga Baru
              </button>
            </div>
          )}
        </div>

        {/* Banner Pemohon Warga Terverifikasi (Khusus saat Warga yang login) */}
        {!isPengurus && (
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                  <ShieldCheck className="w-3 h-3" /> IDENTITAS RESMI WARGA PEMOHON
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug">
                  {pemohon.nama_lengkap || currentSession?.nama || 'Warga Terdaftar'}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  NIK: <span className="text-amber-300 font-semibold">{pemohon.nik || currentSession?.nik || '-'}</span>
                  {pemohon.no_kk && <span> • No. KK: {pemohon.no_kk}</span>}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0c1322] border border-white/10 rounded-xl text-xs text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Warga Resmi RT {rtProfile.rt_number} / RW {rtProfile.rw_number}
            </div>
          </div>
        )}

        {/* Existing Warga Picker (Hanya untuk Pengurus RT) */}
        {isPengurus && !isNewWarga && (
          <div className="mb-6 p-4 bg-[#0c1322] rounded-xl border border-white/[0.08]">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ketik nama atau NIK warga untuk mencari..."
                value={wargaSearch}
                onChange={e => setWargaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#131c2e] text-white placeholder-slate-500 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-white/[0.06] bg-[#131c2e] rounded-lg border border-white/[0.08]">
              {filteredWarga.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tidak ada warga ditemukan dengan kata kunci tersebut.
                </div>
              ) : (
                filteredWarga.map(w => (
                  <div
                    key={w.id}
                    onClick={() => handleSelectWarga(w)}
                    className={`p-3 flex items-center justify-between cursor-pointer transition ${
                      selectedWargaId === w.id ? 'bg-amber-400/10 border-l-2 border-amber-400 font-medium' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{w.nama_lengkap}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        NIK: <span className="text-amber-300">{w.nik}</span> • {w.pekerjaan || 'Warga'} • {w.alamat}
                      </p>
                    </div>
                    {selectedWargaId === w.id ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" /> TERPILIH
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 hover:text-slate-300">Pilih</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pemohon Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Nomor Induk Kependudukan (NIK) <span className="text-rose-400">*</span>
              </label>
              {!isPengurus && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (Sesuai ID Login)
                </span>
              )}
            </div>
            <input
              type="text"
              required
              maxLength={16}
              readOnly={!isPengurus}
              value={pemohon.nik}
              onChange={e => isPengurus && setPemohon({ ...pemohon, nik: e.target.value.replace(/\D/g, '') })}
              placeholder="Contoh: 3276011505920003"
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border font-mono transition ${
                !isPengurus
                  ? 'bg-[#090d16] text-amber-300 border-white/10 cursor-not-allowed select-none'
                  : 'bg-[#0c1322] text-white border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nomor Kartu Keluarga (No. KK)
            </label>
            <input
              type="text"
              maxLength={16}
              value={pemohon.no_kk}
              onChange={e => setPemohon({ ...pemohon, no_kk: e.target.value.replace(/\D/g, '') })}
              placeholder="Contoh: 3276010101180001"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 font-mono focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Nama Lengkap Pemohon <span className="text-rose-400">*</span>
              </label>
              {!isPengurus && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Terkunci (Sesuai ID Login)
                </span>
              )}
            </div>
            <input
              type="text"
              required
              readOnly={!isPengurus}
              value={pemohon.nama_lengkap}
              onChange={e => isPengurus && setPemohon({ ...pemohon, nama_lengkap: e.target.value })}
              placeholder="Nama sesuai KTP"
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border font-semibold uppercase transition ${
                !isPengurus
                  ? 'bg-[#090d16] text-white border-white/10 cursor-not-allowed select-none'
                  : 'bg-[#0c1322] text-white border-white/10 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jenis Kelamin <span className="text-rose-400">*</span>
            </label>
            <select
              value={pemohon.jenis_kelamin}
              onChange={e => setPemohon({ ...pemohon, jenis_kelamin: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tempat Lahir
            </label>
            <input
              type="text"
              value={pemohon.tempat_lahir}
              onChange={e => setPemohon({ ...pemohon, tempat_lahir: e.target.value })}
              placeholder="Contoh: Jakarta"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={pemohon.tanggal_lahir}
              onChange={e => setPemohon({ ...pemohon, tanggal_lahir: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Agama
            </label>
            <select
              value={pemohon.agama}
              onChange={e => setPemohon({ ...pemohon, agama: e.target.value })}
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status Perkawinan
            </label>
            <select
              value={pemohon.status_perkawinan}
              onChange={e => setPemohon({ ...pemohon, status_perkawinan: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
            >
              <option value="Kawin">Kawin</option>
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pekerjaan
            </label>
            <input
              type="text"
              value={pemohon.pekerjaan}
              onChange={e => setPemohon({ ...pemohon, pekerjaan: e.target.value })}
              placeholder="Contoh: Karyawan Swasta / Wiraswasta"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nomor WhatsApp / HP
            </label>
            <input
              type="text"
              value={pemohon.no_hp}
              onChange={e => setPemohon({ ...pemohon, no_hp: e.target.value })}
              placeholder="Contoh: 081298765432"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alamat Lengkap Domisili / Tempat Tinggal <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={pemohon.alamat}
              onChange={e => setPemohon({ ...pemohon, alamat: e.target.value })}
              placeholder="Contoh: Jl. Cempaka Indah No. 10 Blok B"
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. RINCIAN SPESIFIK BERDASARKAN JENIS SURAT */}
      <div className="bg-[#131c2e] p-6 sm:p-7 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-mono font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Rincian Dokumen Khusus ({activeConfig?.nama})</h3>
            <p className="text-xs text-slate-400">Parameter khusus dan rincian perihal surat</p>
          </div>
        </div>

        {/* Khusus Kematian */}
        {selectedJenis === 'kematian' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4.5 bg-rose-500/10 rounded-xl border border-rose-500/25">
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1">Hari & Tanggal Meninggal</label>
              <input
                type="text"
                value={khusus.hari_tanggal_kematian}
                onChange={e => setKhusus({ ...khusus, hari_tanggal_kematian: e.target.value })}
                placeholder="Contoh: Senin, 14 Oktober 2026"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1">Pukul / Jam Meninggal</label>
              <input
                type="text"
                value={khusus.jam_kematian}
                onChange={e => setKhusus({ ...khusus, jam_kematian: e.target.value })}
                placeholder="Contoh: 08:30 WIB"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1">Tempat Meninggal</label>
              <input
                type="text"
                value={khusus.tempat_kematian}
                onChange={e => setKhusus({ ...khusus, tempat_kematian: e.target.value })}
                placeholder="Contoh: RSUD Depok / Rumah Duka"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1">Penyebab Kematian</label>
              <input
                type="text"
                value={khusus.penyebab_kematian}
                onChange={e => setKhusus({ ...khusus, penyebab_kematian: e.target.value })}
                placeholder="Contoh: Sakit biasa / Usia Lanjut"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1">Nama Pelapor / Ahli Waris</label>
              <input
                type="text"
                value={khusus.nama_pelapor}
                onChange={e => setKhusus({ ...khusus, nama_pelapor: e.target.value })}
                placeholder="Nama pihak keluarga yang melapor"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-300 mb-1">Hubungan Pelapor</label>
              <input
                type="text"
                value={khusus.hubungan_pelapor}
                onChange={e => setKhusus({ ...khusus, hubungan_pelapor: e.target.value })}
                placeholder="Contoh: Anak Kandung / Istri / Suami"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* Khusus Usaha (SKU) */}
        {selectedJenis === 'usaha' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4.5 bg-amber-500/10 rounded-xl border border-amber-500/25">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">Nama Toko / Usaha</label>
              <input
                type="text"
                value={khusus.nama_usaha}
                onChange={e => setKhusus({ ...khusus, nama_usaha: e.target.value })}
                placeholder="Contoh: Warung Berkah Sembako"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">Bidang / Jenis Usaha</label>
              <input
                type="text"
                value={khusus.jenis_usaha}
                onChange={e => setKhusus({ ...khusus, jenis_usaha: e.target.value })}
                placeholder="Contoh: Perdagangan Bahan Pokok / Kuliner"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">Alamat Tempat Usaha</label>
              <input
                type="text"
                value={khusus.alamat_usaha}
                onChange={e => setKhusus({ ...khusus, alamat_usaha: e.target.value })}
                placeholder="Lokasi tempat berjualan / workshop"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">Berjalan Sejak Tahun</label>
              <input
                type="number"
                value={khusus.tahun_berdiri}
                onChange={e => setKhusus({ ...khusus, tahun_berdiri: e.target.value })}
                placeholder="Contoh: 2021"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400 font-mono"
              />
            </div>
          </div>
        )}

        {/* Khusus Pengantar KTP */}
        {selectedJenis === 'pengantar_ktp' && (
          <div className="mb-4 p-4.5 bg-blue-500/10 rounded-xl border border-blue-500/25">
            <label className="block text-xs font-semibold text-blue-300 mb-1">Jenis Permohonan Dokumen KTP / KK</label>
            <select
              value={khusus.jenis_ktp}
              onChange={e => setKhusus({ ...khusus, jenis_ktp: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
            >
              <option value="Pembuatan KTP Baru (Pemula Usia 17 Tahun)">Pembuatan KTP Baru (Pemula Usia 17 Tahun)</option>
              <option value="Penggantian KTP Rusak">Penggantian KTP Rusak</option>
              <option value="Penggantian KTP Hilang (Disertai Surat Kehilangan Polisi)">Penggantian KTP Hilang (Disertai Surat Kehilangan Polisi)</option>
              <option value="Perubahan Biodata / Data Elemen KTP">Perubahan Biodata / Data Elemen KTP</option>
              <option value="Penerbitan Kartu Keluarga (KK) Baru / Pecah KK">Penerbitan Kartu Keluarga (KK) Baru / Pecah KK</option>
            </select>
          </div>
        )}

        {/* Khusus Pindah */}
        {selectedJenis === 'pindah' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4.5 bg-cyan-500/10 rounded-xl border border-cyan-500/25">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-cyan-300 mb-1">Alamat Tujuan Pindah</label>
              <input
                type="text"
                value={khusus.alamat_tujuan}
                onChange={e => setKhusus({ ...khusus, alamat_tujuan: e.target.value })}
                placeholder="Contoh: Jl. Gatot Subroto No. 88"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1">Kelurahan / Desa Tujuan</label>
              <input
                type="text"
                value={khusus.kelurahan_tujuan}
                onChange={e => setKhusus({ ...khusus, kelurahan_tujuan: e.target.value })}
                placeholder="Kelurahan tujuan"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cyan-300 mb-1">Kecamatan & Kota Tujuan</label>
              <input
                type="text"
                value={khusus.kota_tujuan}
                onChange={e => setKhusus({ ...khusus, kota_tujuan: e.target.value })}
                placeholder="Kecamatan, Kota/Kabupaten"
                className="w-full px-3.5 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* Keperluan Surat */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Keperluan Pembuatan Surat <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={keperluan}
            onChange={e => setKeperluan(e.target.value)}
            placeholder="Tuliskan keperluan surat secara jelas..."
            className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Teks ini akan dicetak tebal pada bagian inti surat pengantar resmi.
          </p>
        </div>
      </div>

      {/* 4. PENOMORAN & TANGGAL SURAT */}
      <div className="bg-[#131c2e] p-6 sm:p-7 rounded-2xl border border-white/[0.08] shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-mono font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Penomoran Dokumen & Tanggal Terbit</h3>
            <p className="text-xs text-slate-400">Nomor surat digenerate otomatis berdasarkan format buku administrasi RT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tanggal Diterbitkan
            </label>
            <input
              type="date"
              value={tanggalSurat}
              onChange={e => setTanggalSurat(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nomor Urut Register
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={nomorUrut}
                onChange={e => {
                  const val = parseInt(e.target.value, 10) || 1
                  setNomorUrut(val)
                  setNomorSurat(
                    generateNomorSurat(
                      rtProfile.format_nomor_surat,
                      val,
                      rtProfile.rt_number,
                      rtProfile.rw_number,
                      new Date(tanggalSurat)
                    )
                  )
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 font-mono font-bold"
              />
              <button
                type="button"
                onClick={handleRegenerateNomor}
                title="Refresh nomor surat"
                className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 rounded-xl border border-white/10 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nomor Surat Lengkap Otomatis
            </label>
            <input
              type="text"
              required
              value={nomorSurat}
              onChange={e => setNomorSurat(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] rounded-xl border border-amber-400/30 font-mono font-bold text-amber-300 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl border border-white/10 transition"
          >
            Batal
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Menyimpan Arsip Dokumen...
            </>
          ) : (
            <>
              <FileCheck2 className="w-4 h-4" />
              Terbitkan Dokumen & Pratinjau
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
