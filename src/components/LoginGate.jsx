import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'
import { formatWhatsAppNumber } from '../utils/helpers'
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
  HelpCircle,
  Building2,
  FileCheck,
  Mail,
  ArrowLeft,
  Check,
  ExternalLink,
  Copy
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

  // Forgot PIN Flow State
  const [isForgotPin, setIsForgotPin] = useState(false)
  const [forgotStep, setForgotStep] = useState('email') // 'email', 'code', 'reset', 'done'
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotCode, setForgotCode] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [simulationCode, setSimulationCode] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

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
        setOtpCode(res.otp_code)
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
      setOtpCode(generatedResult.otp_code)
      handleVerify(generatedResult.otp_code)
    }
  }

  // 1. Submit email to request PIN reset code
  const handleRequestResetCode = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const res = await db.requestPinReset(forgotEmail)
      if (res.success) {
        setMaskedEmail(res.maskedEmail)
        setSimulationCode(res.resetCode)
        setForgotStep('code')
        setForgotSuccess(res.message)
      } else {
        setForgotError(res.message)
      }
    } catch (err) {
      setForgotError(`Gagal mengirim kode reset: ${err.message}`)
    } finally {
      setForgotLoading(false)
    }
  }

  // 2. Submit 6-digit code
  const handleVerifyResetCode = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotError('')

    try {
      const res = await db.verifyPinReset(forgotCode)
      if (res.success) {
        setForgotStep('reset')
        setForgotSuccess('Kode verifikasi email valid. Silakan masukkan PIN baru.')
      } else {
        setForgotError(res.message)
      }
    } catch (err) {
      setForgotError(`Verifikasi gagal: ${err.message}`)
    } finally {
      setForgotLoading(false)
    }
  }

  // 3. Confirm new PIN
  const handleConfirmNewPin = async (e) => {
    e.preventDefault()
    if (newPin !== confirmPin) {
      setForgotError('Konfirmasi PIN tidak cocok dengan PIN baru.')
      return
    }
    if (newPin.length < 4) {
      setForgotError('PIN minimal 4 digit.')
      return
    }

    setForgotLoading(true)
    setForgotError('')

    try {
      const res = await db.confirmPinReset(forgotCode, newPin)
      if (res.success) {
        setForgotStep('done')
        setForgotSuccess(res.message)
      } else {
        setForgotError(res.message)
      }
    } catch (err) {
      setForgotError(`Gagal memperbarui PIN: ${err.message}`)
    } finally {
      setForgotLoading(false)
    }
  }

  const targetWaNumber = formatWhatsAppNumber(rtProfile?.kontak_telepon || '081254873133')
  const defaultRequestText = `Halo Pengurus RT ${rtProfile?.rt_number || '00'} / RW ${rtProfile?.rw_number || '00'}. Saya warga ingin meminta kode akses/OTP untuk membuat surat pengantar online. Terima kasih.`
  const requestOtpWhatsAppUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(defaultRequestText)}`

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4 py-10 relative overflow-hidden text-slate-100">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#131c2e] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative z-10">
        {/* Header Visual with Regional Emblem */}
        <div className="bg-gradient-to-b from-[#19243a] to-[#131c2e] p-7 text-center relative border-b border-white/[0.08]">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3.5 shadow-lg p-2 overflow-hidden">
            {rtProfile?.logo_url ? (
              <img
                src={rtProfile.logo_url}
                alt="Logo Daerah"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <Building2 className="w-8 h-8 text-amber-400" />
            )}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-400/10 border border-amber-400/25 rounded-full text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PORTAL ADMINISTRASI RT RESMI
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            RT.{rtProfile?.rt_number ? rtProfile.rt_number.replace(/^0+/, '') : '00'} / RW.{rtProfile?.rw_number || '00'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelurahan {rtProfile?.kelurahan || '-'}, Kecamatan {rtProfile?.kecamatan || '-'}
          </p>
        </div>

        {/* 3 Tabs Selection (Only shown when not in Forgot PIN mode) */}
        {!isForgotPin ? (
          <div className="flex border-b border-white/[0.08] bg-[#0c1322] text-[11px] font-bold p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('otp')
                setErrorMsg('')
                if (generatedResult?.otp_code) {
                  setOtpCode(generatedResult.otp_code)
                }
              }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'otp'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
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
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'request'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Minta OTP Baru
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin')
                setErrorMsg('')
              }}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              PIN Pengurus
            </button>
          </div>
        ) : (
          /* Forgot PIN Navigation Header */
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0c1322] px-5 py-3 text-xs">
            <button
              type="button"
              onClick={() => setIsForgotPin(false)}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-300 font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login PIN
            </button>
            <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              PEMULIHAN EMAIL
            </span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* FORGOT PIN SUB-FLOW */}
          {isForgotPin ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* STEP 1: MASUKKAN EMAIL RESMI */}
              {forgotStep === 'email' && (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-400/15 border border-amber-400/30 text-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Verifikasi Email Pengurus RT</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Masukkan alamat email dinas Pengurus RT yang terdaftar pada konfigurasi profil RT.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alamat Email Terdaftar <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Contoh: rt005rw012@gmail.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full px-3.5 py-3 text-xs bg-[#0c1322] text-white rounded-xl border border-white/15 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                  </div>

                  {forgotError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Mengirim Kode Verifikasi...
                      </>
                    ) : (
                      <>
                        Kirim Kode Verifikasi Email
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: MASUKKAN KODE VERIFIKASI 6 DIGIT */}
              {forgotStep === 'code' && (
                <form onSubmit={handleVerifyResetCode} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-400/15 border border-amber-400/30 text-amber-300 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Masukkan Kode Verifikasi Email</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Kode 6 digit telah dikirimkan ke <strong className="text-amber-300 font-mono">{maskedEmail}</strong>. Berlaku selama 15 menit.
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="000000"
                      value={forgotCode}
                      onChange={e => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-2xl font-mono font-bold tracking-widest py-3.5 px-4 bg-[#0c1322] rounded-2xl border border-white/15 focus:border-amber-400 text-amber-300 focus:outline-none"
                    />
                  </div>

                  {/* Demo/Simulation Helper */}
                  {simulationCode && (
                    <div className="p-3 bg-amber-400/10 border border-amber-400/25 rounded-xl text-center space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                        KODE VERIFIKASI EMAIL ANDA:
                      </span>
                      <span className="text-xl font-mono font-black text-amber-400 tracking-widest block">
                        {simulationCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForgotCode(simulationCode)}
                        className="text-[11px] text-amber-300 hover:underline font-semibold"
                      >
                        Tempel Otomatis Kode Ini
                      </button>
                    </div>
                  )}

                  {forgotError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading || forgotCode.length < 6}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Memvalidasi Kode...
                      </>
                    ) : (
                      <>
                        Validasi Kode & Lanjutkan
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Salah alamat email? Kirim ke email lain
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: ATUR PIN BARU */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleConfirmNewPin} className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Atur PIN Pengurus Baru</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Identitas terverifikasi. Masukkan PIN Admin baru Anda (minimal 4 digit).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      PIN Baru <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={12}
                      autoFocus
                      required
                      placeholder="Masukkan PIN baru"
                      value={newPin}
                      onChange={e => setNewPin(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#0c1322] text-white rounded-xl border border-white/15 focus:border-amber-400 focus:outline-none font-mono tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Konfirmasi PIN Baru <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={12}
                      required
                      placeholder="Ulangi PIN baru"
                      value={confirmPin}
                      onChange={e => setConfirmPin(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#0c1322] text-white rounded-xl border border-white/15 focus:border-amber-400 focus:outline-none font-mono tracking-widest text-center"
                    />
                  </div>

                  {forgotError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={forgotLoading || !newPin || !confirmPin}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Menyimpan PIN Baru...
                      </>
                    ) : (
                      <>
                        Simpan PIN Baru & Terapkan
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: BERHASIL */}
              {forgotStep === 'done' && (
                <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-400 block uppercase">
                      PEMULIHAN BERHASIL
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">PIN Pengurus RT Berhasil Diperbarui</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Gunakan PIN baru Anda untuk mengakses portal administrasi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPin(false)
                      setActiveTab('admin')
                      setAdminPin(newPin)
                      handleVerify(newPin)
                    }}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-md text-xs transition flex items-center justify-center gap-2"
                  >
                    Masuk Langsung Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* NORMAL LOGIN TABS */
            <>
              {/* TAB 1: MASUK DENGAN KODE OTP */}
              {activeTab === 'otp' && (
                <form onSubmit={e => { e.preventDefault(); handleVerify(); }} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-white tracking-tight">Masukkan Kode Akses OTP Warga</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Masukkan 6 digit kode OTP yang diberikan oleh Pengurus RT.
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
                      className="w-full text-center tracking-widest text-2xl font-mono font-bold py-3.5 px-4 bg-[#0c1322] rounded-2xl border border-white/15 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-amber-300 transition uppercase"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !otpCode}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Memverifikasi Akses...
                      </>
                    ) : (
                      <>
                        Masuk ke Pembuatan Surat
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 space-y-2">
                    <a
                      href={requestOtpWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-emerald-500/25"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      Minta Kode OTP via WhatsApp Pengurus RT
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveTab('request')}
                      className="w-full text-center text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold py-1 block transition"
                    >
                      Belum punya kode? Minta OTP mandiri dengan NIK &rarr;
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: MINTA OTP BARU SECARA DINAMIS & OTOMATIS */}
              {activeTab === 'request' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-white tracking-tight">Minta Kode Akses OTP Mandiri</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Masukkan NIK Anda untuk memverifikasi data di Buku Induk Warga RT.
                    </p>
                  </div>

                  {!generatedResult ? (
                    <form onSubmit={handleRequestOtp} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={16}
                          placeholder="Masukkan 16 digit NIK sesuai KTP"
                          value={reqNik}
                          onChange={e => setReqNik(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#0c1322] rounded-xl border border-white/15 font-mono text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nomor WhatsApp / HP Aktif <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 081234567890"
                          value={reqHp}
                          onChange={e => setReqHp(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#0c1322] rounded-xl border border-white/15 font-mono text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                        />
                      </div>

                      {errorMsg && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {notRegisteredInfo && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-200 text-xs space-y-2.5">
                          <div className="flex items-start gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <p>{notRegisteredInfo}</p>
                          </div>
                          <a
                            href={requestOtpWhatsAppUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold transition text-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Hubungi Pengurus RT via WhatsApp
                          </a>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading || reqNik.length < 16}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
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

                      <div className="pt-1 text-center">
                        <a
                          href={requestOtpWhatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Minta kode akses via WhatsApp Pengurus RT &rarr;
                        </a>
                      </div>
                    </form>
                  ) : (
                    /* Generated Dynamic OTP Result */
                    <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-400 block uppercase">
                          WARGA TERVERIFIKASI RESMI
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1">{generatedResult.nama}</h4>
                        <p className="text-[11px] font-mono text-slate-400">NIK: {generatedResult.nik}</p>
                      </div>

                      <div className="bg-[#0c1322] p-4 rounded-xl border border-emerald-500/30">
                        <p className="text-[11px] text-slate-400 mb-1">Kode Akses OTP Dinamis Anda:</p>
                        <div className="flex items-center justify-center gap-2.5 my-1">
                          <span className="text-3xl font-mono font-black tracking-widest text-emerald-400">
                            {generatedResult.otp_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedResult.otp_code)
                              alert('Kode OTP disalin: ' + generatedResult.otp_code)
                            }}
                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/30 transition flex items-center gap-1"
                            title="Salin kode OTP"
                          >
                            <Copy className="w-3 h-3" />
                            Salin
                          </button>
                        </div>
                        <span className="text-[10px] text-amber-400 font-semibold block mt-1">
                          Berlaku selama 30 menit (Sekali Pakai)
                        </span>
                      </div>

                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleUseGeneratedOtp}
                          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl shadow-md text-xs transition flex items-center justify-center gap-2"
                        >
                          Masuk Otomatis Sekarang
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setGeneratedResult(null)}
                          className="text-xs text-slate-400 hover:text-white underline block mx-auto"
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
                    <h3 className="text-sm font-bold text-white tracking-tight">Akses Khusus Pengurus RT</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Masukkan PIN Admin rahasia Pengurus untuk mengelola seluruh arsip surat, buku warga, dan profil RT.
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
                      className="w-full text-center text-xl font-mono font-bold py-3.5 px-4 bg-[#0c1322] rounded-2xl border border-white/15 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 text-amber-300 transition tracking-widest"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !adminPin}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Memverifikasi Kredensial...
                      </>
                    ) : (
                      <>
                        Masuk sebagai Pengurus RT
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPin(true)
                        setForgotStep('email')
                        setForgotEmail('')
                        setForgotCode('')
                        setNewPin('')
                        setConfirmPin('')
                        setForgotError('')
                        setForgotSuccess('')
                        setSimulationCode('')
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold transition"
                    >
                      Lupa PIN Pengurus? Pulihkan via Email &rarr;
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-6 text-center max-w-sm font-mono">
        TERENKRIPSI • DILINDUNGI TATA KELOLA KEPENDUDUKAN RESMI
      </p>
    </div>
  )
}
