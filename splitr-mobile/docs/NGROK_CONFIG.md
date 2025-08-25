# Konfigurasi Ngrok Terpusat

## Struktur Baru

Semua konfigurasi ngrok sekarang terpusat di satu file: `config/ngrok.ts`

### File yang Diubah:
- `config/ngrok.ts` - Konfigurasi utama ngrok
- `constants/config.ts` - Menggunakan NGROK_URL dari config terpusat
- `utils/imageUtils.ts` - Re-export dari config terpusat

### Cara Update URL Ngrok:
1. Buka file `config/ngrok.ts`
2. Update nilai `NGROK_URL` dengan URL ngrok baru
3. Semua komponen akan otomatis menggunakan URL baru

### Keuntungan:
- ✅ Satu tempat untuk update URL ngrok
- ✅ Tidak perlu update di banyak file
- ✅ Konsistensi di seluruh aplikasi
- ✅ Mudah maintenance

### Penggunaan:
```typescript
import { getImageUrl, NGROK_URL } from '../config/ngrok';

// Untuk image
const imageUrl = getImageUrl('/uploads/receipt.jpg');

// Untuk API base URL (sudah otomatis di config.ts)
```