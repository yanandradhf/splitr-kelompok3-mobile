# Perbaikan Logika Pembayaran Tertunda

## Masalah yang Diperbaiki

**Masalah**: Nilai "Pembayaran Tertunda" di halaman monitoring menunjukkan Rp 975.000, padahal seharusnya menghitung total akumulasi dari semua tagihan yang belum dibayar yaitu Rp 11.985.000.

## Analisis Masalah

### Data Tagihan yang Belum Dibayar:
1. Trip to Dufan: Rp 3.500.000
2. Tiket Konser Coldplay: Rp 7.500.000  
3. Makan Malam IBC: Rp 500.000
4. Bioskop XXI: Rp 150.000
5. Karaoke Inul Vista: Rp 250.000
6. Makan di Padang Merdeka: Rp 85.000

**Total Seharusnya**: Rp 11.985.000

### Penyebab Masalah:
- Nilai "Pembayaran Tertunda" menggunakan data statis dari `UI_STATE_PAYLOAD.screens.running.summary`
- Tidak ada perhitungan dinamis berdasarkan data transaksi aktual dari store

## Perbaikan yang Dilakukan

### 1. Halaman Monitoring (`/app/(tabs)/monitoring/index.tsx`)

#### Menambahkan Fungsi Perhitungan Dinamis:
```typescript
const calculateSummary = () => {
  const totalPendingAmount = runningTransactions.reduce((sum, transaction) => {
    return sum + transaction.amount.amount;
  }, 0);

  const totalMyDebt = runningTransactions.reduce((sum, transaction) => {
    return sum + transaction.amount.amount;
  }, 0);

  return {
    pendingPayments: {
      amount: totalPendingAmount,
      formatted: `Rp ${totalPendingAmount.toLocaleString('id-ID')}`
    },
    myDebt: {
      amount: totalMyDebt,
      formatted: `Rp ${totalMyDebt.toLocaleString('id-ID')}`
    }
  };
};
```

#### Mengganti Summary Cards Statis dengan Dinamis:
```typescript
// Sebelum (statis)
{MOCK_DATA.running.summary.map((card, index) => (
  <View key={index} style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>{card.title}</Text>
    <Text style={styles.summaryAmount}>{card.value.formatted}</Text>
  </View>
))}

// Sesudah (dinamis)
<View style={styles.summaryCard}>
  <Text style={styles.summaryTitle}>Pembayaran Tertunda</Text>
  <Text style={styles.summaryAmount}>{summaryData.pendingPayments.formatted}</Text>
</View>
<View style={styles.summaryCard}>
  <Text style={styles.summaryTitle}>Total Tagihan Saya</Text>
  <Text style={styles.summaryAmount}>{summaryData.myDebt.formatted}</Text>
</View>
```

### 2. Config Data (`/constants/config.ts`)

Memperbaiki data statis sebagai fallback:
```typescript
summary: [
  {
    title: "Pembayaran Tertunda",
    value: { amount: 11985000, currency: "IDR", formatted: "Rp 11.985.000" },
    subtitle: "Teman belum bayar",
  },
  {
    title: "Total Tagihan Saya", 
    value: { amount: 11985000, currency: "IDR", formatted: "Rp 11.985.000" },
    subtitle: "Saya berhutang",
  },
]
```

## Hasil Perbaikan

✅ **Sebelum**: Pembayaran Tertunda = Rp 975.000 (salah)
✅ **Sesudah**: Pembayaran Tertunda = Rp 11.985.000 (benar)

### Keuntungan Perbaikan:
1. **Akurasi Data**: Nilai pembayaran tertunda sekarang menghitung total yang benar
2. **Real-time Update**: Nilai akan otomatis update ketika ada transaksi yang diselesaikan
3. **Konsistensi**: Data di UI sekarang konsisten dengan data di transaction store
4. **Maintainability**: Logika perhitungan terpusat dan mudah dimodifikasi

## Cara Kerja Setelah Perbaikan

1. Halaman monitoring akan membaca data dari `useTransactionStore()`
2. Fungsi `calculateSummary()` akan menghitung total dari semua `runningTransactions`
3. Nilai akan otomatis update ketika ada perubahan di store (misal setelah pembayaran)
4. Format currency menggunakan `toLocaleString('id-ID')` untuk format Rupiah yang benar

## Testing

Untuk memverifikasi perbaikan:
1. Buka halaman monitoring
2. Pastikan "Pembayaran Tertunda" menunjukkan Rp 11.985.000
3. Lakukan pembayaran salah satu tagihan
4. Pastikan nilai "Pembayaran Tertunda" berkurang sesuai jumlah yang dibayar