import { createClient } from '@supabase/supabase-js'

// Initial fallback mock data
const DEFAULT_RT_PROFILE = {
  id: 'a0000000-0000-0000-0000-000000000001',
  rt_number: '005',
  rw_number: '012',
  kelurahan: 'Sukamaju',
  kecamatan: 'Cilodong',
  kota_kabupaten: 'Kota Depok',
  provinsi: 'Jawa Barat',
  kode_pos: '16415',
  alamat_sekretariat: 'Balai Warga RT 005, Jl. Cempaka Indah No. 45',
  kontak_telepon: '0812-3456-7890',
  email: 'rt005rw012@gmail.com',
  nama_ketua_rt: 'Bpk. H. Bambang Sudirman',
  nik_ketua_rt: '3276011204780001',
  nama_sekretaris: 'Ibu Siti Rahmawati, S.Pd',
  nik_sekretaris: '3276015508820002',
  format_nomor_surat: '{nomor}/RT.{rt}/RW.{rw}/{bulan_romawi}/{tahun}',
  logo_url: '',
  ttd_digital_url: '',
  stempel_url: ''
}

const DEFAULT_WARGA = [
  {
    id: 'w1',
    nik: '3276011505920003',
    no_kk: '3276010101180001',
    nama_lengkap: 'Ahmad Faisal Pratama',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1992-05-15',
    agama: 'Islam',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Software Engineer',
    kewarganegaraan: 'WNI',
    alamat: 'Jl. Cempaka Indah Blok B No. 10',
    rt: '005',
    rw: '012',
    no_hp: '081298765432',
    email: 'ahmad.faisal@example.com',
    status_tinggal: 'Tetap'
  },
  {
    id: 'w2',
    nik: '3276016008950004',
    no_kk: '3276010101180001',
    nama_lengkap: 'Dewi Lestari Handayani',
    jenis_kelamin: 'Perempuan',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1995-08-20',
    agama: 'Islam',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Guru Honorer',
    kewarganegaraan: 'WNI',
    alamat: 'Jl. Cempaka Indah Blok B No. 10',
    rt: '005',
    rw: '012',
    no_hp: '081345678901',
    email: 'dewi.lestari@example.com',
    status_tinggal: 'Tetap'
  },
  {
    id: 'w3',
    nik: '3276010101650005',
    no_kk: '3276010202150002',
    nama_lengkap: 'Budi Santoso',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Solo',
    tanggal_lahir: '1965-01-01',
    agama: 'Islam',
    status_perkawinan: 'Cerai Mati',
    pekerjaan: 'Pensiunan PNS',
    kewarganegaraan: 'WNI',
    alamat: 'Jl. Cempaka Indah Blok A No. 04',
    rt: '005',
    rw: '012',
    no_hp: '085611223344',
    email: 'budi.santoso@example.com',
    status_tinggal: 'Tetap'
  },
  {
    id: 'w4',
    nik: '3276014203020006',
    no_kk: '3276010202150002',
    nama_lengkap: 'Rian Hidayat',
    jenis_kelamin: 'Laki-laki',
    tempat_lahir: 'Depok',
    tanggal_lahir: '2002-03-02',
    agama: 'Islam',
    status_perkawinan: 'Belum Kawin',
    pekerjaan: 'Mahasiswa',
    kewarganegaraan: 'WNI',
    alamat: 'Jl. Cempaka Indah Blok A No. 04',
    rt: '005',
    rw: '012',
    no_hp: '087812349988',
    email: 'rian.hidayat@example.com',
    status_tinggal: 'Tetap'
  }
]

// Get config from localStorage or Vite env
export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('RT_SUPABASE_URL')
  const localKey = localStorage.getItem('RT_SUPABASE_ANON_KEY')
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  return {
    url: localUrl || envUrl || '',
    anonKey: localKey || envKey || ''
  }
}

export const saveSupabaseConfig = (url, anonKey) => {
  if (url) localStorage.setItem('RT_SUPABASE_URL', url.trim())
  else localStorage.removeItem('RT_SUPABASE_URL')

  if (anonKey) localStorage.setItem('RT_SUPABASE_ANON_KEY', anonKey.trim())
  else localStorage.removeItem('RT_SUPABASE_ANON_KEY')
}

// Create Supabase Client instance if credentials are valid
export const getSupabaseClient = () => {
  const { url, anonKey } = getSupabaseConfig()
  if (url && anonKey && url.startsWith('http')) {
    try {
      return createClient(url, anonKey)
    } catch (e) {
      console.warn('Failed to init Supabase client:', e)
    }
  }
  return null
}

export const isSupabaseConfigured = () => {
  const client = getSupabaseClient()
  return !!client
}

// Helper LocalStorage persistence
const getLocalData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

const setLocalData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('LocalStorage write error:', e)
  }
}

