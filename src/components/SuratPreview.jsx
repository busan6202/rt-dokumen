import React, { useEffect, useState } from 'react'
import { formatTanggalIndo, generateQRCodeDataUrl } from '../utils/helpers'
import { ShieldCheck, Printer, ArrowLeft, Download, CheckCircle, Copy } from 'lucide-react'

export default function SuratPreview({ surat, rtProfile, onBack, onPrint }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${surat.qr_token || 'demo'}`

  useEffect(() => {
    if (surat?.qr_token) {
      generateQRCodeDataUrl(verificationUrl).then(setQrDataUrl)
    }
  }, [surat?.qr_token, verificationUrl])

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verificationUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (!surat || !rtProfile) return null

  const pemohon = surat.pemohon_data || {}
  const khusus = surat.data_khusus || {}

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          )}
          <div>
            <h2 className="text-base font-semibold text-slate-900">{surat.judul_surat}</h2>
            <p className="text-xs text-slate-500">No: {surat.nomor_surat} • {pemohon.nama_lengkap}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={copyVerifyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="Salin tautan verifikasi online"
          >
            {copiedLink ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Tersalin!' : 'Salin Link Verifikasi'}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition"
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
          className="paper-sheet bg-white w-full max-w-[210mm] min-h-[297mm] p-8 md:p-14 shadow-lg border border-slate-200 rounded-lg font-formal text-black relative flex flex-col justify-between"
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
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-900">
                  PENGURUS RUKUN TETANGGA {rtProfile.rt_number} / RUKUN WARGA {rtProfile.rw_number}
                </h3>
                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-slate-900">
                  KELURAHAN {rtProfile.kelurahan} KECAMATAN {rtProfile.kecamatan}
                </h2>
                <h3 className="text-sm md:text-base font-bold uppercase tracking-wide text-slate-900">
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
              Yang bertanda tangan di bawah ini, Pengurus Rukun Tetangga (RT) {rtProfile.rt_number} Rukun Warga (RW) {rtProfile.rw_number}, Kelurahan {rtProfile.kelurahan}, Kecamatan {rtProfile.kecamatan}, {rtProfile.kota_kabupaten}, dengan ini menerangkan dengan sebenarnya bahwa:
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
                      {pemohon.alamat || '-'} RT {pemohon.rt || rtProfile.rt_number} / RW {pemohon.rw || rtProfile.rw_number}, Kelurahan {rtProfile.kelurahan}, Kecamatan {rtProfile.kecamatan}, {rtProfile.kota_kabupaten}
                    </td>
                  </tr>
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
              {/* Kolom 1: Pemohon (jika ada) */}
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
                  Ketua Rukun Tetangga (RT) {rtProfile.rt_number}
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
      </div>
    </div>
  )
}

