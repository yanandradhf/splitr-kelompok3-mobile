# Setup Ngrok - Struktur Sederhana

## Perubahan yang Dilakukan

### ✅ Sebelum (Tersebar di banyak file):
- `constants/config.ts` - Hardcoded ngrok URL
- `utils/imageUtils.ts` - Hardcoded ngrok URL  
- Setiap file perlu diupdate manual

### ✅ Sesudah (Terpusat):
- `config/ngrok.ts` - **SATU tempat untuk semua konfigurasi ngrok**
- File lain import dari sini
- Update sekali, semua berubah

## Cara Update Ngrok URL

**Hanya perlu edit 1 file:**

```typescript
// File: config/ngrok.ts
export const NGROK_URL = "https://NGROK_URL_BARU.ngrok-free.app";
```

## Struktur File

```
splitr-mobile/
├── config/
│   └── ngrok.ts          ← EDIT DISINI SAJA
├── constants/
│   └── config.ts         ← Auto import dari ngrok.ts
├── utils/
│   └── imageUtils.ts     ← Auto import dari ngrok.ts
└── app/
    └── ...               ← Semua komponen otomatis update
```

## Keuntungan

- 🎯 **Simple**: Update 1 file saja
- 🔄 **Konsisten**: Semua komponen sync otomatis  
- 🚀 **Cepat**: Tidak perlu cari-cari file lain
- 🛡️ **Aman**: Tidak ada yang terlewat

## Penggunaan

```typescript
// Untuk image
import { getImageUrl } from '../config/ngrok';
const imageUrl = getImageUrl('/uploads/receipt.jpg');

// Untuk API (otomatis dari config.ts)
import { API_CONFIG } from '../constants/config';
```