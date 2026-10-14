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
  FileCheck2
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

export default function SuratForm({ rtProfile, wargaList, onSuratCreated, onCancel }) {
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
    rt: rtProfile.rt_number || '005',
    rw: rtProfile.rw_number || '012',
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

    // If death certificate, default applicant reporter to family
    if (selectedJenis === 'kematian') {
      setKhusus(prev => ({ ...prev, nama_pelapor: '' }))
    }
    // If business, default business address to resident address
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
      // Save resident to database if marked as new or not found
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. PILIH JENIS SURAT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pilih Jenis Surat RT</h3>
            <p className="text-xs text-slate-500">Pilih format surat keterangan atau pengantar yang ingin diterbitkan</p>
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
                className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
                <h4 className="font-semibold text-sm text-slate-900 leading-snug">{cfg.nama}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cfg.deskripsi}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. DATA PEMOHON / WARGA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Data Warga / Pemohon</h3>
              <p className="text-xs text-slate-500">Pilih warga dari database atau masukkan data warga baru</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsNewWarga(false)
                if (wargaList.length > 0) handleSelectWarga(wargaList[0])
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                !isNewWarga ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pilih dari Database ({wargaList.length})
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
                  rt: rtProfile.rt_number || '005',
                  rw: rtProfile.rw_number || '012',
                  no_hp: '',
                  email: ''
                })
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                isNewWarga ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Input Warga Baru
            </button>
          </div>
        </div>

        {/* Existing Warga Picker */}
        {!isNewWarga && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau NIK warga..."
                value={wargaSearch}
                onChange={e => setWargaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-200 bg-white rounded-lg border border-slate-200">
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
                      selectedWargaId === w.id ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{w.nama_lengkap}</p>
                      <p className="text-xs text-slate-500">
                        NIK: <span className="font-mono">{w.nik}</span> • {w.pekerjaan || 'Warga'} • {w.alamat}
                      </p>
                    </div>
                    {selectedWargaId === w.id ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Pilih</span>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={pemohon.nik}
              onChange={e => setPemohon({ ...pemohon, nik: e.target.value.replace(/\D/g, '') })}
              placeholder="Contoh: 3276011505920003"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Kartu Keluarga (No. KK)
            </label>
            <input
              type="text"
              maxLength={16}
              value={pemohon.no_kk}
              onChange={e => setPemohon({ ...pemohon, no_kk: e.target.value.replace(/\D/g, '') })}
              placeholder="Contoh: 3276010101180001"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={pemohon.nama_lengkap}
              onChange={e => setPemohon({ ...pemohon, nama_lengkap: e.target.value })}
              placeholder="Nama sesuai KTP"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <select
              value={pemohon.jenis_kelamin}
              onChange={e => setPemohon({ ...pemohon, jenis_kelamin: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tempat Lahir
            </label>
            <input
              type="text"
              value={pemohon.tempat_lahir}
              onChange={e => setPemohon({ ...pemohon, tempat_lahir: e.target.value })}
              placeholder="Contoh: Jakarta"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={pemohon.tanggal_lahir}
              onChange={e => setPemohon({ ...pemohon, tanggal_lahir: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agama
            </label>
            <select
              value={pemohon.agama}
              onChange={e => setPemohon({ ...pemohon, agama: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Perkawinan
            </label>
            <select
              value={pemohon.status_perkawinan}
              onChange={e => setPemohon({ ...pemohon, status_perkawinan: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Kawin">Kawin</option>
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pekerjaan
            </label>
            <input
              type="text"
              value={pemohon.pekerjaan}
              onChange={e => setPemohon({ ...pemohon, pekerjaan: e.target.value })}
              placeholder="Contoh: Karyawan Swasta / Wiraswasta"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp / HP
            </label>
            <input
              type="text"
              value={pemohon.no_hp}
              onChange={e => setPemohon({ ...pemohon, no_hp: e.target.value })}
              placeholder="Contoh: 081298765432"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Tempat Tinggal <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={pemohon.alamat}
              onChange={e => setPemohon({ ...pemohon, alamat: e.target.value })}
              placeholder="Contoh: Jl. Cempaka Indah No. 10 Blok B"
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. RINCIAN SPESIFIK BERDASARKAN JENIS SURAT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rincian Surat ({activeConfig?.nama})</h3>
            <p className="text-xs text-slate-500">Isi data khusus dan tujuan pembuatan surat</p>
          </div>
        </div>

        {/* Khusus Kematian */}
        {selectedJenis === 'kematian' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-rose-50/60 rounded-xl border border-rose-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hari & Tanggal Meninggal</label>
              <input
                type="text"
                value={khusus.hari_tanggal_kematian}
                onChange={e => setKhusus({ ...khusus, hari_tanggal_kematian: e.target.value })}
                placeholder="Contoh: Senin, 14 Oktober 2026"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pukul / Jam Meninggal</label>
              <input
                type="text"
                value={khusus.jam_kematian}
                onChange={e => setKhusus({ ...khusus, jam_kematian: e.target.value })}
                placeholder="Contoh: 08:30 WIB"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Meninggal</label>
              <input
                type="text"
                value={khusus.tempat_kematian}
                onChange={e => setKhusus({ ...khusus, tempat_kematian: e.target.value })}
                placeholder="Contoh: RSUD Depok / Rumah Duka"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penyebab Kematian</label>
              <input
                type="text"
                value={khusus.penyebab_kematian}
                onChange={e => setKhusus({ ...khusus, penyebab_kematian: e.target.value })}
                placeholder="Contoh: Sakit biasa / Usia Lanjut"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pelapor / Ahli Waris</label>
              <input
                type="text"
                value={khusus.nama_pelapor}
                onChange={e => setKhusus({ ...khusus, nama_pelapor: e.target.value })}
                placeholder="Nama pihak keluarga yang melapor"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hubungan Pelapor</label>
              <input
                type="text"
                value={khusus.hubungan_pelapor}
                onChange={e => setKhusus({ ...khusus, hubungan_pelapor: e.target.value })}
                placeholder="Contoh: Anak Kandung / Istri / Suami"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Khusus Usaha (SKU) */}
        {selectedJenis === 'usaha' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Toko / Usaha</label>
              <input
                type="text"
                value={khusus.nama_usaha}
                onChange={e => setKhusus({ ...khusus, nama_usaha: e.target.value })}
                placeholder="Contoh: Warung Berkah Sembako"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bidang / Jenis Usaha</label>
              <input
                type="text"
                value={khusus.jenis_usaha}
                onChange={e => setKhusus({ ...khusus, jenis_usaha: e.target.value })}
                placeholder="Contoh: Perdagangan Bahan Pokok / Kuliner"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Tempat Usaha</label>
              <input
                type="text"
                value={khusus.alamat_usaha}
                onChange={e => setKhusus({ ...khusus, alamat_usaha: e.target.value })}
                placeholder="Lokasi tempat berjualan / workshop"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Berjalan Sejak Tahun</label>
              <input
                type="number"
                value={khusus.tahun_berdiri}
                onChange={e => setKhusus({ ...khusus, tahun_berdiri: e.target.value })}
                placeholder="Contoh: 2021"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Khusus Pengantar KTP */}
        {selectedJenis === 'pengantar_ktp' && (
          <div className="mb-4 p-4 bg-indigo-50/60 rounded-xl border border-indigo-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Permohonan Dokumen KTP / KK</label>
            <select
              value={khusus.jenis_ktp}
              onChange={e => setKhusus({ ...khusus, jenis_ktp: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-cyan-50/60 rounded-xl border border-cyan-200">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Tujuan Pindah</label>
              <input
                type="text"
                value={khusus.alamat_tujuan}
                onChange={e => setKhusus({ ...khusus, alamat_tujuan: e.target.value })}
                placeholder="Contoh: Jl. Gatot Subroto No. 88"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kelurahan / Desa Tujuan</label>
              <input
                type="text"
                value={khusus.kelurahan_tujuan}
                onChange={e => setKhusus({ ...khusus, kelurahan_tujuan: e.target.value })}
                placeholder="Kelurahan tujuan"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan & Kota Tujuan</label>
              <input
                type="text"
                value={khusus.kota_tujuan}
                onChange={e => setKhusus({ ...khusus, kota_tujuan: e.target.value })}
                placeholder="Kecamatan, Kota/Kabupaten"
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Keperluan Surat */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keperluan Pembuatan Surat <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={keperluan}
            onChange={e => setKeperluan(e.target.value)}
            placeholder="Tuliskan keperluan surat secara jelas..."
            className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Teks ini akan dicetak tebal pada bagian inti surat pengantar.
          </p>
        </div>
      </div>

      {/* 4. PENOMORAN & TANGGAL SURAT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Penomoran & Tanggal Surat</h3>
            <p className="text-xs text-slate-500">Nomor surat otomatis digenerate sesuai format resmi RT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Surat Diterbitkan
            </label>
            <input
              type="date"
              value={tanggalSurat}
              onChange={e => setTanggalSurat(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Urut Buku Register
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
                className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleRegenerateNomor}
                title="Refresh nomor surat"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Format Nomor Surat Lengkap
            </label>
            <input
              type="text"
              required
              value={nomorSurat}
              onChange={e => setNomorSurat(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 font-mono font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Batal
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Menyimpan Surat...
            </>
          ) : (
            <>
              <FileCheck2 className="w-4 h-4" />
              Terbitkan & Pratinjau Surat
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

