# RakitApp

RakitApp adalah studio digital agent-native untuk mengubah ide aplikasi
pendidikan menjadi brief proyek dan permintaan konsultasi yang siap ditindaklanjuti.

Alur utamanya adalah: ide → pilihan kategori dan fitur → estimasi indikatif →
brief proyek → konsultasi.

## Fitur MVP

- Wizard publik tanpa login untuk menyusun kebutuhan aplikasi.
- Katalog awal EduApp dengan estimasi biaya dan durasi yang bersifat indikatif.
- Brief proyek terstruktur yang bisa dikirim sebagai permintaan konsultasi.
- Prototype bisa dibuka kembali melalui tautan yang disalin atau akun klien.
- Halaman “Prototype Saya” untuk klien yang memilih menyimpan dengan Google.
- Dashboard operator untuk meninjau dan memperbarui status lead.
- Agent internal yang memakai action yang sama dengan UI.

## Konfigurasi

Salin `.env.example` menjadi `.env`. Atur `RAKITAPP_OPERATOR_EMAILS` untuk
membatasi akses dashboard operator dan `RAKITAPP_NOTIFICATION_EMAIL` untuk
menerima notifikasi konsultasi. Google OAuth bersifat opsional: isi
`GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` pada environment production agar
tombol Google tersedia di halaman sign-in. Nilai rahasia hanya disimpan pada
environment deployment dan tidak dimasukkan ke repository.

## Develop locally

Jalankan dari root repository:

```bash
pnpm install
pnpm --filter rakitapp dev
```

Halaman publik ada di `/`, wizard di `/build`, dan dashboard operator di
`/admin`. Setelah request prototype dibuat, tautannya tetap dapat dibuka tanpa
login. Klien dapat menyalin tautan atau memilih menyimpannya ke akun; prototype
yang tersimpan tersedia di `/my-prototypes` setelah login.
