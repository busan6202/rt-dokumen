import React, { useState } from 'react'
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  db,
  isFirebaseConfigured
} from '../firebaseClient'
import {
  Settings,
  Database,
  Building,
  CheckCircle2,
  XCircle,
  Save,
  X,
  ExternalLink,
  Code,
  ShieldCheck,
  RefreshCw,
  Flame,
  Upload,
  Image as ImageIcon,
  Trash2,
  RotateCcw
} from 'lucide-react'

export default function SettingsModal({ rtProfile, onUpdateProfile, onClose }) {
  const [activeTab, setActiveTab] = useState('rt') // 'rt' or 'firebase'
  const [profileData, setProfileData] = useState({ ...rtProfile })
  const firebaseInitial = getFirebaseConfig()
  const [fbConfig, setFbConfig] = useState({ ...firebaseInitial })
  const [jsonConfigInput, setJsonConfigInput] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Image Upload & Compression Helper (converts to lightweight Base64)
  const handleImageUpload = (e, fieldName, maxDim = 400) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (PNG, JPG, JPEG, WEBP).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const dataUrl = canvas.toDataURL(mime, 0.85)
        setProfileData(prev => ({ ...prev, [fieldName]: dataUrl }))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await db.updateProfile(profileData)
      onUpdateProfile(updated)
      alert('Profil RT & Pengaturan Kop Surat berhasil disimpan!')
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Parse pasted Firebase config string/JSON
  const handleParseJsonConfig = () => {
    try {
      let clean = jsonConfigInput.trim()
      if (clean.includes('{')) {
        clean = clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1)
      }
      const jsonCompatible = clean.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
      const parsed = JSON.parse(jsonCompatible)

      setFbConfig(prev => ({
        ...prev,
        apiKey: parsed.apiKey || prev.apiKey,
        authDomain: parsed.authDomain || prev.authDomain,
        projectId: parsed.projectId || prev.projectId,
        storageBucket: parsed.storageBucket || prev.storageBucket,
        messagingSenderId: parsed.messagingSenderId || prev.messagingSenderId,
        appId: parsed.appId || prev.appId
      }))
      alert('Konfigurasi Firebase berhasil diurai dan dimasukkan ke formulir!')
      setJsonConfigInput('')
    } catch (err) {
      alert('Format teks tidak valid. Silakan isi kolom satu per satu secara manual.')
    }
  }

  const handleTestFirebase = async () => {
    setIsTesting(true)
    setTestResult(null)
    saveFirebaseConfig(fbConfig)
    const res = await db.testConnection(fbConfig)
    setTestResult(res)
    setIsTesting(false)
  }

  const handleSaveFirebase = () => {
    saveFirebaseConfig(fbConfig)
    alert('Konfigurasi Google Firebase disimpan! Halaman akan dimuat ulang.')
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#131c2e] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0c1322]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">Pengaturan Sistem Administrasi RT</h3>
              <p className="text-xs text-slate-400">Konfigurasi Kop Surat, Profil Pengurus, dan Database Sinkronisasi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/[0.08] bg-[#0c1322] px-5 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('rt')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'rt'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            Kop Surat & Profil RT/RW
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'firebase'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Database Google Firebase
            {isFirebaseConfigured() ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-400/15 text-amber-300 rounded font-normal">
                Demo
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: PROFIL RT */}
          {activeTab === 'rt' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* SECTION 1: PROFIL WILAYAH */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  Identitas Wilayah RT / RW
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor RT</label>
                    <input
                      type="text"
                      required
                      value={profileData.rt_number}
                      onChange={e => setProfileData({ ...profileData, rt_number: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor RW</label>
                    <input
                      type="text"
                      required
                      value={profileData.rw_number}
                      onChange={e => setProfileData({ ...profileData, rw_number: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Pos</label>
                    <input
                      type="text"
                      value={profileData.kode_pos || ''}
                      onChange={e => setProfileData({ ...profileData, kode_pos: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kelurahan / Desa</label>
                    <input
                      type="text"
                      required
                      value={profileData.kelurahan}
                      onChange={e => setProfileData({ ...profileData, kelurahan: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      required
                      value={profileData.kecamatan}
                      onChange={e => setProfileData({ ...profileData, kecamatan: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      required
                      value={profileData.kota_kabupaten}
                      onChange={e => setProfileData({ ...profileData, kota_kabupaten: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Provinsi</label>
                    <input
                      type="text"
                      required
                      value={profileData.provinsi}
                      onChange={e => setProfileData({ ...profileData, provinsi: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kontak Telepon / WA RT</label>
                    <input
                      type="text"
                      value={profileData.kontak_telepon || ''}
                      onChange={e => setProfileData({ ...profileData, kontak_telepon: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Resmi Pengurus RT <span className="text-amber-300 font-mono text-[10px]">(Pemulihan PIN)</span>
                    </label>
                    <input
                      type="email"
                      value={profileData.email || ''}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="rt005rw012@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Kantor / Sekretariat RT</label>
                    <input
                      type="text"
                      value={profileData.alamat_sekretariat || ''}
                      onChange={e => setProfileData({ ...profileData, alamat_sekretariat: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Ketua RT</label>
                    <input
                      type="text"
                      required
                      value={profileData.nama_ketua_rt}
                      onChange={e => setProfileData({ ...profileData, nama_ketua_rt: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none uppercase font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">NIK Ketua RT</label>
                    <input
                      type="text"
                      value={profileData.nik_ketua_rt || ''}
                      onChange={e => setProfileData({ ...profileData, nik_ketua_rt: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      PIN Akses Pengurus RT (Admin PIN)
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.admin_pin || '123456'}
                      onChange={e => setProfileData({ ...profileData, admin_pin: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] rounded-xl border border-white/10 font-mono font-bold text-amber-300 focus:border-amber-400 focus:outline-none tracking-widest"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      PIN rahasia ini digunakan oleh Pengurus RT untuk mengakses data arsip, mengelola warga, dan menerbitkan kode OTP.
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Format Template Penomoran Surat
                    </label>
                    <input
                      type="text"
                      value={profileData.format_nomor_surat || ''}
                      onChange={e => setProfileData({ ...profileData, format_nomor_surat: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0c1322] rounded-xl border border-white/10 font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Variabel tersedia: <code className="text-amber-300">{'{nomor}'}</code>, <code className="text-amber-300">{'{rt}'}</code>, <code className="text-amber-300">{'{rw}'}</code>, <code className="text-amber-300">{'{bulan_romawi}'}</code>, <code className="text-amber-300">{'{tahun}'}</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: UPLOAD LOGO DAERAH, STEMPEL RT, DAN TANDA TANGAN */}
              <div className="border-t border-white/[0.08] pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5 font-mono">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Logo Daerah, Cap Stempel RT & Tanda Tangan Digital
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Unggah file gambar untuk ditampilkan pada kop surat dan tanda tangan dokumen resmi A4.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. LOGO DAERAH / LOGO RT */}
                  <div className="bg-[#0c1322] p-4 rounded-xl border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block mb-2">1. Logo Daerah / RT</span>
                      <div className="h-24 bg-[#131c2e] rounded-lg border border-white/10 flex items-center justify-center p-2 mb-3 overflow-hidden">
                        {profileData.logo_url ? (
                          <img
                            src={profileData.logo_url}
                            alt="Logo Daerah"
                            className="max-h-20 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-[10px] text-slate-500">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                            Belum ada logo
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        Unggah File Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'logo_url', 400)}
                        />
                      </label>

                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setProfileData(prev => ({ ...prev, logo_url: './logo-daerah.png' }))}
                          className="flex-1 py-1 px-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-lg text-[10px] font-semibold border border-white/10 transition"
                          title="Gunakan Logo Daerah"
                        >
                          Logo Habaring Hurung
                        </button>

                        {profileData.logo_url && (
                          <button
                            type="button"
                            onClick={() => setProfileData(prev => ({ ...prev, logo_url: '' }))}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Hapus Logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. CAP STEMPEL RT */}
                  <div className="bg-[#0c1322] p-4 rounded-xl border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block mb-2">2. Cap Stempel RT</span>
                      <div className="h-24 bg-[#131c2e] rounded-lg border border-white/10 flex items-center justify-center p-2 mb-3 overflow-hidden relative">
                        {profileData.stempel_url ? (
                          <img
                            src={profileData.stempel_url}
                            alt="Stempel RT"
                            className="max-h-20 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-[10px] text-slate-500">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                            Belum ada cap stempel
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        Unggah Stempel RT
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'stempel_url', 300)}
                        />
                      </label>

                      {profileData.stempel_url && (
                        <button
                          type="button"
                          onClick={() => setProfileData(prev => ({ ...prev, stempel_url: '' }))}
                          className="w-full py-1 px-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-[10px] font-semibold transition flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus Stempel
                        </button>
                      )}
                      <p className="text-[10px] text-slate-400 text-center">
                        Format PNG transparan
                      </p>
                    </div>
                  </div>

                  {/* 3. TANDA TANGAN KETUA RT */}
                  <div className="bg-[#0c1322] p-4 rounded-xl border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block mb-2">3. Tanda Tangan Digital</span>
                      <div className="h-24 bg-[#131c2e] rounded-lg border border-white/10 flex items-center justify-center p-2 mb-3 overflow-hidden">
                        {profileData.ttd_digital_url ? (
                          <img
                            src={profileData.ttd_digital_url}
                            alt="Tanda Tangan"
                            className="max-h-20 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-[10px] text-slate-500">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                            Belum ada tanda tangan
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5" />
                        Unggah Tanda Tangan
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'ttd_digital_url', 300)}
                        />
                      </label>

                      {profileData.ttd_digital_url && (
                        <button
                          type="button"
                          onClick={() => setProfileData(prev => ({ ...prev, ttd_digital_url: '' }))}
                          className="w-full py-1 px-2 text-rose-400 hover:bg-rose-500/10 rounded-lg text-[10px] font-semibold transition flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus Tanda Tangan
                        </button>
                      )}
                      <p className="text-[10px] text-slate-400 text-center">
                        Kosongkan jika tanda tangan basah
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/[0.08]">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Profil & Kop RT'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: FIREBASE CONFIG */}
          {activeTab === 'firebase' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-400/10 rounded-xl border border-amber-400/25">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Google Firebase Firestore (100% Gratis Selamanya)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Firebase Spark Plan gratis selamanya tanpa batasan waktu. Data surat, warga, dan OTP tersinkronisasi antar pengurus RT secara aman di cloud.
                </p>
              </div>

              {/* Quick Paste Box */}
              <div className="p-4 bg-[#0c1322] rounded-xl border border-white/[0.08] space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Tempel Objek Config Firebase Sekali Klik:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder='Tempel { apiKey: "...", projectId: "..." } di sini...'
                    value={jsonConfigInput}
                    onChange={e => setJsonConfigInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#131c2e] text-white rounded-lg border border-white/10 font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleParseJsonConfig}
                    disabled={!jsonConfigInput}
                    className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-amber-300 rounded-lg whitespace-nowrap border border-white/10 transition disabled:opacity-50"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    API Key (apiKey) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    value={fbConfig.apiKey}
                    onChange={e => setFbConfig({ ...fbConfig, apiKey: e.target.value.trim() })}
                    className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project ID (projectId) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="rt-dokumen-12345"
                    value={fbConfig.projectId}
                    onChange={e => setFbConfig({ ...fbConfig, projectId: e.target.value.trim() })}
                    className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Auth Domain (authDomain)
                  </label>
                  <input
                    type="text"
                    placeholder="rt-dokumen.firebaseapp.com"
                    value={fbConfig.authDomain}
                    onChange={e => setFbConfig({ ...fbConfig, authDomain: e.target.value.trim() })}
                    className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    App ID (appId)
                  </label>
                  <input
                    type="text"
                    placeholder="1:123456789:web:abcdef..."
                    value={fbConfig.appId}
                    onChange={e => setFbConfig({ ...fbConfig, appId: e.target.value.trim() })}
                    className="w-full px-3 py-2 text-xs bg-[#0c1322] text-white rounded-lg border border-white/10 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.success ? 'Koneksi Berhasil!' : 'Uji Koneksi Gagal'}</span>
                  </div>
                  <p className="text-xs leading-relaxed pl-6">{testResult.message}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestFirebase}
                  disabled={isTesting || !fbConfig.projectId || !fbConfig.apiKey}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  Uji Koneksi
                </button>

                <button
                  type="button"
                  onClick={handleSaveFirebase}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan & Terapkan Firebase
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
