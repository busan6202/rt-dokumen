import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'
import { formatTanggalIndo } from '../utils/helpers'
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
  Send
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
    const phone = (item.no_hp || '').replace(/\D/g, '')
    const message = `Halo Bpk/Ibu ${item.nama_penerima},\n\nBerikut tautan resmi untuk membuat surat keterangan / pengantar RT ${rtProfile.rt_number} / RW ${rtProfile.rw_number}:\n${link}\n\nKode Akses OTP Anda: *${item.otp_code}*\n\nSilakan klik tautan di atas untuk langsung masuk. Terima kasih.\n- Pengurus RT ${rtProfile.rt_number}`

    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`

    window.open(waUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            Kelola Kode Akses Warga (OTP)
          </h3>
          <p className="text-xs text-slate-500">
            Hanya warga yang memiliki kode akses ini yang dapat masuk dan membuat surat keterangan RT.
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition whitespace-nowrap"
            title="Hapus otomatis OTP yang kadaluarsa atau sudah dipakai"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            Bersihkan Kadaluarsa
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Terbitkan Manual
          </button>
        </div>
      </div>

      {/* OTP Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Memuat data OTP...</div>
        ) : otpList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">Belum ada kode OTP yang diterbitkan.</p>
            <p className="text-xs text-slate-400 mt-1">Klik tombol di atas untuk membuat kode akses pertama bagi warga.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kode OTP</th>
                  <th className="px-5 py-3.5">Penerima Warga</th>
                  <th className="px-5 py-3.5">Masa Berlaku</th>
                  <th className="px-5 py-3.5 text-center">Penggunaan</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi & Bagikan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {otpList.map(item => {
                  const isExpired = item.expires_at && new Date(item.expires_at) < new Date()
                  const isActive = item.status === 'active' && !isExpired

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* Kode OTP */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-base font-black text-blue-700 tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {item.otp_code}
                        </span>
                      </td>

                      {/* Penerima */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 text-xs">{item.nama_penerima}</p>
                          {item.catatan?.includes('Mandiri') && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold">
                              Mandiri NIK
                            </span>
                          )}
                        </div>
                        {item.no_hp && <p className="font-mono text-[11px] text-slate-500">{item.no_hp}</p>}
                        {item.nik_terkait && (
                          <p className="font-mono text-[10px] text-blue-600">NIK: {item.nik_terkait}</p>
                        )}
                      </td>

                      {/* Masa Berlaku */}
                      <td className="px-5 py-3.5 text-xs">
                        {item.expires_at ? (
                          <div>
                            <span className={isExpired ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                              {formatTanggalIndo(item.expires_at)}
                            </span>
                            {isExpired && <span className="text-[10px] text-rose-500 block">(Kadaluarsa)</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400">Selamanya (Permanen)</span>
                        )}
                      </td>

                      {/* Penggunaan */}
                      <td className="px-5 py-3.5 text-center text-xs">
                        <span className="font-semibold text-slate-900">{item.used_count || 0}x</span>
                        <span className="text-[11px] text-slate-400 block">
                          {item.max_uses > 0 ? `Maks ${item.max_uses}x` : 'Bebas'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                        ) : item.status === 'revoked' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Dicabut
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {isExpired ? 'Kadaluarsa' : 'Habis Terpakai'}
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => sendWhatsApp(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition"
                            title="Kirim Kode & Link via WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Kirim WA
                          </button>

                          <button
                            onClick={() => copyDirectLink(item.id, item.otp_code)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Salin Tautan Login Langsung"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {isActive && (
                            <button
                              onClick={() => handleRevoke(item.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Cabut / Nonaktifkan OTP"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                Terbitkan Kode Akses OTP Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateOtp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Akses / OTP (6 Digit)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={customOtp}
                    onChange={e => setCustomOtp(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 text-base font-mono font-bold bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomOtp(generateRandomOtp())}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg whitespace-nowrap"
                  >
                    Acak Kode
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan Penerima</label>
                <div className="flex gap-4 mb-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={recipientType === 'warga'}
                      onChange={() => setRecipientType('warga')}
                    />
                    <span>Pilih dari Data Warga ({wargaList.length})</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={recipientType === 'custom'}
                      onChange={() => setRecipientType('custom')}
                    />
                    <span>Input Nama Manual</span>
                  </label>
                </div>

                {recipientType === 'warga' ? (
                  <select
                    value={selectedWargaId}
                    onChange={e => setSelectedWargaId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Nomor WhatsApp (Contoh: 081234567890)"
                      value={customPhone}
                      onChange={e => setCustomPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Masa Berlaku</label>
                  <select
                    value={expiryDays}
                    onChange={e => setExpiryDays(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 Hari (24 Jam)</option>
                    <option value={7}>7 Hari (1 Minggu)</option>
                    <option value={30}>30 Hari (1 Bulan)</option>
                    <option value={0}>Tanpa Batas Waktu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batasan Penggunaan</label>
                  <select
                    value={maxUses}
                    onChange={e => setMaxUses(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Bebas (Berkali-kali)</option>
                    <option value={1}>Sekali Pakai (1x Surat)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
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

