import React, { useState, useEffect } from 'react'
import {
  db,
  isSupabaseConfigured,
  getAuthSession,
  setAuthSession,
  clearAuthSession
} from './supabaseClient'
import Dashboard from './components/Dashboard'
import SuratForm from './components/SuratForm'
import SuratList from './components/SuratList'
import SuratPreview from './components/SuratPreview'
import WargaManager from './components/WargaManager'
import SettingsModal from './components/SettingsModal'
import VerificationPage from './components/VerificationPage'
import LoginGate from './components/LoginGate'
import OtpManager from './components/OtpManager'
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
  ShieldCheck,
  KeyRound,
  LogOut,
  UserCheck
} from 'lucide-react'

export default function App() {
  const [authSession, setAuthState] = useState(getAuthSession())
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, form, arsip, warga, otp, preview
  const [rtProfile, setRtProfile] = useState(null)
  const [suratList, setSuratList] = useState([])
  const [wargaList, setWargaList] = useState([])
  const [selectedSurat, setSelectedSurat] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDemoBanner, setShowDemoBanner] = useState(true)

  // URL Query Params
  const [verifyToken, setVerifyToken] = useState(null)
  const [initialOtp, setInitialOtp] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('verify')
    const otp = urlParams.get('otp')
    if (token) setVerifyToken(token)
    if (otp) setInitialOtp(otp)
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

  // When warga logs in, default active tab to 'form' so they can create a letter immediately
  const handleLoginSuccess = (session) => {
    setAuthState(session)
    if (session.role === 'warga') {
      setActiveTab('form')
    } else {
      setActiveTab('dashboard')
    }
  }

  const handleLogout = () => {
    if (confirm('Keluar dari sistem surat RT?')) {
      clearAuthSession()
      setAuthState(null)
      setActiveTab('dashboard')
    }
  }

  // 1. PUBLIC VERIFICATION SCREEN (Accessible without login for scanning printed QR codes)
  if (verifyToken) {
    return (
      <VerificationPage
        token={verifyToken}
        onBackToApp={() => {
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

  // 2. GATE / OTP LOGIN SCREEN (If not authenticated)
  if (!authSession) {
    return (
      <LoginGate
        rtProfile={rtProfile}
        initialOtp={initialOtp}
        onLoginSuccess={handleLoginSuccess}
      />
    )
  }

  const isPengurus = authSession.role === 'pengurus'
  const isCloudConnected = isSupabaseConfigured()

  // Filter surat for warga view (warga only sees their own letters or newly generated)
  const displaySuratList = isPengurus
    ? suratList
    : suratList.filter(s =>
        (authSession.nik && s.pemohon_nik === authSession.nik) ||
        (authSession.nama && s.pemohon_nama?.toLowerCase() === authSession.nama?.toLowerCase())
      )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* DEMO / CLOUD STATUS BANNER */}
      {!isCloudConnected && showDemoBanner && isPengurus && (
        <div className="no-print bg-amber-500 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Mode Demo / Penyimpanan Lokal Aktif:</strong> Data tersimpan di browser ini. Hubungkan ke database Supabase gratis untuk sinkronisasi cloud antar pengurus RT.
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
              onClick={() => setActiveTab(isPengurus ? 'dashboard' : 'form')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-black text-slate-900 leading-tight">
                  RT.{rtProfile.rt_number ? rtProfile.rt_number.replace(/^0+/, '') : '25'} / RW. {rtProfile.rw_number || 'IX'}
                </h1>
                <p className="text-[11px] text-slate-500 leading-none">
                  Kel. {rtProfile.kelurahan}, Kec. {rtProfile.kecamatan}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {isPengurus && (
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
              )}

              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'form'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Buat Surat
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
                {isPengurus ? 'Buku Arsip' : 'Riwayat Surat Saya'}
                <span className="px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-700 rounded-full font-mono">
                  {displaySuratList.length}
                </span>
              </button>

              {isPengurus && (
                <>
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

                  <button
                    onClick={() => setActiveTab('otp')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
                      activeTab === 'otp'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-amber-500" />
                    Kelola OTP
                  </button>
                </>
              )}
            </nav>

            {/* User Session Profile & Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs">
                {isPengurus ? (
                  <span className="inline-flex items-center gap-1 font-bold text-blue-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Pengurus RT (Admin)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <UserCheck className="w-3.5 h-3.5" />
                    {authSession.nama || 'Warga Terdaftar'}
                  </span>
                )}
              </div>

              {isPengurus && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition"
                  title="Pengaturan RT & Supabase"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                title="Keluar dari Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-200 flex justify-around p-2 bg-slate-50 text-xs">
          {isPengurus && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Beranda</span>
            </button>
          )}

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
            <span>Arsip ({displaySuratList.length})</span>
          </button>

          {isPengurus && (
            <>
              <button
                onClick={() => setActiveTab('warga')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                  activeTab === 'warga' ? 'text-blue-600 font-bold' : 'text-slate-600'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Warga</span>
              </button>

              <button
                onClick={() => setActiveTab('otp')}
                className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                  activeTab === 'otp' ? 'text-blue-600 font-bold' : 'text-slate-600'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>OTP</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'dashboard' && isPengurus && (
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
            currentSession={authSession}
            onSuratCreated={(createdSurat) => {
              setSelectedSurat(createdSurat)
              loadData()
              setActiveTab('preview')
            }}
            onCancel={() => setActiveTab(isPengurus ? 'dashboard' : 'arsip')}
          />
        )}

        {activeTab === 'arsip' && (
          <SuratList
            suratList={displaySuratList}
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

        {activeTab === 'warga' && isPengurus && (
          <WargaManager
            wargaList={wargaList}
            onRefreshWarga={loadData}
            rtProfile={rtProfile}
          />
        )}

        {activeTab === 'otp' && isPengurus && (
          <OtpManager
            rtProfile={rtProfile}
            wargaList={wargaList}
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
            © {new Date().getFullYear()} Pelayanan Administrasi Rukun Tetangga (RT) • Dilindungi Akses OTP
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Serverless Supabase</span>
            <span>•</span>
            <span>GitHub Pages CI/CD</span>
            {isPengurus && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Konfigurasi RT
                </button>
              </>
            )}
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
