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
  ExternalLink
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-600">Memverifikasi keaslian dokumen...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Verification Status Banner */}
        {surat ? (
          <div className="bg-emerald-600 p-8 text-white text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <span className="inline-block px-3 py-1 bg-white/20 text-xs font-bold uppercase tracking-wider rounded-full mb-1">
              Dokumen Terverifikasi Resmi
            </span>
            <h1 className="text-xl md:text-2xl font-black">SURAT ASLI & TERDATA</h1>
            <p className="text-xs text-emerald-100 mt-1">
              Tercatat dalam Buku Administrasi RT {rtProfile?.rt_number} / RW {rtProfile?.rw_number}
            </p>
          </div>
        ) : (
          <div className="bg-rose-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-black">DOKUMEN TIDAK DITEMUKAN</h1>
            <p className="text-xs text-rose-100 mt-1">
              Token verifikasi tidak cocok dengan arsip surat RT mana pun.
            </p>
          </div>
        )}

        {/* Document Details Card */}
        {surat ? (
          <div className="p-6 md:p-8 space-y-5 text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Nomor Surat</span>
                <span className="font-mono font-bold text-slate-900 text-xs text-right">
                  {surat.nomor_surat}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Jenis Surat</span>
                <span className="font-bold text-blue-600 text-xs">{surat.judul_surat}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Tanggal Diterbitkan</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {formatTanggalIndo(surat.tanggal_surat)}
                </span>
              </div>

              <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Nama Pemohon / Warga</span>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-xs uppercase">{surat.pemohon_nama}</p>
                  <p className="font-mono text-[10px] text-slate-500">NIK: {surat.pemohon_nik}</p>
                </div>
              </div>

              <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Keperluan</span>
                <span className="font-semibold text-slate-800 text-xs text-right max-w-[240px]">
                  {surat.keperluan}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Penandatangan</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {surat.signed_by || rtProfile?.nama_ketua_rt} (Ketua RT {rtProfile?.rt_number})
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {onPreviewSurat && (
                <button
                  onClick={() => onPreviewSurat(surat)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 text-xs transition"
                >
                  <FileCheck className="w-4 h-4" />
                  Lihat Lembar Dokumen Asli
                </button>
              )}

              <button
                onClick={onBackToApp}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Aplikasi Utama RT
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-500 mb-6">
              Kode verifikasi: <code className="font-mono bg-slate-100 px-2 py-1 rounded">{token}</code>
            </p>
            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Aplikasi Surat RT
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">
        Sistem Layanan Surat Digital Rukun Tetangga (RT) • Powered by Supabase & GitHub Pages
      </p>
    </div>
  )
}