// Unified Database Access Layer (Supabase with seamless LocalStorage fallback)
export const db = {
  // Test connection
  async testConnection() {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, message: 'URL atau Anon Key Supabase belum diisi.' }
    }
    try {
      const { data, error } = await client.from('rt_profile').select('id').limit(1)
      if (error) {
        return { success: false, message: `Koneksi gagal: ${error.message}` }
      }
      return { success: true, message: 'Terhubung ke Supabase dengan sukses!' }
    } catch (err) {
      return { success: false, message: `Gagal terhubung: ${err.message}` }
    }
  },

  // Profile RT
  async getProfile() {
    const client = getSupabaseClient()
    if (client) {
      try {
        const { data, error } = await client.from('rt_profile').select('*').limit(1).single()
        if (!error && data) return data
      } catch (e) {
        console.warn('Fallback to local profile:', e)
      }
    }
    return getLocalData('RT_PROFILE', DEFAULT_RT_PROFILE)
  },

  async updateProfile(updates) {
    const client = getSupabaseClient()
    const current = await this.getProfile()
    const merged = { ...current, ...updates, updated_at: new Date().toISOString() }

    if (client) {
      try {
        const { error } = await client.from('rt_profile').upsert(merged)
        if (error) throw error
      } catch (e) {
        console.error('Supabase updateProfile error, storing locally:', e)
      }
    }
    setLocalData('RT_PROFILE', merged)
    return merged
  },

  // Warga CRUD
  async getWarga() {
    const client = getSupabaseClient()
    if (client) {
      try {
        const { data, error } = await client.from('warga').select('*').order('nama_lengkap', { ascending: true })
        if (!error && data) return data
      } catch (e) {
        console.warn('Fallback to local warga:', e)
      }
    }
    return getLocalData('RT_WARGA', DEFAULT_WARGA)
  },

  async saveWarga(wargaData) {
    const client = getSupabaseClient()
    const all = await this.getWarga()
    let savedRecord = null

    if (wargaData.id && all.some(w => w.id === wargaData.id)) {
      // Update
      savedRecord = { ...wargaData, updated_at: new Date().toISOString() }
      if (client) {
        try {
          const { data, error } = await client.from('warga').update(savedRecord).eq('id', wargaData.id).select().single()
          if (!error && data) savedRecord = data
        } catch (e) {
          console.error('Supabase update warga error:', e)
        }
      }
      const updated = all.map(w => (w.id === wargaData.id ? savedRecord : w))
      setLocalData('RT_WARGA', updated)
    } else {
      // Create
      const newId = wargaData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'w_' + Date.now())
      savedRecord = { ...wargaData, id: newId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      if (client) {
        try {
          const { data, error } = await client.from('warga').insert(savedRecord).select().single()
          if (!error && data) savedRecord = data
        } catch (e) {
          console.error('Supabase insert warga error:', e)
        }
      }
      setLocalData('RT_WARGA', [savedRecord, ...all])
    }
    return savedRecord
  },

  async deleteWarga(id) {
    const client = getSupabaseClient()
    if (client) {
      try {
        await client.from('warga').delete().eq('id', id)
      } catch (e) {
        console.error('Supabase delete warga error:', e)
      }
    }
    const all = await this.getWarga()
    const filtered = all.filter(w => w.id !== id)
    setLocalData('RT_WARGA', filtered)
    return true
  },

  // Surat Arsip
  async getSuratList() {
    const client = getSupabaseClient()
    if (client) {
      try {
        const { data, error } = await client.from('surat').select('*').order('created_at', { ascending: false })
        if (!error && data) return data
      } catch (e) {
        console.warn('Fallback to local surat:', e)
      }
    }
    return getLocalData('RT_SURAT_LIST', [])
  },

  async getSuratByToken(token) {
    const client = getSupabaseClient()
    if (client) {
      try {
        const { data, error } = await client.from('surat').select('*').eq('qr_token', token).single()
        if (!error && data) return data
      } catch (e) {
        console.warn('Supabase fetch by token failed, checking local:', e)
      }
    }
    const all = getLocalData('RT_SURAT_LIST', [])
    return all.find(s => s.qr_token === token) || null
  },

  async saveSurat(suratData) {
    const client = getSupabaseClient()
    const newId = suratData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 's_' + Date.now())
    const newRecord = {
      ...suratData,
      id: newId,
      created_at: suratData.created_at || new Date().toISOString()
    }

    if (client) {
      try {
        const { data, error } = await client.from('surat').upsert(newRecord).select().single()
        if (!error && data) return data
      } catch (e) {
        console.error('Supabase save surat error:', e)
      }
    }

    const all = getLocalData('RT_SURAT_LIST', [])
    const existsIndex = all.findIndex(s => s.id === newRecord.id)
    if (existsIndex >= 0) {
      all[existsIndex] = newRecord
    } else {
      all.unshift(newRecord)
    }
    setLocalData('RT_SURAT_LIST', all)
    return newRecord
  },

  async deleteSurat(id) {
    const client = getSupabaseClient()
    if (client) {
      try {
        await client.from('surat').delete().eq('id', id)
      } catch (e) {
        console.error('Supabase delete surat error:', e)
      }
    }
    const all = getLocalData('RT_SURAT_LIST', [])
    setLocalData('RT_SURAT_LIST', all.filter(s => s.id !== id))
    return true
  },

  // Nomor Urut Surat
  async getNextNomorSurat(tahun = new Date().getFullYear()) {
    const client = getSupabaseClient()
    if (client) {
      try {
        const { data, error } = await client.rpc('get_next_nomor_surat', { p_tahun: tahun })
        if (!error && typeof data === 'number') {
          return data
        }
      } catch (e) {
        console.warn('RPC get_next_nomor_surat fallback:', e)
      }
    }

    // LocalStorage counter
    const counterKey = `RT_NOMOR_COUNTER_${tahun}`
    const lastNum = parseInt(localStorage.getItem(counterKey) || '0', 10)
    const nextNum = lastNum + 1
    localStorage.setItem(counterKey, nextNum.toString())
    return nextNum
  }
}

