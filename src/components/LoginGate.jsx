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
  RefreshCw
} from 'lucide-react'

export default function LoginGate({ rtProfile, onLoginSuccess, initialOtp }) {
  const [activeTab, setActiveTab] = useState('otp') // 'otp' or 'admin'
  const [otpCode, setOtpCode] = useState(initialOtp || '')
  const [adminPin, setAdminPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleVerify()
  }

  const whatsappUrl = `https://wa.me/${(rtProfile?.kontak_telepon || '081234567890').replace(/\D/g, '')}?text=${encodeURIComponent(
    `Halo Pengurus RT ${rtProfile?.rt_number || '005'} / RW ${rtProfile?.rw_number || '012'}. Saya warga ingin meminta kode akses/OTP untuk membuat surat pengantar online. Terima kasih.`
  )}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Visual */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-white/20 text-[11px] font-bold uppercase tracking-wider rounded-full mb-1">
            Portal Resmi Rukun Tetangga
          </span>
          <h1 className="text-xl md:text-2xl font-black">
            SURAT RT {rtProfile?.rt_number} / RW {rtProfile?.rw_number}
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            Kelurahan {rtProfile?.kelurahan}, Kecamatan {rtProfile?.kecamatan}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('otp')
              setErrorMsg('')
            }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'otp'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Kode Akses Warga (OTP)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin')
              setErrorMsg('')
            }}
            className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'admin'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            Pengurus RT (PIN Admin)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {activeTab === 'otp' ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900">Masukkan Kode Akses OTP Warga</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan kode unik yang telah dibagikan oleh Ketua RT / Pengurus RT Anda.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={10}
                  autoFocus
                  required
                  placeholder="Contoh: 888999"
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
                    Masuk ke Layanan Surat
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-emerald-200"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Minta Kode OTP via WhatsApp Pengurus RT
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-900">Login Khusus Pengurus RT</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan PIN Admin untuk mengelola seluruh surat, data warga, dan kode OTP.
                </p>
              </div>

              <div>
                <input
                  type="password"
                  maxLength={12}
                  autoFocus
                  required
                  placeholder="Masukkan PIN Admin"
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

          {/* Quick Demo Access Pills */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 block mb-2">Kode Bawaan Demo Awal:</span>
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp')
                  setOtpCode('888999')
                  setErrorMsg('')
                }}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-mono font-semibold"
              >
                OTP Warga: 888999
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin')
                  setAdminPin('123456')
                  setErrorMsg('')
                }}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[11px] font-mono font-semibold"
              >
                PIN Admin: 123456
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center max-w-sm">
        Sistem Administrasi Surat RT Dilindungi Akses Terbatas. Hanya warga dan pengurus terdaftar yang dapat membuat dokumen.
      </p>
    </div>
  )
}

