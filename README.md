# RakitApp

RakitApp adalah studio digital agent-native untuk mengubah ide aplikasi
pendidikan menjadi brief proyek dan permintaan konsultasi yang siap ditindaklanjuti.

Alur utamanya adalah: ide → pilihan kategori dan fitur → estimasi indikatif →
brief proyek → konsultasi.

## Fitur MVP

- Wizard publik tanpa login untuk menyusun kebutuhan aplikasi.
- Katalog awal EduApp dengan estimasi biaya dan durasi yang bersifat indikatif.
- Brief proyek terstruktur yang bisa dikirim sebagai permintaan konsultasi.
- Dashboard operator untuk meninjau dan memperbarui status lead.
- Agent internal yang memakai action yang sama dengan UI.

## Konfigurasi

Salin `.env.example` menjadi `.env`. Atur `RAKITAPP_OPERATOR_EMAILS` untuk
membatasi akses dashboard operator dan `RAKITAPP_NOTIFICATION_EMAIL` untuk
menerima notifikasi konsultasi.

## Develop locally

Jalankan dari root repository:

```bash
pnpm install
pnpm --filter rakitapp dev
```

Halaman publik ada di `/`, wizard di `/build`, dan dashboard operator di
`/admin`.
