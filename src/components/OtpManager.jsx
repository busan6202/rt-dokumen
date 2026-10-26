import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'
import { formatTanggalIndo, formatWhatsAppNumber } from '../utils/helpers'
import {
  KeyRound,
  Plus,
  Share2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Trash2,
  Ban,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react'

export default function OtpManager({ rtProfile, wargaList }) {
  const [otpList, setOtpList] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [recipientType, setRecipientType] = useState('warga') // 'warga' or 'custom'
  const [selectedWargaId, setSelectedWargaId] = useState('')
  const [customName, setCustomName] = useState('')
  const [customPhone, setCustomPhone] = useState('')
  const [expiryDays, setExpiryDays] = useState(7)
  const [maxUses, setMaxUses] = useState(0) // 0 = unlimited, 1 = single use
  const [customOtp, setCustomOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadOtps = async () => {
    setLoading(true)
    try {
      const list = await db.getOTPList()
      setOtpList(list)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOtps()
  }, [])

  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleOpenAdd = () => {
    setCustomOtp(generateRandomOtp())
    setRecipientType('warga')
    setSelectedWargaId(wargaList[0]?.id || '')
    setCustomName('')
    setCustomPhone('')
    setExpiryDays(7)
    setMaxUses(0)
    setIsModalOpen(true)
  }

  const handleCreateOtp = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let recipientName = customName
      let recipientPhone = customPhone
      let recipientNik = null

      if (recipientType === 'warga') {
        const found = wargaList.find(w => w.id === selectedWargaId)
        if (found) {
          recipientName = found.nama_lengkap
          recipientPhone = found.no_hp || ''
          recipientNik = found.nik
        }
      }

      if (!recipientName) {
        alert('Nama penerima wajib diisi.')
        setIsSubmitting(false)
        return
      }

      let expiresAt = null
      if (expiryDays > 0) {
        const d = new Date()
        d.setDate(d.getDate() + parseInt(expiryDays, 10))
        expiresAt = d.toISOString()
      }

      const payload = {
        otp_code: customOtp || generateRandomOtp(),
        nama_penerima: recipientName,
        no_hp: recipientPhone,
        nik_terkait: recipientNik,
        role: 'warga',
        status: 'active',
        max_uses: parseInt(maxUses, 10),
        used_count: 0,
        expires_at: expiresAt
      }

      await db.createOTP(payload)
      setIsModalOpen(false)
      loadOtps()
    } catch (err) {
      alert(`Gagal membuat OTP: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (id) => {
    if (confirm('Yakin ingin menonaktifkan kode OTP ini? Warga tidak akan bisa login lagi dengan kode ini.')) {
      await db.revokeOTP(id)
      loadOtps()
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus permanen riwayat OTP ini?')) {
      await db.deleteOTP(id)
      loadOtps()
    }
  }

  const getDirectLink = (otpCode) => {
    const origin = window.location.origin
    const pathname = window.location.pathname
    return `${origin}${pathname}?otp=${otpCode}`
  }

  const copyDirectLink = (id, otpCode) => {
    const link = getDirectLink(otpCode)
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const sendWhatsApp = (item) => {
    const link = getDirectLink(item.otp_code)
    const phone = item.no_hp ? formatWhatsAppNumber(item.no_hp) : ''
    const message = `Halo Bpk/Ibu ${item.nama_penerima},\n\nBerikut tautan resmi untuk membuat surat keterangan / pengantar RT ${rtProfile.rt_number} / RW ${rtProfile.rw_number}:\n${link}\n\nKode Akses OTP Anda: *${item.otp_code}*\n\nSilakan klik tautan di atas untuk langsung masuk. Terima kasih.\n- Pengurus RT ${rtProfile.rt_number}`

    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`

    window.open(waUrl, '_blank')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="bg-[#131c2e] p-5 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <KeyRound className="w-5 h-5 text-amber-400" />
            Kelola Kode Akses Warga (OTP Generator)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Otorisasi akses pembuatan surat khusus bagi warga terdaftar di lingkungan RT {rtProfile?.rt_number}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (confirm('Bersihkan semua kode OTP yang sudah kadaluarsa atau sudah terpakai?')) {
                await db.cleanExpiredOtps()
                loadOtps()
                alert('OTP kadaluarsa berhasil dibersihkan!')
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition whitespace-nowrap"
            title="Hapus otomatis OTP yang kadaluarsa atau sudah dipakai"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            Bersihkan Kadaluarsa
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Terbitkan OTP Baru
          </button>
        </div>
      </div>

      {/* OTP Table - Civic Security Console */}
      <div className="bg-[#131c2e] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat data OTP...</div>
        ) : otpList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <KeyRound className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-xs font-semibold text-slate-300">Belum ada kode OTP yang diterbitkan.</p>
            <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk membuat kode akses pertama bagi warga.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c1322] border-b border-white/[0.08] text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kode Akses OTP</th>
                  <th className="px-5 py-3.5">Warga Penerima</th>
                  <th className="px-5 py-3.5">Masa Berlaku</th>
                  <th className="px-5 py-3.5 text-center">Penggunaan</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi & Bagikan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-slate-300">
                {otpList.map(item => {
                  const isExpired = item.expires_at && new Date(item.expires_at) < new Date()
                  const isActive = item.status === 'active' && !isExpired

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      {/* Kode OTP */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-base font-extrabold text-amber-300 tracking-widest bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/25 inline-block">
                          {item.otp_code}
                        </span>
                      </td>

                      {/* Penerima */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-white text-xs">{item.nama_penerima}</p>
                          {item.catatan?.includes('Mandiri') && (
                            <span className="text-[9px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold">
                              Mandiri NIK
                            </span>
                          )}
                        </div>
                        {item.no_hp && <p className="font-mono text-[11px] text-slate-400">{item.no_hp}</p>}
                        {item.nik_terkait && (
                          <p className="font-mono text-[10px] text-amber-400/80">NIK: {item.nik_terkait}</p>
                        )}
                      </td>

                      {/* Masa Berlaku */}
                      <td className="px-5 py-4 text-xs">
                        {item.expires_at ? (
                          <div>
                            <span className={isExpired ? 'text-rose-400 font-semibold' : 'text-slate-200'}>
                              {formatTanggalIndo(item.expires_at)}
                            </span>
                            {isExpired && <span className="text-[10px] font-mono text-rose-400 block">(Kadaluarsa)</span>}
                          </div>
                        ) : (
                          <span className="text-slate-500">Permanen (Tanpa Batas)</span>
                        )}
                      </td>

                      {/* Penggunaan */}
                      <td className="px-5 py-4 text-center text-xs">
                        <span className="font-bold text-white font-mono">{item.used_count || 0}x</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {item.max_uses > 0 ? `Maks ${item.max_uses}x` : 'Bebas'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Aktif
                          </span>
                        ) : item.status === 'revoked' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.05] text-slate-400 border border-white/10">
                            Dicabut
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            {isExpired ? 'Kadaluarsa' : 'Habis'}
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => sendWhatsApp(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/25 rounded-lg transition"
                            title="Kirim Kode & Link via WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Kirim WA
                          </button>

                          <button
                            onClick={() => copyDirectLink(item.id, item.otp_code)}
                            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/[0.05] rounded-lg transition"
                            title="Salin Tautan Login Langsung"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {isActive && (
                            <button
                              onClick={() => handleRevoke(item.id)}
                              className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                              title="Cabut / Nonaktifkan OTP"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Hapus Riwayat OTP"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Terbitkan OTP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131c2e] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0c1322]">
              <h3 className="font-bold text-white text-base flex items-center gap-2 tracking-tight">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Terbitkan Kode Akses OTP Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOtp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kode Akses / OTP (6 Digit)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={customOtp}
                    onChange={e => setCustomOtp(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 text-base font-mono font-bold bg-[#0c1322] rounded-xl border border-white/15 focus:border-amber-400 text-center tracking-widest text-amber-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomOtp(generateRandomOtp())}
                    className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-amber-300 border border-white/10 rounded-xl whitespace-nowrap transition"
                  >
                    Acak Kode
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tujuan Penerima</label>
                <div className="flex gap-4 mb-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      checked={recipientType === 'warga'}
                      onChange={() => setRecipientType('warga')}
                      className="accent-amber-400"
                    />
                    <span>Pilih dari Data Warga ({wargaList.length})</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      checked={recipientType === 'custom'}
                      onChange={() => setRecipientType('custom')}
                      className="accent-amber-400"
                    />
                    <span>Input Nama Manual</span>
                  </label>
                </div>

                {recipientType === 'warga' ? (
                  <select
                    value={selectedWargaId}
                    onChange={e => setSelectedWargaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  >
                    {wargaList.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.nama_lengkap} (NIK: {w.nik}) {w.no_hp ? `- WA: ${w.no_hp}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama Lengkap Warga"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Nomor WhatsApp (Contoh: 081234567890)"
                      value={customPhone}
                      onChange={e => setCustomPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Masa Berlaku</label>
                  <select
                    value={expiryDays}
                    onChange={e => setExpiryDays(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  >
                    <option value={1}>1 Hari (24 Jam)</option>
                    <option value={7}>7 Hari (1 Minggu)</option>
                    <option value={30}>30 Hari (1 Bulan)</option>
                    <option value={0}>Tanpa Batas Waktu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batasan Penggunaan</label>
                  <select
                    value={maxUses}
                    onChange={e => setMaxUses(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0c1322] text-white rounded-xl border border-white/10 focus:border-amber-400 focus:outline-none"
                  >
                    <option value={0}>Bebas (Berkali-kali)</option>
                    <option value={1}>Sekali Pakai (1x Surat)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl border border-white/10 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Menerbitkan...' : 'Terbitkan & Simpan OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
