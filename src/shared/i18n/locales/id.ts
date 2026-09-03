/**
 * Bahasa Indonesia (default) UI-chrome messages. Fallback target for English.
 * Curated-content strings come from the API (data-model `JSONB{id,en}`), not here.
 */
export default {
  app: {
    name: 'hikingfo',
    tagline: 'Pusat informasi gunung Indonesia',
  },
  nav: {
    mountains: 'Gunung',
    journeys: 'Laporan Pendakian',
    partners: 'Cari Teman',
    admin: 'Admin',
  },
  lang: {
    toggle: 'Bahasa',
    id: 'Indonesia',
    en: 'English',
  },
  auth: {
    login: 'Masuk',
    register: 'Daftar',
    logout: 'Keluar',
    email: 'Email',
    password: 'Kata sandi',
    displayName: 'Nama tampilan',
    forgotPassword: 'Lupa kata sandi?',
    google: 'Masuk dengan Google',
  },
  common: {
    loading: 'Memuat…',
    error: 'Terjadi kesalahan',
    retry: 'Coba lagi',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Sunting',
    close: 'Tutup',
    search: 'Cari',
    empty: 'Belum ada data',
    back: 'Kembali',
    source: 'Sumber',
    lastUpdated: 'Terakhir diperbarui',
    notYetAvailable: 'Belum tersedia',
    viewAll: 'Lihat semua',
    readMore: 'Baca selengkapnya',
  },
  notFound: {
    title: 'Halaman tidak ditemukan',
    body: 'Halaman yang Anda cari tidak ada atau telah dipindahkan.',
  },
} as const
