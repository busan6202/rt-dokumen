import React, { useEffect, useState } from 'react'
import { formatTanggalIndo, generateQRCodeDataUrl } from '../utils/helpers'
import {
  ShieldCheck,
  Printer,
  ArrowLeft,
  Download,
  CheckCircle,
  Copy,
  FileText,
  Check,
  CreditCard,
  Eye,
  X,
  Camera,
  Image as ImageIcon
} from 'lucide-react'

export default function SuratPreview({ surat, rtProfile, onBack, onPrint }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [attachments, setAttachments] = useState(null)
  const [includeAttachmentInPrint, setIncludeAttachmentInPrint] = useState(false)
  const [zoomImage, setZoomImage] = useState(null)

  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${surat.qr_token || 'demo'}`

  useEffect(() => {
    if (surat?.qr_token) {
      generateQRCodeDataUrl(verificationUrl).then(setQrDataUrl)
    }
  }, [surat?.qr_token, verificationUrl])

  // Load local-only attachments from LocalStorage on this device
  useEffect(() => {
    if (surat) {
      try {
        let raw = surat.id ? localStorage.getItem(`RT_ATTACHMENT_${surat.id}`) : null
        if (!raw && surat.qr_token) {
          raw = localStorage.getItem(`RT_ATTACHMENT_${surat.qr_token}`)
        }
        if (!raw && surat.pemohon_nik) {
          raw = localStorage.getItem(`RT_DOCS_${surat.pemohon_nik}`)
        }
        if (!raw && surat.pemohon_data?.nik) {
          raw = localStorage.getItem(`RT_DOCS_${surat.pemohon_data.nik}`)
        }
        if (raw) {
          setAttachments(JSON.parse(raw))
        }
      } catch (e) {
        console.warn('Gagal memuat lampiran lokal:', e)
      }
    }
  }, [surat])

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verificationUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (!surat || !rtProfile) return null

  const pemohon = surat.pemohon_data || {}
  const khusus = surat.data_khusus || {}

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Toolbar (Hidden during print) */}
      <div className="no-print bg-[#131c2e] p-4.5 rounded-2xl border border-white/[0.08] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl border border-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          )}
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{surat.judul_surat}</h2>
            <p className="text-xs text-slate-400 font-mono">
              <span className="text-amber-300">{surat.nomor_surat}</span> • {pemohon.nama_lengkap}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={copyVerifyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition"
            title="Salin tautan verifikasi online"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Tersalin!' : 'Salin Tautan Verifikasi'}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF (A4)
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="print-container flex justify-center py-4">
        <div
          id="printable-document"
          className="paper-sheet bg-white w-full max-w-[210mm] min-h-[297mm] p-8 md:p-14 shadow-2xl rounded-sm font-formal text-black relative flex flex-col justify-between"
          style={{ boxSizing: 'border-box' }}
        >
          {/* TOP SECTION: KOP SURAT */}
          <div>
            <div className="kop-surat flex items-center justify-between pb-3 border-b-4 border-black relative">
              {/* Logo Daerah / RT */}
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                {rtProfile.logo_url || true ? (
                  <img
                    src={rtProfile.logo_url || './logo-daerah.png'}
                    alt="Logo Daerah Habaring Hurung"
                    className="max-h-20 max-w-20 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-slate-700 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">RUKUN</span>
                    <span className="text-sm font-black leading-tight text-blue-900">RT</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{rtProfile.rt_number}</span>
                  </div>
                )}
              </div>

              {/* Kop Text */}
              <div className="flex-1 text-center px-4">
                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-slate-900 leading-tight">
                  KETUA RT.{(rtProfile.rt_number || '25').replace(/^0+/, '')} / RW. {rtProfile.rw_number || 'IX'}
                </h2>
                <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 leading-tight mt-0.5">
                  KELURAHAN {(rtProfile.kelurahan || 'MENTAWA BARU HULU').toUpperCase()}
                </h2>
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-900 leading-tight mt-0.5">
                  KECAMATAN
                </h3>
                <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 leading-tight">
                  {(rtProfile.kecamatan || 'MENTAWA BARU KETAPANG').toUpperCase()}
                </h2>
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wide text-slate-800 mt-1">
                  {rtProfile.kota_kabupaten} - PROVINSI {rtProfile.provinsi}
                </h3>
                <p className="text-[11px] leading-tight text-slate-700 mt-1">
                  Sekretariat: {rtProfile.alamat_sekretariat} {rtProfile.kode_pos ? `Kode Pos ${rtProfile.kode_pos}` : ''}
                  {rtProfile.kontak_telepon ? ` • Telp/WA: ${rtProfile.kontak_telepon}` : ''}
                  {rtProfile.email ? ` • Email: ${rtProfile.email}` : ''}
                </p>
              </div>

              <div className="w-20 flex-shrink-0"></div>
            </div>
            {/* Secondary line for formal Indonesian double border */}
            <div className="border-b border-black -mt-[1px] mb-6"></div>

            {/* JUDUL DOKUMEN & NOMOR */}
            <div className="text-center mb-6">
              <h1 className="text-base md:text-lg font-black tracking-wide uppercase underline decoration-2 underline-offset-4">
                {surat.judul_surat || 'SURAT PENGANTAR'}
              </h1>
              <p className="text-xs md:text-sm font-semibold mt-1">
                Nomor: {surat.nomor_surat}
              </p>
            </div>

            {/* OPENING PARAGRAPH */}
            <p className="text-justify text-xs md:text-sm leading-relaxed mb-4 indent-8">
              Yang bertanda tangan di bawah ini, Ketua RT.{(rtProfile.rt_number || '25').replace(/^0+/, '')} / RW. {rtProfile.rw_number || 'IX'}, Kelurahan {rtProfile.kelurahan || 'Mentawa Baru Hulu'}, Kecamatan {rtProfile.kecamatan || 'Mentawa Baru Ketapang'}, {rtProfile.kota_kabupaten}, dengan ini menerangkan dengan sebenarnya bahwa:
            </p>

            {/* DATA WARGA / PEMOHON */}
            <div className="mb-4 text-xs md:text-sm leading-relaxed">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="w-40 py-0.5 align-top">Nama Lengkap</td>
                    <td className="w-4 py-0.5 align-top">:</td>
                    <td className="py-0.5 font-bold uppercase">{pemohon.nama_lengkap || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Nomor Induk Kependudukan (NIK)</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5 font-mono">{pemohon.nik || '-'}</td>
                  </tr>
                  {pemohon.no_kk && (
                    <tr>
                      <td className="py-0.5 align-top">Nomor Kartu Keluarga (KK)</td>
                      <td className="py-0.5 align-top">:</td>
                      <td className="py-0.5 font-mono">{pemohon.no_kk}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-0.5 align-top">Tempat, Tanggal Lahir</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">
                      {pemohon.tempat_lahir || '-'}, {pemohon.tanggal_lahir ? formatTanggalIndo(pemohon.tanggal_lahir) : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Jenis Kelamin</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">{pemohon.jenis_kelamin || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Agama</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">{pemohon.agama || 'Islam'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Kewarganegaraan</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">{pemohon.kewarganegaraan || 'WNI'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Status Perkawinan</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">{pemohon.status_perkawinan || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Pekerjaan</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">{pemohon.pekerjaan || '-'}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 align-top">Alamat KTP / Domisili</td>
                    <td className="py-0.5 align-top">:</td>
                    <td className="py-0.5">
                      {pemohon.alamat || '-'} {pemohon.status_tinggal === 'Non-RT.25' ? '(Alamat Luar RT.25)' : `RT ${pemohon.rt || rtProfile.rt_number} / RW ${pemohon.rw || rtProfile.rw_number}, Kelurahan ${rtProfile.kelurahan}, Kecamatan ${rtProfile.kecamatan}, ${rtProfile.kota_kabupaten}`}
                    </td>
                  </tr>
                  {pemohon.status_tinggal && (
                    <tr>
                      <td className="py-0.5 align-top">Status Kependudukan</td>
                      <td className="py-0.5 align-top">:</td>
                      <td className="py-0.5 font-semibold text-slate-900">
                        {pemohon.status_tinggal === 'Non-RT.25' ? 'Non-RT.25 (Warga Luar RT.25)' : `Warga ${pemohon.status_tinggal}`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SECTION KHUSUS BERDASARKAN JENIS SURAT */}
            {surat.jenis_surat === 'kematian' && (
              <div className="mb-4 text-xs md:text-sm bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-semibold mb-1">Menerangkan bahwa orang tersebut di atas telah meninggal dunia pada:</p>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-40 py-0.5">Hari / Tanggal Kematian</td>
                      <td className="w-4 py-0.5">:</td>
                      <td className="py-0.5 font-bold">{khusus.hari_tanggal_kematian || formatTanggalIndo(khusus.tanggal_kematian)}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Waktu / Pukul</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.jam_kematian || '-'} WIB</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Tempat Kematian</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.tempat_kematian || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Penyebab Kematian</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.penyebab_kematian || 'Sakit biasa / Wajar'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Nama Pelapor</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5 font-semibold">{khusus.nama_pelapor || '-'} ({khusus.hubungan_pelapor || 'Keluarga'})</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {surat.jenis_surat === 'usaha' && (
              <div className="mb-4 text-xs md:text-sm bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-semibold mb-1">Menerangkan bahwa warga tersebut benar memiliki dan menjalankan kegiatan usaha:</p>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-40 py-0.5">Nama Usaha / Toko</td>
                      <td className="w-4 py-0.5">:</td>
                      <td className="py-0.5 font-bold">{khusus.nama_usaha || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Bidang / Jenis Usaha</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.jenis_usaha || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Alamat Tempat Usaha</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.alamat_usaha || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Berjalan Sejak</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">Tahun {khusus.tahun_berdiri || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {surat.jenis_surat === 'domisili' && (
              <p className="text-justify text-xs md:text-sm leading-relaxed mb-4 indent-8">
                Adalah benar-benar warga yang bertempat tinggal / berdomisili menetap di wilayah lingkungan Rukun Tetangga (RT) {rtProfile.rt_number} Rukun Warga (RW) {rtProfile.rw_number}, Kelurahan {rtProfile.kelurahan}, Kecamatan {rtProfile.kecamatan}, {rtProfile.kota_kabupaten} {khusus.sejak_tahun ? `sejak tahun ${khusus.sejak_tahun}` : 'hingga saat surat keterangan ini diterbitkan'}.
              </p>
            )}

            {surat.jenis_surat === 'sktm' && (
              <p className="text-justify text-xs md:text-sm leading-relaxed mb-4 indent-8">
                Berdasarkan pengamatan dan data kami, orang tersebut di atas adalah benar-benar warga kami yang tergolong dalam <strong>Keluarga Kurang Mampu / Pra-Sejahtera</strong> dan membutuhkan bantuan.
              </p>
            )}

            {surat.jenis_surat === 'pindah' && (
              <div className="mb-4 text-xs md:text-sm bg-slate-50 p-3 rounded border border-slate-200">
                <p className="font-semibold mb-1">Menerangkan bahwa yang bersangkutan bermaksud pindah tempat tinggal ke:</p>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-40 py-0.5">Alamat Tujuan Pindah</td>
                      <td className="w-4 py-0.5">:</td>
                      <td className="py-0.5">{khusus.alamat_tujuan || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Kelurahan / Desa</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.kelurahan_tujuan || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Kecamatan & Kota</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.kecamatan_tujuan || '-'}, {khusus.kota_tujuan || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Alasan Pindah</td>
                      <td className="py-0.5">:</td>
                      <td className="py-0.5">{khusus.alasan_pindah || 'Pekerjaan / Domisili Keluarga'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {surat.jenis_surat === 'pengantar_ktp' && (
              <p className="text-justify text-xs md:text-sm leading-relaxed mb-4 indent-8">
                Bermaksud mengajukan permohonan <strong>{khusus.jenis_ktp || 'Pembuatan KTP Baru'}</strong> di Dinas Kependudukan dan Pencatatan Sipil melalui Kantor Kelurahan setempat.
              </p>
            )}

            {/* KEPERLUAN & PENUTUP */}
            <div className="mb-4 text-xs md:text-sm leading-relaxed">
              <p className="text-justify mb-2 indent-8">
                Surat keterangan / pengantar ini dibuat dan diberikan kepada yang bersangkutan untuk keperluan:
              </p>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 font-semibold text-slate-900 text-center uppercase tracking-wide">
                "{surat.keperluan || 'Keperluan Administrasi Kependudukan'}"
              </div>
            </div>

            <p className="text-justify text-xs md:text-sm leading-relaxed mb-6 indent-8">
              Demikian surat keterangan / pengantar ini dibuat dengan sebenarnya dan dengan penuh tanggung jawab untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* BOTTOM SECTION: TANDA TANGAN & STEMPEL & QR CODE */}
          <div className="ttd-section mt-8 pt-4">
            <div className="grid grid-cols-3 gap-2 items-end">
              {/* Kolom 1: Pemohon */}
              <div className="text-center text-xs md:text-sm">
                <p className="text-slate-800">Mengetahui / Pemohon,</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-slate-300 text-xs italic">[ Tanda Tangan ]</span>
                </div>
                <p className="font-bold underline uppercase">{pemohon.nama_lengkap}</p>
              </div>

              {/* Kolom 2: QR Code Verifikasi Keaslian */}
              <div className="flex flex-col items-center justify-center text-center">
                {qrDataUrl ? (
                  <div className="p-1.5 border border-slate-300 rounded bg-white shadow-sm inline-block">
                    <img src={qrDataUrl} alt="QR Code Verifikasi" className="w-20 h-20" />
                  </div>
                ) : (
                  <div className="w-20 h-20 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                    QR Validasi
                  </div>
                )}
                <span className="text-[9px] text-slate-500 font-sans mt-1">
                  Pindai QR untuk verifikasi keaslian surat
                </span>
                <span className="text-[8px] font-mono text-slate-400">
                  ID: {surat.qr_token ? surat.qr_token.substring(0, 8) : 'VERIFIED'}
                </span>
              </div>

              {/* Kolom 3: Pengurus RT */}
              <div className="text-center text-xs md:text-sm relative">
                <p className="text-slate-800">
                  {rtProfile.kota_kabupaten}, {formatTanggalIndo(surat.tanggal_surat || new Date())}
                </p>
                <p className="font-semibold text-slate-900">
                  Ketua RT.{(rtProfile.rt_number || '25').replace(/^0+/, '')} / RW. {rtProfile.rw_number || 'IX'}
                </p>

                {/* Stempel Digital Overlay & TTD if present */}
                <div className="h-20 flex items-center justify-center relative my-1">
                  {rtProfile.ttd_digital_url ? (
                    <img
                      src={rtProfile.ttd_digital_url}
                      alt="TTD Ketua RT"
                      className="max-h-16 max-w-28 object-contain z-10"
                    />
                  ) : (
                    <span className="text-slate-300 text-xs italic z-10">[ Tanda Tangan ]</span>
                  )}

                  {rtProfile.stempel_url && (
                    <img
                      src={rtProfile.stempel_url}
                      alt="Stempel RT"
                      className="absolute left-1/2 -translate-x-[65%] -top-1 opacity-85 max-h-20 max-w-24 object-contain pointer-events-none z-20 mix-blend-multiply transform -rotate-6"
                    />
                  )}
                </div>

                <p className="font-black underline uppercase text-slate-950">
                  {rtProfile.nama_ketua_rt}
                </p>
                {rtProfile.nik_ketua_rt && (
                  <p className="text-[11px] font-sans text-slate-600">
                    NIK: {rtProfile.nik_ketua_rt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PRINTABLE SECOND PAGE: LAMPIRAN FOTO KTP & KK (Only printed if enabled) */}
        {includeAttachmentInPrint && (attachments?.foto_ktp || attachments?.foto_kk) && (
          <div
            id="printable-attachment-sheet"
            className="paper-sheet bg-white w-full max-w-[210mm] min-h-[297mm] p-8 md:p-14 shadow-2xl rounded-sm font-formal text-black relative flex flex-col justify-between mt-8 print:mt-0 print:break-before-page"
            style={{ boxSizing: 'border-box' }}
          >
            <div>
              {/* Header Lampiran */}
              <div className="border-b-2 border-black pb-3 mb-6 text-center">
                <h2 className="font-bold text-base md:text-lg uppercase tracking-wider text-black">
                  LAMPIRAN DOKUMEN IDENTITAS KEPENDUDUKAN
                </h2>
                <p className="text-xs font-mono text-slate-700 mt-1">
                  Lampiran Resmi Surat Pengantar Nomor: <span className="font-bold">{surat.nomor_surat}</span>
                </p>
                <p className="text-xs font-semibold text-slate-800 uppercase mt-0.5">
                  Nama Pemohon: {pemohon.nama_lengkap} • NIK: {pemohon.nik}
                </p>
              </div>

              {/* Grid 2 Foto Dokumen */}
              <div className="space-y-6">
                {attachments?.foto_ktp && (
                  <div className="border border-slate-300 rounded p-4 text-center bg-slate-50">
                    <p className="font-bold text-xs uppercase mb-2 text-slate-800">
                      1. FOTO KARTU TANDA PENDUDUK (KTP)
                    </p>
                    <div className="h-60 flex items-center justify-center bg-white p-2 border border-slate-200 rounded">
                      <img
                        src={attachments.foto_ktp}
                        alt="Lampiran KTP"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {attachments?.foto_kk && (
                  <div className="border border-slate-300 rounded p-4 text-center bg-slate-50">
                    <p className="font-bold text-xs uppercase mb-2 text-slate-800">
                      2. FOTO KARTU KELUARGA (KK)
                    </p>
                    <div className="h-60 flex items-center justify-center bg-white p-2 border border-slate-200 rounded">
                      <img
                        src={attachments.foto_kk}
                        alt="Lampiran KK"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Cetak Lampiran */}
            <div className="border-t border-slate-300 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-sans">
              <span>Dokumen lampiran identitas kependudukan tersimpan lokal di smartphone pemohon.</span>
              <span className="font-mono">{rtProfile.kota_kabupaten}, {formatTanggalIndo(surat.tanggal_surat || new Date())}</span>
            </div>
          </div>
        )}
      </div>

      {/* NO-PRINT: LAMPIRAN DOKUMEN IDENTITAS CARD (Screen UI for Smartphone & Desktop) */}
      <div className="no-print max-w-4xl mx-auto bg-[#131c2e] p-6 rounded-2xl border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Lampiran Dokumen Identitas (Foto KTP & KK)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Lokal Smartphone
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dokumen disimpan di penyimpanan internal perangkat Anda (tidak diunggah ke server)
              </p>
            </div>
          </div>

          {(attachments?.foto_ktp || attachments?.foto_kk) && (
            <label className="flex items-center gap-2 px-3 py-1.5 bg-[#0c1322] hover:bg-[#162033] border border-white/10 rounded-xl text-xs text-slate-300 cursor-pointer transition">
              <input
                type="checkbox"
                checked={includeAttachmentInPrint}
                onChange={e => setIncludeAttachmentInPrint(e.target.checked)}
                className="rounded accent-amber-400 w-3.5 h-3.5"
              />
              <span className="font-medium text-amber-300">Sertakan lampiran saat Cetak / PDF</span>
            </label>
          )}
        </div>

        {/* Security Alert Note */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-emerald-300">Privasi Data Terlindungi:</strong> Sesuai standar keamanan data pribadi kependudukan, file foto KTP & Kartu Keluarga hanya tersimpan secara lokal di smartphone/peramban Anda sendiri dan <strong>TIDAK disimpan di server database</strong>.
          </p>
        </div>

        {/* Attachments Preview Grid */}
        {attachments?.foto_ktp || attachments?.foto_kk ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Foto KTP */}
            <div className="p-4 bg-[#0c1322] rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  Foto KTP Pemohon
                </span>
                {attachments.foto_ktp && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    Tersedia di Perangkat Ini
                  </span>
                )}
              </div>

              {attachments.foto_ktp ? (
                <div className="space-y-2">
                  <div
                    onClick={() => setZoomImage({ title: 'Foto KTP Pemohon', src: attachments.foto_ktp })}
                    className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 h-40 flex items-center justify-center cursor-pointer"
                  >
                    <img src={attachments.foto_ktp} alt="KTP" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Perbesar Foto
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
                  Tidak ada lampiran foto KTP untuk surat ini
                </div>
              )}
            </div>

            {/* Foto KK */}
            <div className="p-4 bg-[#0c1322] rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Foto Kartu Keluarga (KK)
                </span>
                {attachments.foto_kk && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    Tersedia di Perangkat Ini
                  </span>
                )}
              </div>

              {attachments.foto_kk ? (
                <div className="space-y-2">
                  <div
                    onClick={() => setZoomImage({ title: 'Foto Kartu Keluarga (KK)', src: attachments.foto_kk })}
                    className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 h-40 flex items-center justify-center cursor-pointer"
                  >
                    <img src={attachments.foto_kk} alt="KK" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Perbesar Foto
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
                  Tidak ada lampiran foto Kartu Keluarga untuk surat ini
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 text-center bg-[#0c1322] rounded-xl border border-white/10 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Tidak ada lampiran foto KTP/KK yang tersimpan di perangkat ini.</p>
            <p className="text-[11px] text-slate-500">
              Jika surat dibuat dari ponsel lain, lampiran foto disimpan di ponsel pembuat dokumen dan tidak diunggah ke server demi privasi data.
            </p>
          </div>
        )}
      </div>

      {/* Modal Zoom Preview */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131c2e] max-w-3xl w-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0c1322]">
              <h4 className="text-sm font-bold text-white">{zoomImage.title}</h4>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/50 max-h-[75vh] overflow-auto">
              <img src={zoomImage.src} alt={zoomImage.title} className="max-h-[70vh] w-auto object-contain rounded-lg" />
            </div>
            <div className="p-3 bg-[#0c1322] border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
