-- =========================================================================
-- SKEMA DATABASE SUPABASE: SISTEM SURAT-MENYURAT RUKUN TETANGGA (RT)
-- Jalankan skrip SQL ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TABEL PROFIL RT & RW
create table if not exists public.rt_profile (
    id uuid primary key default uuid_generate_v4(),
    rt_number varchar(10) not null default '005',
    rw_number varchar(10) not null default '012',
    kelurahan varchar(100) not null default 'Sukamaju',
    kecamatan varchar(100) not null default 'Cilodong',
    kota_kabupaten varchar(100) not null default 'Kota Depok',
    provinsi varchar(100) not null default 'Jawa Barat',
    kode_pos varchar(10) default '16415',
    alamat_sekretariat text default 'Jl. Melati Raya No. 12 RT 005 / RW 012',
    kontak_telepon varchar(30) default '0812-3456-7890',
    email varchar(100) default 'rt005rw012@gmail.com',
    nama_ketua_rt varchar(120) not null default 'Bpk. H. Bambang Sudirman',
    nik_ketua_rt varchar(20) default '3276011204780001',
    nama_sekretaris varchar(120) default 'Ibu Siti Rahmawati, S.Pd',
    nik_sekretaris varchar(20) default '3276015508820002',
    format_nomor_surat text default '{nomor}/RT.{rt}/RW.{rw}/{bulan_romawi}/{tahun}',
    admin_pin varchar(20) default '123456', -- PIN Pengurus RT untuk akses penuh
    logo_url text,
    ttd_digital_url text,
    stempel_url text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABEL DATA WARGA (BUKU INDUK PENDUDUK RT)
create table if not exists public.warga (
    id uuid primary key default uuid_generate_v4(),
    nik varchar(16) not null unique,
    no_kk varchar(16),
    nama_lengkap varchar(150) not null,
    jenis_kelamin varchar(15) not null check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
    tempat_lahir varchar(100) not null,
    tanggal_lahir date not null,
    agama varchar(30) not null default 'Islam',
    status_perkawinan varchar(30) not null default 'Kawin',
    pekerjaan varchar(100) not null default 'Karyawan Swasta',
    kewarganegaraan varchar(10) not null default 'WNI',
    alamat text not null,
    rt varchar(10) default '005',
    rw varchar(10) default '012',
    no_hp varchar(25),
    email varchar(100),
    status_tinggal varchar(25) default 'Tetap' check (status_tinggal in ('Tetap', 'Kontrak / Kost', 'Pindah')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index NIK dan Nama untuk pencarian cepat
create index if not exists idx_warga_nik on public.warga(nik);
create index if not exists idx_warga_nama on public.warga(nama_lengkap);

-- 3. TABEL ARSIP SURAT KETERANGAN / PENGANTAR RT
create table if not exists public.surat (
    id uuid primary key default uuid_generate_v4(),
    nomor_surat varchar(100) not null,
    nomor_urut integer not null,
    tahun integer not null,
    bulan integer not null,
    jenis_surat varchar(50) not null, 
    -- jenis_surat: 'pengantar_umum', 'pengantar_ktp', 'domisili', 'kematian', 'usaha', 'sktm', 'pindah', 'custom'
    judul_surat varchar(150) not null,
    tanggal_surat date not null default current_date,
    pemohon_nik varchar(16) not null,
    pemohon_nama varchar(150) not null,
    pemohon_data jsonb not null default '{}'::jsonb,
    data_khusus jsonb not null default '{}'::jsonb,
    keperluan text not null,
    berlaku_sampai date,
    catatan text,
    status varchar(30) default 'Diterbitkan' check (status in ('Draft', 'Diterbitkan', 'Selesai', 'Dibatalkan')),
    qr_token varchar(64) not null unique,
    signed_by varchar(120),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pencarian surat
create index if not exists idx_surat_nomor on public.surat(nomor_surat);
create index if not exists idx_surat_nik on public.surat(pemohon_nik);
create index if not exists idx_surat_token on public.surat(qr_token);
create index if not exists idx_surat_created_at on public.surat(created_at desc);

-- 4. TABEL COUNTER PENOMORAN SURAT
create table if not exists public.nomor_surat_counter (
    id uuid primary key default uuid_generate_v4(),
    tahun integer not null unique,
    last_number integer not null default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function untuk mendapatkan nomor urut surat otomatis yang aman dari duplikasi
create or replace function public.get_next_nomor_surat(p_tahun integer)
returns integer as $$
declare
    v_next_num integer;
begin
    insert into public.nomor_surat_counter (tahun, last_number, updated_at)
    values (p_tahun, 1, now())
    on conflict (tahun)
    do update set 
        last_number = public.nomor_surat_counter.last_number + 1,
        updated_at = now()
    returning last_number into v_next_num;

    return v_next_num;
end;
$$ language plpgsql;

-- 5. TABEL KODE AKSES / OTP WARGA (PENGAMANAN AKSES PORTAL SURAT)
create table if not exists public.rt_access_otp (
    id uuid primary key default uuid_generate_v4(),
    otp_code varchar(10) not null unique,
    nama_penerima varchar(150) not null,
    no_hp varchar(25),
    nik_terkait varchar(16),
    role varchar(20) not null default 'warga' check (role in ('warga', 'pengurus')),
    status varchar(20) not null default 'active' check (status in ('active', 'used', 'revoked')),
    max_uses integer default 0, -- 0 = unlimited during validity period, 1 = single use
    used_count integer default 0,
    expires_at timestamp with time zone,
    catatan text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_otp_code on public.rt_access_otp(otp_code);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.rt_profile enable row level security;
alter table public.warga enable row level security;
alter table public.surat enable row level security;
alter table public.nomor_surat_counter enable row level security;
alter table public.rt_access_otp enable row level security;

-- Kebijakan Akses:
create policy "Allow all rt_profile" on public.rt_profile for all using (true);
create policy "Allow all warga" on public.warga for all using (true);
create policy "Allow all surat" on public.surat for all using (true);
create policy "Allow all counter" on public.nomor_surat_counter for all using (true);
create policy "Allow all otp" on public.rt_access_otp for all using (true);

-- 7. DATA CONTOH AWAL (SEED DATA)
-- Inisialisasi Profil RT
insert into public.rt_profile (
    id, rt_number, rw_number, kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos,
    alamat_sekretariat, kontak_telepon, email, nama_ketua_rt, nik_ketua_rt,
    nama_sekretaris, nik_sekretaris, admin_pin
) values (
    'a0000000-0000-0000-0000-000000000001',
    '005', '012', 'Sukamaju', 'Cilodong', 'Kota Depok', 'Jawa Barat', '16415',
    'Balai Warga RT 005, Jl. Cempaka Indah No. 45', '0812-3456-7890', 'rt005rw012@gmail.com',
    'Bpk. H. Bambang Sudirman', '3276011204780001',
    'Ibu Siti Rahmawati, S.Pd', '3276015508820002', '123456'
) on conflict (id) do nothing;

-- Inisialisasi Data Warga Contoh
insert into public.warga (
    nik, no_kk, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir,
    agama, status_perkawinan, pekerjaan, kewarganegaraan, alamat, rt, rw, no_hp
) values 
('3276011505920003', '3276010101180001', 'Ahmad Faisal Pratama', 'Laki-laki', 'Jakarta', '1992-05-15', 'Islam', 'Kawin', 'Software Engineer', 'WNI', 'Jl. Cempaka Indah Blok B No. 10', '005', '012', '081298765432'),
('3276016008950004', '3276010101180001', 'Dewi Lestari Handayani', 'Perempuan', 'Bandung', '1995-08-20', 'Islam', 'Kawin', 'Guru Honorer', 'WNI', 'Jl. Cempaka Indah Blok B No. 10', '005', '012', '081345678901'),
('3276010101650005', '3276010202150002', 'Budi Santoso', 'Laki-laki', 'Solo', '1965-01-01', 'Islam', 'Cerai Mati', 'Pensiunan PNS', 'WNI', 'Jl. Cempaka Indah Blok A No. 04', '005', '012', '085611223344'),
('3276014203020006', '3276010202150002', 'Rian Hidayat', 'Laki-laki', 'Depok', '2002-03-02', 'Islam', 'Belum Kawin', 'Mahasiswa', 'WNI', 'Jl. Cempaka Indah Blok A No. 04', '005', '012', '087812349988')
on conflict (nik) do nothing;

-- Inisialisasi Kode OTP Contoh Awal
insert into public.rt_access_otp (
    otp_code, nama_penerima, no_hp, nik_terkait, role, status, max_uses, used_count
) values 
('888999', 'Warga Umum RT 005', '0812-3456-7890', null, 'warga', 'active', 0, 0),
('123456', 'Ahmad Faisal Pratama', '081298765432', '3276011505920003', 'warga', 'active', 0, 0)
on conflict (otp_code) do nothing;
