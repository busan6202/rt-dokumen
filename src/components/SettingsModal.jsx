import React, { useState } from 'react'
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  db,
  isSupabaseConfigured
} from '../supabaseClient'
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
  Image,
  RefreshCw
} from 'lucide-react'

export default function SettingsModal({ rtProfile, onUpdateProfile, onClose }) {
  const [activeTab, setActiveTab] = useState('rt') // 'rt' or 'supabase'
  const [profileData, setProfileData] = useState({ ...rtProfile })
  const supabaseInitial = getSupabaseConfig()
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseInitial.url)
  const [supabaseKey, setSupabaseKey] = useState(supabaseInitial.anonKey)
  const [testResult, setTestResult] = useState(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleTestSupabase = async () => {
    setIsTesting(true)
    setTestResult(null)
    saveSupabaseConfig(supabaseUrl, supabaseKey)
    const res = await db.testConnection()
    setTestResult(res)
    setIsTesting(false)
  }

  const handleSaveSupabase = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey)
    alert('Konfigurasi Supabase disimpan! Halaman akan memuat ulang untuk menghubungkan klien.')
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pengaturan Sistem Administrasi RT</h3>
              <p className="text-xs text-slate-500">Konfigurasi Kop Surat, Profil Pengurus, dan Database Supabase</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5">
          <button
            type="button"
            onClick={() => setActiveTab('rt')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'rt'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            Kop Surat & Profil RT/RW
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Database Supabase
            {isSupabaseConfigured() ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded font-normal">
                Demo
              </span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: PROFIL RT */}
          {activeTab === 'rt' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor RT</label>
                  <input
                    type="text"
                    required
                    value={profileData.rt_number}
                    onChange={e => setProfileData({ ...profileData, rt_number: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor RW</label>
                  <input
                    type="text"
                    required
                    value={profileData.rw_number}
                    onChange={e => setProfileData({ ...profileData, rw_number: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={profileData.kode_pos || ''}
                    onChange={e => setProfileData({ ...profileData, kode_pos: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelurahan / Desa</label>
                  <input
                    type="text"
                    required
                    value={profileData.kelurahan}
                    onChange={e => setProfileData({ ...profileData, kelurahan: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={profileData.kecamatan}
                    onChange={e => setProfileData({ ...profileData, kecamatan: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={profileData.kota_kabupaten}
                    onChange={e => setProfileData({ ...profileData, kota_kabupaten: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={profileData.provinsi}
                    onChange={e => setProfileData({ ...profileData, provinsi: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kontak Telepon / WA RT</label>
                  <input
                    type="text"
                    value={profileData.kontak_telepon || ''}
                    onChange={e => setProfileData({ ...profileData, kontak_telepon: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Kantor / Sekretariat RT</label>
                  <input
                    type="text"
                    value={profileData.alamat_sekretariat || ''}
                    onChange={e => setProfileData({ ...profileData, alamat_sekretariat: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Ketua RT</label>
                  <input
                    type="text"
                    required
                    value={profileData.nama_ketua_rt}
                    onChange={e => setProfileData({ ...profileData, nama_ketua_rt: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIK Ketua RT</label>
                  <input
                    type="text"
                    value={profileData.nik_ketua_rt || ''}
                    onChange={e => setProfileData({ ...profileData, nik_ketua_rt: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Akses Pengurus RT (Admin PIN)
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.admin_pin || '123456'}
                    onChange={e => setProfileData({ ...profileData, admin_pin: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    PIN rahasia ini digunakan oleh Pengurus RT untuk mengakses data arsip, mengelola warga, dan menerbitkan kode OTP.
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Format Template Penomoran Surat
                  </label>
                  <input
                    type="text"
                    value={profileData.format_nomor_surat || ''}
                    onChange={e => setProfileData({ ...profileData, format_nomor_surat: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Variabel tersedia: <code className="text-blue-600">{'{nomor}'}</code>, <code className="text-blue-600">{'{rt}'}</code>, <code className="text-blue-600">{'{rw}'}</code>, <code className="text-blue-600">{'{bulan_romawi}'}</code>, <code className="text-blue-600">{'{tahun}'}</code>
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Profil RT'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SUPABASE CONFIG */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Status Koneksi Supabase
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aplikasi ini berjalan dengan arsitektur <strong>Serverless</strong>. Data disimpan secara langsung ke database <strong>Supabase</strong> gratis Anda, atau tersimpan di LocalStorage jika belum terhubung.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzabcdefghijklmnop.supabase.co"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <textarea
                    rows={3}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={e => setSupabaseKey(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={isTesting || !supabaseUrl || !supabaseKey}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    Uji Koneksi
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSupabase}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Simpan & Terapkan Supabase
                  </button>
                </div>
              </div>

              {/* Panduan 3 Langkah */}
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Cara Setup Supabase Gratis (3 Menit):
                </h5>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2">
                  <li>
                    Daftar / Buat proyek baru gratis di{' '}
                    <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">
                      supabase.com
                    </a>.
                  </li>
                  <li>
                    Buka menu <strong>SQL Editor</strong> di dashboard Supabase, lalu salin dan jalankan skrip dari file <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">supabase/schema.sql</code> di proyek ini.
                  </li>
                  <li>
                    Buka menu <strong>Project Settings &gt; API</strong>, salin <em>Project URL</em> dan <em>anon public key</em> ke formulir di atas. Selesai!
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

