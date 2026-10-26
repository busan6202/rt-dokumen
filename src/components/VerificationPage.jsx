import React, { useEffect, useState } from 'react'
import { db } from '../supabaseClient'
import { formatTanggalIndo } from '../utils/helpers'
import {
  CheckCircle2,
  XCircle,
  FileCheck,
  Building,
  Calendar,
  User,
  ArrowLeft,
  Printer,
  ShieldCheck,
  ExternalLink,
  Building2,
  Award,
  QrCode
} from 'lucide-react'

export default function VerificationPage({ token, onBackToApp, onPreviewSurat }) {
  const [loading, setLoading] = useState(true)
  const [surat, setSurat] = useState(null)
  const [rtProfile, setRtProfile] = useState(null)

  useEffect(() => {
    async function verify() {
      setLoading(true)
      try {
        const [foundSurat, profile] = await Promise.all([
          db.getSuratByToken(token),
          db.getProfile()
        ])
        setSurat(foundSurat)
        setRtProfile(profile)
      } catch (err) {
        console.error('Verification error:', err)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center animate-spin">
            <QrCode className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        <p className="text-xs font-mono font-bold text-amber-300 tracking-wider">
          MEMVERIFIKASI KEASLIAN DOKUMEN...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-4 py-12 text-slate-100 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-[#131c2e] rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10">
        {/* Verification Status Banner */}
        {surat ? (
          <div className="bg-gradient-to-b from-[#143026] to-[#131c2e] p-8 text-center relative border-b border-emerald-500/20">
            <div className="w-18 h-18 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 flex items-center justify-center mx-auto mb-3.5 shadow-lg">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full border border-emerald-500/30 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              VERIFIKASI OTENTIKASI RESMI
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">DOKUMEN RESMI TERVALIDASI</h1>
            <p className="text-xs text-slate-300 mt-1">
              Tercatat dalam Buku Administrasi RT {rtProfile?.rt_number} / RW {rtProfile?.rw_number}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kelurahan {rtProfile?.kelurahan}, Kecamatan {rtProfile?.kecamatan}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-rose-950/80 to-[#131c2e] p-8 text-center border-b border-rose-500/25">
            <div className="w-18 h-18 bg-rose-500/20 rounded-2xl border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white">DOKUMEN TIDAK DITEMUKAN</h1>
            <p className="text-xs text-rose-300 mt-1">
              Token verifikasi tidak cocok dengan nomor register surat RT mana pun.
            </p>
          </div>
        )}

        {/* Document Details Card */}
        {surat ? (
          <div className="p-6 md:p-8 space-y-5 text-sm">
            <div className="p-4.5 bg-[#0c1322] rounded-2xl border border-white/[0.08] space-y-3">
              <div className="flex justify-between items-start border-b border-white/[0.06] pb-2.5">
                <span className="text-xs text-slate-400 font-medium">Nomor Surat</span>
                <span className="font-mono font-bold text-amber-300 text-xs text-right">
                  {surat.nomor_surat}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/[0.06] pb-2.5">
                <span className="text-xs text-slate-400 font-medium">Jenis Surat</span>
                <span className="font-bold text-white text-xs">{surat.judul_surat}</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/[0.06] pb-2.5">
                <span className="text-xs text-slate-400 font-medium">Tanggal Terbit</span>
                <span className="font-semibold text-slate-200 text-xs">
                  {formatTanggalIndo(surat.tanggal_surat)}
                </span>
              </div>

              <div className="flex justify-between items-start border-b border-white/[0.06] pb-2.5">
                <span className="text-xs text-slate-400 font-medium">Nama Pemohon</span>
                <div className="text-right">
                  <p className="font-bold text-white text-xs uppercase">{surat.pemohon_nama}</p>
                  <p className="font-mono text-[10px] text-amber-400">NIK: {surat.pemohon_nik}</p>
                </div>
              </div>

              <div className="flex justify-between items-start border-b border-white/[0.06] pb-2.5">
                <span className="text-xs text-slate-400 font-medium">Perihal / Keperluan</span>
                <span className="font-semibold text-slate-200 text-xs text-right max-w-[240px]">
                  {surat.keperluan}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Penandatangan</span>
                <span className="font-semibold text-slate-200 text-xs">
                  {surat.signed_by || rtProfile?.nama_ketua_rt} (Ketua RT {rtProfile?.rt_number})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {onPreviewSurat && (
                <button
                  onClick={() => onPreviewSurat(surat)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition active:scale-95"
                >
                  <FileCheck className="w-4 h-4" />
                  Lihat Lembar Dokumen Asli
                </button>
              )}

              <button
                onClick={onBackToApp}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold rounded-xl text-xs border border-white/10 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Aplikasi Utama RT
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Token verifikasi: <code className="bg-[#0c1322] px-2 py-1 rounded text-rose-300 border border-white/10">{token}</code>
            </p>
            <button
              onClick={onBackToApp}
              className="py-2.5 px-5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold rounded-xl text-xs border border-white/10 transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Aplikasi
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-6 text-center max-w-sm font-mono">
        SISTEM VERIFIKASI KEASLIAN DOKUMEN RT BERBASIS QR OTENTIK
      </p>
    </div>
  )
}
