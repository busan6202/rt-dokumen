import QRCode from 'qrcode'

// Daftar Nama Bulan Indonesia
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Angka Romawi Bulan untuk Nomor Surat
export const BULAN_ROMAWI = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
]

// Format Tanggal Indonesia (contoh: 14 Oktober 2026)
export const formatTanggalIndo = (dateInput) => {
  if (!dateInput) return '-'
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return dateInput
  const tgl = d.getDate()
  const bln = NAMA_BULAN[d.getMonth()]
  const thn = d.getFullYear()
  return `${tgl} ${bln} ${thn}`
}

// Generate Nomor Surat Otomatis
export const generateNomorSurat = (formatTemplate, nomorUrut, rtNumber, rwNumber, date = new Date()) => {
  const d = new Date(date)
  const padNomor = String(nomorUrut).padStart(3, '0')
  const bulanRomawi = BULAN_ROMAWI[d.getMonth()]
  const tahun = d.getFullYear()

  let result = formatTemplate || '{nomor}/RT.{rt}/RW.{rw}/{bulan_romawi}/{tahun}'
  result = result.replace('{nomor}', padNomor)
  result = result.replace('{rt}', rtNumber || '001')
  result = result.replace('{rw}', rwNumber || '001')
  result = result.replace('{bulan_romawi}', bulanRomawi)
  result = result.replace('{tahun}', tahun)

  return result
}

// Generate Data URL untuk QR Code
export const generateQRCodeDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 160,
      margin: 1,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('QR Code error:', err)
    return ''
  }
}

// Jenis-jenis Surat RT Resmi
export const JENIS_SURAT_CONFIG = [
  {
    id: 'pengantar_umum',
    nama: 'Surat Pengantar RT (Umum)',
    judulDokumen: 'SURAT PENGANTAR',
    kode: 'SP-UMUM',
    deskripsi: 'Untuk berbagai keperluan administrasi warga ke Kelurahan, Polsek (SKCK), KUA, Bank, BPJS, dll.',
    icon: 'FileText',
    color: 'blue',
    defaultKeperluan: 'Permohonan Penerbitan Surat Catatan Kepolisian (SKCK) di Polsek setempat'
  },
  {
    id: 'pengantar_ktp',
    nama: 'Surat Pengantar KTP & KK',
    judulDokumen: 'SURAT PENGANTAR KTP / KARTU KELUARGA',
    kode: 'SP-KTP',
    deskripsi: 'Permohonan pembuatan KTP baru (usia 17 tahun), penggantian KTP rusak/hilang, perbaikan data, atau cetak KK baru.',
    icon: 'CreditCard',
    color: 'indigo',
    defaultKeperluan: 'Permohonan Pembuatan KTP Baru (Pemula 17 Tahun) di Dinas Kependudukan dan Catatan Sipil'
  },
  {
    id: 'domisili',
    nama: 'Surat Keterangan Domisili',
    judulDokumen: 'SURAT KETERANGAN DOMISILI',
    kode: 'SK-DOM',
    deskripsi: 'Menerangkan bahwa pemohon adalah benar berdomisili/bertempat tinggal di wilayah RT setempat.',
    icon: 'Home',
    color: 'emerald',
    defaultKeperluan: 'Kelengkapan berkas administrasi domisili tempat tinggal dan persyaratan kerja'
  },
  {
    id: 'kematian',
    nama: 'Surat Keterangan Kematian',
    judulDokumen: 'SURAT KETERANGAN KEMATIAN',
    kode: 'SK-MATI',
    deskripsi: 'Menerangkan bahwa salah satu warga telah meninggal dunia beserta rincian waktu, tempat, dan pelapor.',
    icon: 'HeartOff',
    color: 'rose',
    defaultKeperluan: 'Pengurusan Akta Kematian di Kelurahan/Disdukcapil dan klaim asuransi/BPJS Ketenagakerjaan'
  },
  {
    id: 'usaha',
    nama: 'Surat Keterangan Usaha (SKU)',
    judulDokumen: 'SURAT KETERANGAN USAHA (SKU)',
    kode: 'SK-USAHA',
    deskripsi: 'Menerangkan bahwa warga menjalankan usaha mikro/kecil tertentu di lingkungan RT.',
    icon: 'Briefcase',
    color: 'amber',
    defaultKeperluan: 'Persyaratan pengajuan Kredit Usaha Rakyat (KUR) / izin usaha mikro kecil'
  },
  {
    id: 'sktm',
    nama: 'Surat Keterangan Tidak Mampu (SKTM)',
    judulDokumen: 'SURAT KETERANGAN TIDAK MAMPU (SKTM)',
    kode: 'SK-TM',
    deskripsi: 'Menerangkan kondisi ekonomi keluarga kurang mampu untuk keperluan beasiswa sekolah, KIP Kuliah, atau BPJS PBI.',
    icon: 'Users',
    color: 'teal',
    defaultKeperluan: 'Permohonan beasiswa pendidikan anak dan keringanan biaya studi di universitas'
  },
  {
    id: 'pindah',
    nama: 'Surat Keterangan Pindah / Datang',
    judulDokumen: 'SURAT PENGANTAR PINDAH WARGA',
    kode: 'SP-PINDAH',
    deskripsi: 'Surat pengantar bagi warga yang hendak pindah tempat tinggal ke luar daerah atau warga baru yang melapor datang.',
    icon: 'Truck',
    color: 'cyan',
    defaultKeperluan: 'Pengurusan Surat Keterangan Pindah Warga Negara Indonesia (SKPWNI) ke alamat baru'
  }
]

// Download array of objects as CSV
export const exportToCSV = (data, filename = 'arsip-surat-rt.csv') => {
  if (!data || !data.length) return
  const headers = Object.keys(data[0])
  const csvRows = []
  csvRows.push(headers.join(','))

  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header]
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val)
      }
      const escaped = ('' + (val ?? '')).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Format nomor WhatsApp standar internasional Indonesia (awalan 62 tanpa 0 di depan)
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '6281254873133'
  let clean = phone.toString().replace(/\D/g, '')
  if (clean.startsWith('620')) {
    clean = '62' + clean.substring(3)
  } else if (clean.startsWith('6181254873133')) {
    clean = '6281254873133'
  } else if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1)
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean
  }
  return clean
}

