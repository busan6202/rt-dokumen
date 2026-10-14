import React, { useState, useEffect } from 'react'
import { db, isSupabaseConfigured } from './supabaseClient'
import Dashboard from './components/Dashboard'
import SuratForm from './components/SuratForm'
import SuratList from './components/SuratList'
import SuratPreview from './components/SuratPreview'
import WargaManager from './components/WargaManager'
import SettingsModal from './components/SettingsModal'
import VerificationPage from './components/VerificationPage'
import {
  FileText,
  Users,
  Settings,
  PlusCircle,
  LayoutDashboard,
  Database,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, form, arsip, warga, preview
  const [rtProfile, setRtProfile] = useState(null)
  const [suratList, setSuratList] = useState([])
  const [wargaList, setWargaList] = useState([])
  const [selectedSurat, setSelectedSurat] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDemoBanner, setShowDemoBanner] = useState(true)

  // Check URL param for verification
  const [verifyToken, setVerifyToken] = useState(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('verify')
    if (token) {
      setVerifyToken(token)
    }
  }, [])

  // Load Initial Data
  const loadData = async () => {
    try {
      const [profile, surats, wargas] = await Promise.all([
        db.getProfile(),
        db.getSuratList(),
        db.getWarga()
      ])
      setRtProfile(profile)
      setSuratList(surats)
      setWargaList(wargas)
    } catch (e) {
      console.error('Error loading data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Public Verification View
  if (verifyToken) {
    return (
      <VerificationPage
        token={verifyToken}
        onBackToApp={() => {
          // Clear query params without full reload
          window.history.pushState({}, document.title, window.location.pathname)
          setVerifyToken(null)
        }}
        onPreviewSurat={(s) => {
          setSelectedSurat(s)
          setVerifyToken(null)
          setActiveTab('preview')
        }}
      />
    )
  }

  if (loading || !rtProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-700">Memuat Sistem Administrasi RT...</p>
      </div>
    )
  }

  const isCloudConnected = isSupabaseConfigured()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* DEMO / CLOUD STATUS BANNER */}
      {!isCloudConnected && showDemoBanner && (
        <div className="no-print bg-amber-500 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Mode Demo / Penyimpanan Lokal Aktif:</strong> Semua data tersimpan di browser Anda. Hubungkan ke database Supabase gratis untuk sinkronisasi cloud antar pengurus RT.
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="underline font-bold hover:text-amber-100 ml-2 whitespace-nowrap"
            >
              Hubungkan Supabase &rarr;
            </button>
          </div>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="p-1 hover:bg-amber-600 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER / NAVIGATION */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & RT Info */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-black text-slate-900 leading-tight">
                  SURAT RT {rtProfile.rt_number} / RW {rtProfile.rw_number}
                </h1>
                <p className="text-[11px] text-slate-500 leading-none">
                  Kel. {rtProfile.kelurahan}, Kec. {rtProfile.kecamatan}
                </p>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'form'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Buat Surat Baru
              </button>

              <button
                onClick={() => setActiveTab('arsip')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'arsip'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Buku Arsip
                <span className="px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-700 rounded-full font-mono">
                  {suratList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('warga')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'warga'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Data Warga
                <span className="px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-700 rounded-full font-mono">
                  {wargaList.length}
                </span>
              </button>
            </nav>

            {/* Settings & Status */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                title="Buka Pengaturan RT & Supabase"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Pengaturan RT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-slate-200 flex justify-around p-2 bg-slate-50 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Beranda</span>
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'form' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Surat</span>
          </button>
          <button
            onClick={() => setActiveTab('arsip')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'arsip' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Arsip ({suratList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('warga')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'warga' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Warga ({wargaList.length})</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            rtProfile={rtProfile}
            suratList={suratList}
            wargaList={wargaList}
            onNewSurat={() => setActiveTab('form')}
            onSelectSurat={(s) => {
              setSelectedSurat(s)
              setActiveTab('preview')
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenWarga={() => setActiveTab('warga')}
            onOpenArsip={() => setActiveTab('arsip')}
          />
        )}

        {activeTab === 'form' && (
          <SuratForm
            rtProfile={rtProfile}
            wargaList={wargaList}
            onSuratCreated={(createdSurat) => {
              setSelectedSurat(createdSurat)
              loadData()
              setActiveTab('preview')
            }}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'arsip' && (
          <SuratList
            suratList={suratList}
            onSelectSurat={(s) => {
              setSelectedSurat(s)
              setActiveTab('preview')
            }}
            onDeleteSurat={async (id) => {
              await db.deleteSurat(id)
              loadData()
            }}
            onNewSurat={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'warga' && (
          <WargaManager
            wargaList={wargaList}
            onRefreshWarga={loadData}
            rtProfile={rtProfile}
          />
        )}

        {activeTab === 'preview' && selectedSurat && (
          <SuratPreview
            surat={selectedSurat}
            rtProfile={rtProfile}
            onBack={() => setActiveTab('arsip')}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} Pelayanan Administrasi Rukun Tetangga (RT) • Siap Cetak Kertas A4
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Serverless Supabase</span>
            <span>•</span>
            <span>GitHub Pages CI/CD</span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              Konfigurasi RT
            </button>
          </div>
        </div>
      </footer>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <SettingsModal
          rtProfile={rtProfile}
          onUpdateProfile={(updated) => {
            setRtProfile(updated)
            loadData()
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  )
}

