# Perbaikan UI - Konsistensi Header dan Tombol

## Masalah yang Diperbaiki

1. **Tombol Back Terlalu Pinggir**: Tombol back di halaman pembayaran memiliki padding yang terlalu kecil (4px) sehingga sulit ditekan
2. **Inkonsistensi Tema**: Beberapa halaman tidak menggunakan tema global yang sudah didefinisikan
3. **Inkonsistensi Header**: Berbagai halaman memiliki style header yang berbeda-beda

## Perbaikan yang Dilakukan

### 1. Halaman Pembayaran (`/monitoring/transaction/pembayaran/index.tsx`)
- ✅ Mengubah padding tombol back dari 4px menjadi 8px (sesuai standar)
- ✅ Menerapkan tema global dari `constants/theme.ts`
- ✅ Menggunakan `COLORS.textPrimary` untuk warna ikon
- ✅ Menggunakan `FONTS.bold` untuk judul header
- ✅ Menggunakan `SPACING.lg` untuk padding konsisten
- ✅ Menggunakan `COLORS.teal` untuk tombol utama

### 2. Halaman Pilih Tanggal (`/monitoring/transaction/bayarNanti/pilih-tanggal.tsx`)
- ✅ Mengubah ikon dari `chevron-back` menjadi `arrow-back` untuk konsistensi
- ✅ Memperbaiki padding dan ukuran font header
- ✅ Menyelaraskan dengan pola header standar

### 3. Komponen Header Baru (`/components/ui/Header.tsx`)
- ✅ Membuat komponen header yang dapat digunakan kembali
- ✅ Menggunakan tema global secara konsisten
- ✅ Mendukung kustomisasi dengan props
- ✅ Padding tombol back yang konsisten (8px)

## Standar Header yang Diterapkan

```typescript
const headerStyles = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: SPACING.lg, // 24px
  paddingVertical: 16,
  backButton: {
    padding: 8, // Minimal 8px untuk area sentuh yang nyaman
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40, // Untuk menjaga keseimbangan layout
  }
}
```

## Halaman yang Sudah Konsisten

- ✅ Notifications (`/modals/notifications.tsx`)
- ✅ PIN Screen (`/monitoring/transaction/pembayaran/pin.tsx`)
- ✅ Rincian Screen (`/monitoring/transaction/pembayaran/rincian.tsx`)
- ✅ Berhasil Screen (`/monitoring/transaction/pembayaran/berhasil.tsx`)
- ✅ Pilih Tanggal Screen (`/monitoring/transaction/bayarNanti/pilih-tanggal.tsx`)
- ✅ Pembayaran Screen (`/monitoring/transaction/pembayaran/index.tsx`)

## Cara Menggunakan Komponen Header Baru

```typescript
import Header from '../../components/ui/Header';

// Penggunaan dasar
<Header title="Judul Halaman" />

// Dengan kustomisasi
<Header 
  title="Judul Halaman"
  backgroundColor={COLORS.white}
  onBackPress={() => console.log('Custom back action')}
  rightComponent={<TouchableOpacity><Text>Action</Text></TouchableOpacity>}
/>
```

## Rekomendasi Selanjutnya

1. Gunakan komponen `Header` baru untuk halaman-halaman lain yang belum konsisten
2. Pastikan semua tombol menggunakan minimal padding 8px untuk area sentuh yang nyaman
3. Selalu gunakan tema global dari `constants/theme.ts`
4. Ikuti pola spacing yang sudah didefinisikan di `SPACING` constant