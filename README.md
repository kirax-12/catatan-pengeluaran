# Catatan Pengeluaran

Aplikasi web sederhana untuk mencatat pemasukan dan pengeluaran harian, dibuat oleh [Remike Dev](https://github.com/kirax-12).

Tidak perlu server, akun, atau database — semua data tersimpan di browser pengguna (localStorage).

## Fitur

- Tambah transaksi: nama, jumlah, tanggal, jenis (pemasukan/pengeluaran), dan kategori
- Ringkasan otomatis: saldo, total pemasukan, total pengeluaran
- Riwayat transaksi dengan filter per kategori dan tombol hapus
- Ringkasan pengeluaran per kategori dalam bentuk bar chart sederhana
- Format mata uang Rupiah (id-ID) dan tanggal Bahasa Indonesia
- Responsif: nyaman dipakai di HP maupun desktop

## Cara menjalankan

Buka `index.html` langsung di browser, atau jalankan server statis:

```bash
npx serve .
```

## Teknologi

HTML · CSS · JavaScript murni, tanpa framework dan tanpa build step.

## Lisensi

MIT
