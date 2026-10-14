import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Building,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Send,
  UserPlus,
  HelpCircle
} from 'lucide-react'

export default function LoginGate({ rtProfile, onLoginSuccess, initialOtp }) {
  const [activeTab, setActiveTab] = useState('otp') // 'otp', 'request', 'admin'
  const [otpCode, setOtpCode] = useState(initialOtp || '')
  const [adminPin, setAdminPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Request Dynamic OTP Form State
  const [reqNik, setReqNik] = useState('')
  const [reqHp, setReqHp] = useState('')
  const [generatedResult, setGeneratedResult] = useState(null)
  const [notRegisteredInfo, setNotRegisteredInfo] = useState(null)

  // Auto-login if initialOtp is provided via URL parameter ?otp=...
  useEffect(() => {
    if (initialOtp && initialOtp.length >= 4) {
      handleVerify(initialOtp)
    }
  }, [initialOtp])

  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || (activeTab === 'otp' ? otpCode : adminPin)).trim()
    if (!code) {
      setErrorMsg('Silakan masukkan kode terlebih dahulu.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      const res = await db.verifyCode(code)
      if (res.success) {
        onLoginSuccess(res.session)
      } else {
        setErrorMsg(res.message || 'Kode yang Anda masukkan tidak valid.')
      }
    } catch (err) {
      setErrorMsg(`Terjadi kesalahan: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Warga request dynamic OTP by NIK
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    setGeneratedResult(null)
    setNotRegisteredInfo(null)

    try {
      const res = await db.requestDynamicOtp({
        nik: reqNik,
        no_hp: reqHp
      })

      if (res.success) {
        setGeneratedResult(res)
      } else {
        if (res.notRegistered) {
          setNotRegisteredInfo(res.message)
        } else {
          setErrorMsg(res.message)
        }
      }
    } catch (err) {
      setErrorMsg(`Gagal memproses permohonan OTP: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseGeneratedOtp = () => {
    if (generatedResult?.otp_code) {
      handleVerify(generatedResult.otp_code)
    }
  }

  const contactRtWhatsAppUrl = `https://wa.me/${(rtProfile?.kontak_telepon || '+62081254873133').replace(/\D/g, '')}?text=${encodeURIComponent(
    `Halo Pengurus RT ${rtProfile?.rt_number || '025'} / RW ${rtProfile?.rw_number || 'IX'}.\nSaya warga dengan NIK: ${reqNik || '...'} ingin mendaftar dan meminta kode akses OTP untuk membuat surat RT online.\nTerima kasih.`
  )}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Visual with Regional Logo */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 p-7 text-white text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner overflow-hidden p-1.5">
            <img
              src={rtProfile?.logo_url || './logo-daerah.png'}
              alt="Logo Daerah"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <span className="inline-block px-3 py-0.5 bg-white/20 text-[10px] font-bold uppercase tracking-wider rounded-full mb-1">
            Portal Layanan Surat Digital RT
          </span>
          <h1 className="text-xl md:text-2xl font-black">
            RT {rtProfile?.rt_number} / RW {rtProfile?.rw_number}
          </h1>
          <p className="text-xs text-blue-100 mt-0.5">
            Kelurahan {rtProfile?.kelurahan}, Kecamatan {rtProfile?.kecamatan}
          </p>
        </div>

        {/* 3 Tabs Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('otp')
              setErrorMsg('')
            }}
            className={`flex-1 py-3 transition flex items-center justify-center gap-1 border-b-2 ${
              activeTab === 'otp'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Masuk OTP
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('request')
              setErrorMsg('')
              setGeneratedResult(null)
              setNotRegisteredInfo(null)
            }}
            className={`flex-1 py-3 transition flex items-center justify-center gap-1 border-b-2 ${
              activeTab === 'request'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Minta OTP Baru
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin')
              setErrorMsg('')
            }}
            className={`flex-1 py-3 transition flex items-center justify-center gap-1 border-b-2 ${
              activeTab === 'admin'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            PIN Pengurus
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* TAB 1: MASUK DENGAN KODE OTP */}
          {activeTab === 'otp' && (
            <form onSubmit={e => { e.preventDefault(); handleVerify(); }} className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900">Masukkan Kode Akses OTP Warga</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan 6 digit kode OTP yang telah Anda terima.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={10}
                  autoFocus
                  required
                  placeholder="Contoh: 742918"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                  className="w-full text-center tracking-widest text-2xl font-mono font-bold py-3 px-4 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition uppercase"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !otpCode}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Pembuatan Surat
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('request')}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Belum punya kode? Minta OTP baru otomatis di sini &rarr;
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MINTA OTP BARU SECARA DINAMIS & OTOMATIS */}
          {activeTab === 'request' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900">Minta Kode Akses OTP Mandiri</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan NIK Anda untuk memverifikasi data di Buku Induk Warga RT.
                </p>
              </div>

              {!generatedResult ? (
                <form onSubmit={handleRequestOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="Masukkan 16 digit NIK sesuai KTP"
                      value={reqNik}
                      onChange={e => setReqNik(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-300 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 081234567890"
                      value={reqHp}
                      onChange={e => setReqHp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-300 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {notRegisteredInfo && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2.5">
                      <div className="flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p>{notRegisteredInfo}</p>
                      </div>
                      <a
                        href={contactRtWhatsAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Hubungi Pengurus RT via WhatsApp
                      </a>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || reqNik.length < 16}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Memverifikasi Data Warga...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Verifikasi NIK & Terbitkan OTP
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Generated Dynamic OTP Result */
                <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Warga Terverifikasi Resmi
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{generatedResult.nama}</h4>
                    <p className="text-[11px] font-mono text-slate-500">NIK: {generatedResult.nik}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-inner">
                    <p className="text-[11px] text-slate-500 mb-1">Kode Akses OTP Dinamis Anda:</p>
                    <span className="text-3xl font-mono font-black tracking-widest text-emerald-700 block">
                      {generatedResult.otp_code}
                    </span>
                    <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                      Berlaku selama 30 menit (Sekali Pakai)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleUseGeneratedOtp}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-xs transition flex items-center justify-center gap-2"
                    >
                      Masuk Otomatis Sekarang
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setGeneratedResult(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline"
                    >
                      Minta untuk NIK lain
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOGIN KHUSUS PENGURUS RT */}
          {activeTab === 'admin' && (
            <form onSubmit={e => { e.preventDefault(); handleVerify(); }} className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900">Akses Khusus Pengurus RT</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan PIN Admin rahasia Pengurus untuk mengelola seluruh surat, warga, dan OTP.
                </p>
              </div>

              <div>
                <input
                  type="password"
                  maxLength={12}
                  autoFocus
                  required
                  placeholder="Masukkan PIN Admin Pengurus"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  className="w-full text-center text-xl font-mono font-bold py-3 px-4 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !adminPin}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg shadow-slate-900/25 text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk sebagai Pengurus RT
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center max-w-sm">
        Sistem Layanan Surat Digital RT Dilindungi Akses Terbatas. Hanya warga terdaftar dan pengurus RT yang dapat mengakses.
      </p>
    </div>
  )
}
