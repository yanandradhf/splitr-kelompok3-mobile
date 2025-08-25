# Optimasi API - Multiple URLs & Calls Fixed

## ❌ Masalah yang Ditemukan:

### 1. **Multiple URLs Tersebar**
- Ngrok URL hardcoded di banyak file
- External API URLs (Groq, Gemini, OCR) tersebar
- Tidak ada sentralisasi konfigurasi

### 2. **Multiple API Calls**
- Rate limiting tidak terpusat
- API keys tersebar di berbagai file
- Redundant API calls tanpa debouncing

### 3. **Struktur Tidak Konsisten**
- Config API di `constants/config.ts`
- Image utils terpisah
- External APIs di `config/apiKeys.ts`

## ✅ Solusi yang Diterapkan:

### 1. **Konfigurasi Terpusat**
```
config/
├── ngrok.ts          ← Ngrok URL saja
├── apiConfig.ts      ← SEMUA API config
└── apiKeys.ts        ← Deprecated (akan dihapus)
```

### 2. **Satu File untuk Semua API**
```typescript
// config/apiConfig.ts
export const API_CONFIG = {
  BASE_URL: NGROK_URL,
  TIMEOUT: 10000,
  HEADERS: { ... }
};

export const ENDPOINTS = {
  LOGIN: "/api/mobile/auth/login",
  // ... semua endpoints
};

export const EXTERNAL_APIS = {
  GROQ: { URL, KEY, MODEL, RATE_LIMIT },
  GEMINI: { URL, KEY },
  OCR_SPACE: { URL, KEY }
};
```

### 3. **Rate Limiting Terpusat**
```typescript
export const checkRateLimit = (service: string, minInterval: number): Promise<void>
```

## 🎯 Keuntungan:

### ✅ **Simple & Terpusat**
- Update ngrok: edit 1 file (`config/ngrok.ts`)
- Update API config: edit 1 file (`config/apiConfig.ts`)
- Semua external APIs di satu tempat

### ✅ **No More Multiple Calls**
- Rate limiting otomatis untuk semua external APIs
- Debouncing sudah ada di `useApi.ts` hooks
- Consistent API calls

### ✅ **Mudah Maintenance**
- Satu tempat untuk semua konfigurasi
- Type-safe dengan TypeScript
- Helper functions untuk URL building

## 📁 File yang Diubah:

1. **`config/ngrok.ts`** - Ngrok URL terpusat
2. **`config/apiConfig.ts`** - Semua API config (NEW)
3. **`constants/config.ts`** - Re-export dari apiConfig
4. **`services/api.ts`** - Menggunakan config terpusat
5. **`services/billApi.ts`** - Menggunakan endpoints terpusat
6. **`utils/imageUtils.ts`** - Re-export dari ngrok config
7. **`app/create-bill/scan-bill/fixedGroqService.ts`** - Menggunakan external API config

## 🚀 Cara Update:

### Update Ngrok URL:
```typescript
// File: config/ngrok.ts
export const NGROK_URL = "https://NEW_URL.ngrok-free.app";
```

### Update External API:
```typescript
// File: config/apiConfig.ts
export const EXTERNAL_APIS = {
  GROQ: {
    URL: 'https://api.groq.com/openai/v1/chat/completions',
    KEY: 'NEW_API_KEY',
    // ...
  }
};
```

## ✨ Hasil:

- ✅ **No multiple URLs** - Semua terpusat
- ✅ **No redundant API calls** - Rate limiting otomatis
- ✅ **Simple structure** - 1 file untuk update
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Easy maintenance** - Consistent & clean