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
import TrakteerFloatingWidget from './components/TrakteerFloatingWidget'
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
  UserCheck,
  Building2,
  Sparkles
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
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-amber-400" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-amber-400/20 blur-lg -z-10 animate-pulse"></div>
        </div>
        <p className="text-sm font-bold text-slate-200 tracking-wide font-mono">
          MEMUAT SISTEM ADMINISTRASI RT...
        </p>
        <p className="text-xs text-slate-500 mt-1">Menginisialisasi basis data & enkripsi sesi</p>
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* DEMO / CLOUD STATUS BANNER */}
      {!isCloudConnected && showDemoBanner && isPengurus && (
        <div className="no-print bg-amber-500/15 border-b border-amber-500/30 text-amber-300 px-4 py-2.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2.5 max-w-5xl mx-auto">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>
              <strong className="font-semibold text-white">Mode Penyimpanan Lokal:</strong> Basis data tersimpan di peramban ini. Hubungkan ke Cloud Supabase untuk sinkronisasi multi-pengurus RT.
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-amber-300 underline font-bold hover:text-white ml-2 whitespace-nowrap transition"
            >
              Hubungkan Database &rarr;
            </button>
          </div>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="p-1 text-amber-400 hover:text-white rounded transition"
            title="Tutup banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER / NAVIGATION - Sovereign Civic Command Bar */}
      <header className="no-print bg-[#0e1626]/90 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & RT Info */}
            <div
              onClick={() => setActiveTab(isPengurus ? 'dashboard' : 'form')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight leading-tight group-hover:text-amber-300 transition">
                    RT.{rtProfile.rt_number ? rtProfile.rt_number.replace(/^0+/, '') : '00'} / RW.{rtProfile.rw_number || '00'}
                  </h1>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/[0.06] text-amber-300 border border-white/10">
                    RESMI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                  Kel. {rtProfile.kelurahan}, Kec. {rtProfile.kecamatan}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-white/[0.08]">
              {isPengurus && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Beranda
                </button>
              )}

              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'form'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Buat Surat
              </button>

              <button
                onClick={() => setActiveTab('arsip')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'arsip'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                {isPengurus ? 'Buku Arsip' : 'Surat Saya'}
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                  activeTab === 'arsip'
                    ? 'bg-slate-950 text-amber-300'
                    : 'bg-white/10 text-slate-300'
                }`}>
                  {displaySuratList.length}
                </span>
              </button>

              {isPengurus && (
                <>
                  <button
                    onClick={() => setActiveTab('warga')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'warga'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Data Warga
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                      activeTab === 'warga'
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-white/10 text-slate-300'
                    }`}>
                      {wargaList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('otp')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'otp'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Kelola OTP
                  </button>
                </>
              )}
            </nav>

            {/* User Session Profile & Actions */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#131c2e] border border-white/[0.08] rounded-xl text-xs">
                {isPengurus ? (
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-300 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    ADMIN PENGURUS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    {authSession.nama || 'Warga Terdaftar'}
                  </span>
                )}
              </div>

              {isPengurus && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-400 hover:text-amber-300 hover:bg-white/[0.05] rounded-xl border border-transparent hover:border-white/10 transition"
                  title="Konfigurasi Profil RT & Database"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition"
                title="Keluar dari Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:py-8">
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
      <footer className="no-print bg-[#090d16] border-t border-white/[0.08] py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            © {new Date().getFullYear()} Administrasi Rukun Tetangga (RT) • Format Resmi & Autentikasi QR
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-mono text-[11px] text-amber-300/80">Sovereign Civic v2.0</span>
            <span>•</span>
            <span>Arsitektur Serverless Cloud</span>
            {isPengurus && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition"
                >
                  Konfigurasi RT
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* FLOATING DONASI TRAKTEER KHUSUS WARGA */}
      {!isPengurus && (
        <TrakteerFloatingWidget trakteerUrl={rtProfile?.trakteer_url} />
      )}

      {/* FLOATING MOBILE BOTTOM NAVIGATION BAR - Native App Style */}
      <nav
        aria-label="Navigasi Bawah Ponsel"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0e1626]/95 backdrop-blur-xl border-t border-white/[0.1] px-2 py-2 shadow-2xl flex items-center justify-around"
      >
        {isPengurus ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">Beranda</span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all ${
                activeTab === 'form'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">Buat</span>
            </button>

            <button
              onClick={() => setActiveTab('arsip')}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all relative ${
                activeTab === 'arsip'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">Arsip</span>
              {displaySuratList.length > 0 && (
                <span className="absolute top-1 right-2.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-mono text-[9px] font-extrabold rounded-full">
                  {displaySuratList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('warga')}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all relative ${
                activeTab === 'warga'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">Warga</span>
              {wargaList.length > 0 && (
                <span className="absolute top-1 right-2.5 px-1.5 py-0.2 bg-slate-700 text-amber-300 font-mono text-[9px] font-bold rounded-full">
                  {wargaList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('otp')}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all ${
                activeTab === 'otp'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">OTP</span>
            </button>
          </>
        ) : (
          /* Warga Bottom Nav */
          <>
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${
                activeTab === 'form'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">Buat Surat</span>
            </button>

            <button
              onClick={() => setActiveTab('arsip')}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all relative ${
                activeTab === 'arsip'
                  ? 'text-amber-400 font-bold bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">Surat Saya</span>
              {displaySuratList.length > 0 && (
                <span className="absolute top-1 right-5 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-mono text-[9px] font-extrabold rounded-full">
                  {displaySuratList.length}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight">Keluar</span>
            </button>
          </>
        )}
      </nav>

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
