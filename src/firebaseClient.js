import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
  runTransaction
} from 'firebase/firestore'

// Fallback Mock Data
const DEFAULT_RT_PROFILE = {
  id: 'profile_main',
  rt_number: '25',
  rw_number: 'IX',
  kelurahan: 'Mentawa Baru Hulu',
  kecamatan: 'Mentawa Baru Ketapang',
  kota_kabupaten: 'Kabupaten Kotawaringin Timur',
  provinsi: 'Kalimantan Tengah',
  kode_pos: '74322',
  alamat_sekretariat: 'Sekretariat RT. 25 / RW. IX',
  kontak_telepon: '0812-5487-3133',
  email: 'rt005rw012@gmail.com',
  nama_ketua_rt: 'Bpk. H. Bambang Sudirman',
  nik_ketua_rt: '3276011204780001',
  nama_sekretaris: 'Ibu Siti Rahmawati, S.Pd',
  nik_sekretaris: '3276015508820002',
  format_nomor_surat: '{nomor}/RT.{rt}/RW.{rw}/{bulan_romawi}/{tahun}',
  admin_pin: '123456',
  logo_url: './logo-daerah.png',
  ttd_digital_url: '',
  stempel_url: '',
  trakteer_url: 'https://trakteer.id/busan6202'
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

const DEFAULT_OTPS = []


// Get Firebase configuration from LocalStorage or Vite Env
export const getFirebaseConfig = () => {
  const localConfigStr = localStorage.getItem('RT_FIREBASE_CONFIG')
  if (localConfigStr) {
    try {
      return JSON.parse(localConfigStr)
    } catch (e) {
      console.error(e)
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  }
}

export const saveFirebaseConfig = (config) => {
  if (config && config.projectId) {
    localStorage.setItem('RT_FIREBASE_CONFIG', JSON.stringify(config))
  } else {
    localStorage.removeItem('RT_FIREBASE_CONFIG')
  }
}

// Get or initialize Firestore
export const getFirestoreDb = () => {
  const config = getFirebaseConfig()
  if (config && config.projectId && config.apiKey) {
    try {
      const app = getApps().length === 0 ? initializeApp(config) : getApp()
      return getFirestore(app)
    } catch (e) {
      console.warn('Firebase initialization error:', e)
    }
  }
  return null
}

export const isFirebaseConfigured = () => {
  const firestore = getFirestoreDb()
  return !!firestore
}

// LocalStorage Persistence Helpers
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

// Session Management
export const getAuthSession = () => getLocalData('RT_AUTH_SESSION', null)
export const setAuthSession = (session) => setLocalData('RT_AUTH_SESSION', session)
export const clearAuthSession = () => localStorage.removeItem('RT_AUTH_SESSION')

// Unified Database Layer (Google Firebase Firestore with seamless LocalStorage fallback)
export const db = {
  // Test Connection
  async testConnection(customConfig) {
    const config = customConfig || getFirebaseConfig()
    if (!config || !config.projectId || !config.apiKey) {
      return {
        success: false,
        message: 'Kredensial Firebase belum lengkap. Mohon isi minimal Project ID dan API Key.'
      }
    }

    try {
      // Inisialisasi isolated app sementara agar selalu menggunakan kredensial terbaru dari form
      const tempAppName = 'test_conn_' + Date.now()
      const testApp = initializeApp(config, tempAppName)
      const testDb = getFirestore(testApp)

      const testRef = doc(testDb, 'rt_profile', 'main')
      await getDoc(testRef)

      return {
        success: true,
        message: 'Berhasil terhubung ke Google Firebase Firestore! Database siap digunakan.'
      }
    } catch (err) {
      console.error('Firebase test error:', err)
      const msg = err.message || ''

      if (err.code === 'permission-denied' || msg.includes('permission-denied') || msg.includes('insufficient permissions')) {
        return {
          success: false,
          code: 'permission-denied',
          message: 'Aturan Keamanan (Rules) Terkunci! Buka Firebase Console > Firestore Database > tab Rules > ubah menjadi allow read, write: if true; lalu klik Publish.'
        }
      }

      if (err.code === 'not-found' || msg.includes('does not exist') || msg.includes('not-found')) {
        return {
          success: false,
          code: 'not-found',
          message: 'Database Firestore belum dibuat! Buka Firebase Console > menu "Firestore Database" > klik tombol "Create database".'
        }
      }

      if (err.code === 'invalid-api-key' || msg.includes('API key') || msg.includes('invalid-api-key')) {
        return {
          success: false,
          code: 'invalid-api-key',
          message: 'API Key tidak valid! Periksa kembali apiKey yang disalin dari Project Settings Firebase Anda.'
        }
      }

      return {
        success: false,
        code: err.code || 'unknown',
        message: `Koneksi gagal (${err.code || 'error'}): ${msg}`
      }
    }
  },

  // Profile RT
  async getProfile() {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        const ref = doc(firestore, 'rt_profile', 'main')
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          if (data.kelurahan === 'Mentawa Baru Hilir') {
            data.kelurahan = 'Mentawa Baru Hulu'
          }
          if (data.rt_number === '025') {
            data.rt_number = '25'
          }
          return data
        }
      } catch (e) {
        console.warn('Fallback to local profile:', e)
      }
    }
    const local = getLocalData('RT_PROFILE', DEFAULT_RT_PROFILE)
    if (local) {
      let changed = false
      if (local.kelurahan === 'Mentawa Baru Hilir') {
        local.kelurahan = 'Mentawa Baru Hulu'
        changed = true
      }
      if (local.rt_number === '025') {
        local.rt_number = '25'
        changed = true
      }
      if (changed) {
        setLocalData('RT_PROFILE', local)
      }
    }
    return local
  },

  async updateProfile(updates) {
    const firestore = getFirestoreDb()
    const current = await this.getProfile()
    const merged = { ...current, ...updates, updated_at: new Date().toISOString() }

    if (firestore) {
      try {
        const ref = doc(firestore, 'rt_profile', 'main')
        await setDoc(ref, merged, { merge: true })
      } catch (e) {
        console.error('Firestore updateProfile error, storing locally:', e)
      }
    }
    setLocalData('RT_PROFILE', merged)
    return merged
  },

  // Auth & OTP Access
  async verifyCode(code) {
    const cleanCode = (code || '').trim()
    if (!cleanCode) {
      return { success: false, message: 'Kode tidak boleh kosong.' }
    }

    const profile = await this.getProfile()

    // 1. Check Admin PIN
    const adminPin = profile.admin_pin || '123456'
    if (cleanCode === adminPin) {
      const adminSession = {
        role: 'pengurus',
        nama: profile.nama_ketua_rt || 'Pengurus RT',
        nik: profile.nik_ketua_rt || '',
        loginAt: new Date().toISOString()
      }
      setAuthSession(adminSession)
      return { success: true, role: 'pengurus', session: adminSession }
    }

    // 2. Check in Firestore OTP collection
    const firestore = getFirestoreDb()
    let otpRecord = null

    if (firestore) {
      try {
        const q = query(collection(firestore, 'rt_access_otp'), where('otp_code', '==', cleanCode))
        const snap = await getDocs(q)
        if (!snap.empty) {
          otpRecord = snap.docs[0].data()
        }
      } catch (e) {
        console.warn('Firestore OTP lookup error:', e)
      }
    }

    if (!otpRecord) {
      const localOtps = getLocalData('RT_OTP_LIST', DEFAULT_OTPS)
      otpRecord = localOtps.find(o => o.otp_code === cleanCode)
    }

    if (!otpRecord) {
      return { success: false, message: 'Kode OTP tidak valid atau belum terdaftar.' }
    }

    if (otpRecord.status !== 'active') {
      return { success: false, message: 'Kode OTP ini sudah tidak aktif atau telah dinonaktifkan oleh Pengurus RT.' }
    }

    if (otpRecord.expires_at && new Date(otpRecord.expires_at) < new Date()) {
      return { success: false, message: 'Kode OTP ini telah melewati batas masa berlaku (kadaluarsa).' }
    }

    // Update usage count
    const newUsedCount = (otpRecord.used_count || 0) + 1
    let newStatus = otpRecord.status
    if (otpRecord.max_uses > 0 && newUsedCount >= otpRecord.max_uses) {
      newStatus = 'used'
    }

    const updatedOtp = { ...otpRecord, used_count: newUsedCount, status: newStatus }

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'rt_access_otp', otpRecord.id), updatedOtp, { merge: true })
      } catch (e) {
        console.error('Failed to update OTP usage in Firestore:', e)
      }
    }
    const localOtps = getLocalData('RT_OTP_LIST', DEFAULT_OTPS)
    setLocalData(
      'RT_OTP_LIST',
      localOtps.map(o => (o.id === otpRecord.id ? updatedOtp : o))
    )

    const wargaSession = {
      role: otpRecord.role || 'warga',
      nama: otpRecord.nama_penerima,
      nik: otpRecord.nik_terkait || null,
      no_hp: otpRecord.no_hp || '',
      otpCode: cleanCode,
      loginAt: new Date().toISOString()
    }
    setAuthSession(wargaSession)
    return { success: true, role: otpRecord.role || 'warga', session: wargaSession }
  },

  async getOTPList() {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'rt_access_otp'))
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data())
          return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
      } catch (e) {
        console.warn('Fallback to local OTPs:', e)
      }
    }
    return getLocalData('RT_OTP_LIST', DEFAULT_OTPS)
  },

  async createOTP(payload) {
    const firestore = getFirestoreDb()
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'otp_' + Date.now()
    const newRecord = {
      id: newId,
      created_at: new Date().toISOString(),
      status: 'active',
      used_count: 0,
      ...payload
    }

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'rt_access_otp', newId), newRecord)
        return newRecord
      } catch (e) {
        console.error('Firestore create OTP error:', e)
      }
    }

    const all = await this.getOTPList()
    const updated = [newRecord, ...all]
    setLocalData('RT_OTP_LIST', updated)
    return newRecord
  },

  async revokeOTP(id) {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'rt_access_otp', id), { status: 'revoked' }, { merge: true })
      } catch (e) {
        console.error('Firestore revoke OTP error:', e)
      }
    }
    const all = await this.getOTPList()
    const updated = all.map(o => (o.id === id ? { ...o, status: 'revoked' } : o))
    setLocalData('RT_OTP_LIST', updated)
    return true
  },

  async deleteOTP(id) {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'rt_access_otp', id))
      } catch (e) {
        console.error('Firestore delete OTP error:', e)
      }
    }
    const all = await this.getOTPList()
    const filtered = all.filter(o => o.id !== id)
    setLocalData('RT_OTP_LIST', filtered)
    return true
  },

  // Permohonan OTP Dinamis Otomatis oleh Warga berdasarkan NIK
  async requestDynamicOtp({ nik, no_hp, nama }) {
    const cleanNik = (nik || '').trim()
    const cleanHp = (no_hp || '').trim()

    if (!cleanNik || cleanNik.length < 16) {
      return { success: false, message: 'Harap masukkan 16 digit NIK sesuai KTP.' }
    }

    // Periksa apakah NIK warga terdaftar di Buku Induk RT
    const wargaList = await this.getWarga()
    const foundWarga = wargaList.find(w => w.nik === cleanNik)

    let recipientName = foundWarga ? foundWarga.nama_lengkap : (nama || '').trim()
    let recipientPhone = cleanHp || (foundWarga ? foundWarga.no_hp : '')

    if (!foundWarga) {
      return {
        success: false,
        notRegistered: true,
        message: 'NIK Anda belum terdaftar di Buku Induk Kependudukan RT setempat. Demi keamanan data warga, silakan hubungi Pengurus RT untuk didaftarkan.'
      }
    }

    // Generate kode unik acak 6 digit
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Masa berlaku: 30 menit (Single-Use sekali pakai)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    const newRecord = await this.createOTP({
      otp_code: generatedCode,
      nama_penerima: recipientName,
      no_hp: recipientPhone,
      nik_terkait: cleanNik,
      role: 'warga',
      status: 'active',
      max_uses: 1, // Sekali pakai
      expires_at: expiresAt,
      catatan: 'Permohonan OTP Mandiri oleh Warga'
    })

    return {
      success: true,
      otp_code: generatedCode,
      nama: recipientName,
      nik: cleanNik,
      expires_at: expiresAt,
      expires_minutes: 30,
      message: 'Kode OTP berhasil dibuat dan aktif selama 30 menit.'
    }
  },

  // Helper to mask email for security display
  maskEmail(email) {
    if (!email || !email.includes('@')) return '***@***.com';
    const [user, domain] = email.split('@');
    const visibleLen = Math.min(2, user.length);
    const maskedUser = user.substring(0, visibleLen) + '***';
    return `${maskedUser}@${domain}`;
  },

  // 1. Request PIN Reset via Registered Admin Email
  async requestPinReset(inputEmail) {
    const cleanEmail = (inputEmail || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Silakan masukkan alamat email terdaftar.' };
    }

    const profile = await this.getProfile();
    const registeredEmail = (profile.email || 'rt005rw012@gmail.com').trim().toLowerCase();

    if (cleanEmail !== registeredEmail) {
      return {
        success: false,
        message: 'Alamat email tidak cocok dengan email resmi Pengurus RT yang terdaftar.'
      };
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const tokenRecord = {
      code: resetCode,
      email: registeredEmail,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };

    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        await setDoc(doc(firestore, 'rt_security', 'pin_reset'), tokenRecord);
      } catch (e) {
        console.warn('Firestore PIN reset token save fallback:', e);
      }
    }
    setLocalData('RT_PIN_RESET_TOKEN', tokenRecord);

    return {
      success: true,
      email: registeredEmail,
      maskedEmail: this.maskEmail(registeredEmail),
      resetCode: resetCode,
      expiresAt: expiresAt,
      message: `Kode verifikasi 6 digit telah diterbitkan untuk ${this.maskEmail(registeredEmail)}.`
    };
  },

  // 2. Verify PIN Reset Code
  async verifyPinReset(inputCode) {
    const cleanCode = (inputCode || '').trim();
    if (!cleanCode || cleanCode.length < 6) {
      return { success: false, message: 'Kode verifikasi harus 6 digit angka.' };
    }

    const firestore = getFirestoreDb();
    let tokenRecord = null;

    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, 'rt_security', 'pin_reset'));
        if (snap.exists()) {
          tokenRecord = snap.data();
        }
      } catch (e) {
        console.warn('Firestore PIN reset lookup fallback:', e);
      }
    }

    if (!tokenRecord) {
      tokenRecord = getLocalData('RT_PIN_RESET_TOKEN', null);
    }

    if (!tokenRecord || !tokenRecord.code) {
      return { success: false, message: 'Tidak ada permohonan reset PIN yang aktif. Silakan ajukan kode baru.' };
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return { success: false, message: 'Kode verifikasi telah kadaluarsa (melebihi 15 menit). Silakan minta kode baru.' };
    }

    if (tokenRecord.code !== cleanCode) {
      return { success: false, message: 'Kode verifikasi yang Anda masukkan tidak sesuai.' };
    }

    return { success: true, message: 'Kode verifikasi valid.' };
  },

  // 3. Confirm & Reset Admin PIN
  async confirmPinReset(verificationCode, newPin) {
    const verifyRes = await this.verifyPinReset(verificationCode);
    if (!verifyRes.success) {
      return verifyRes;
    }

    const cleanPin = (newPin || '').trim();
    if (!cleanPin || cleanPin.length < 4) {
      return { success: false, message: 'PIN baru minimal harus 4 digit/karakter.' };
    }

    await this.updateProfile({ admin_pin: cleanPin });

    const firestore = getFirestoreDb();
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'rt_security', 'pin_reset'));
      } catch (e) {
        console.error('Failed to clear pin reset token in Firestore:', e);
      }
    }
    setLocalData('RT_PIN_RESET_TOKEN', null);

    return {
      success: true,
      newPin: cleanPin,
      message: 'PIN Pengurus RT berhasil diperbarui! Silakan masuk dengan PIN baru Anda.'
    };
  },

  // Bersihkan OTP yang sudah kadaluarsa atau sudah terpakai
  async cleanExpiredOtps() {
    const firestore = getFirestoreDb()
    const all = await this.getOTPList()
    const now = new Date()

    const validOtps = []
    for (const item of all) {
      const isExpired = item.expires_at && new Date(item.expires_at) < now
      const isUsed = item.status === 'used' || item.status === 'revoked'
      if (isExpired || isUsed) {
        if (firestore) {
          try {
            await deleteDoc(doc(firestore, 'rt_access_otp', item.id))
          } catch (e) {
            console.error('Clean expired OTP error:', e)
          }
        }
      } else {
        validOtps.push(item)
      }
    }
    setLocalData('RT_OTP_LIST', validOtps)
    return validOtps
  },

  // Warga CRUD
  async getWarga() {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'warga'))
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data())
          return list.sort((a, b) => (a.nama_lengkap || '').localeCompare(b.nama_lengkap || ''))
        }
      } catch (e) {
        console.warn('Fallback to local warga:', e)
      }
    }
    return getLocalData('RT_WARGA', DEFAULT_WARGA)
  },

  async saveWarga(wargaData) {
    const firestore = getFirestoreDb()
    const all = await this.getWarga()
    const newId = wargaData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'w_' + Date.now())
    const savedRecord = {
      ...wargaData,
      id: newId,
      created_at: wargaData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'warga', newId), savedRecord, { merge: true })
      } catch (e) {
        console.error('Firestore save warga error:', e)
      }
    }

    const existingIndex = all.findIndex(w => w.id === newId)
    if (existingIndex >= 0) {
      all[existingIndex] = savedRecord
    } else {
      all.unshift(savedRecord)
    }
    setLocalData('RT_WARGA', all)
    return savedRecord
  },

  async deleteWarga(id) {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'warga', id))
      } catch (e) {
        console.error('Firestore delete warga error:', e)
      }
    }
    const all = await this.getWarga()
    const filtered = all.filter(w => w.id !== id)
    setLocalData('RT_WARGA', filtered)
    return true
  },

  // Surat Arsip
  async getSuratList() {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, 'surat'))
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data())
          return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
      } catch (e) {
        console.warn('Fallback to local surat:', e)
      }
    }
    return getLocalData('RT_SURAT_LIST', [])
  },

  async getSuratByToken(token) {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        const q = query(collection(firestore, 'surat'), where('qr_token', '==', token))
        const snap = await getDocs(q)
        if (!snap.empty) {
          return snap.docs[0].data()
        }
      } catch (e) {
        console.warn('Firestore fetch by token error:', e)
      }
    }
    const all = getLocalData('RT_SURAT_LIST', [])
    return all.find(s => s.qr_token === token) || null
  },

  async saveSurat(suratData) {
    const firestore = getFirestoreDb()
    const newId = suratData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 's_' + Date.now())
    const newRecord = {
      ...suratData,
      id: newId,
      created_at: suratData.created_at || new Date().toISOString()
    }

    if (firestore) {
      try {
        await setDoc(doc(firestore, 'surat', newId), newRecord, { merge: true })
      } catch (e) {
        console.error('Firestore save surat error:', e)
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
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        await deleteDoc(doc(firestore, 'surat', id))
      } catch (e) {
        console.error('Firestore delete surat error:', e)
      }
    }
    const all = getLocalData('RT_SURAT_LIST', [])
    setLocalData('RT_SURAT_LIST', all.filter(s => s.id !== id))
    return true
  },

  // Auto-Increment Counter for Letter Number
  async getNextNomorSurat(tahun = new Date().getFullYear()) {
    const firestore = getFirestoreDb()
    if (firestore) {
      try {
        const counterRef = doc(firestore, 'counters', `surat_${tahun}`)
        const nextNum = await runTransaction(firestore, async (transaction) => {
          const docSnap = await transaction.get(counterRef)
          let currentNum = 0
          if (docSnap.exists()) {
            currentNum = docSnap.data().last_number || 0
          }
          const incremented = currentNum + 1
          transaction.set(counterRef, { last_number: incremented, tahun }, { merge: true })
          return incremented
        })
        return nextNum
      } catch (e) {
        console.warn('Firestore counter error, using local fallback:', e)
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

