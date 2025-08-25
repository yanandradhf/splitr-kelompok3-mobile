# 🔒 Security Setup - API Keys & Environment Variables

## ❌ **Masalah Sebelumnya:**
- API keys hardcoded di source code
- Ngrok URL tersebar di banyak file
- Tidak ada validasi environment variables
- **SANGAT TIDAK AMAN** untuk production

## ✅ **Solusi Keamanan:**

### 1. **Environment Variables**
```bash
# File: .env (TIDAK di-commit ke git)
EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
EXPO_PUBLIC_GROQ_API_KEY=your-groq-api-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
EXPO_PUBLIC_OCR_SPACE_API_KEY=your-ocr-space-key
```

### 2. **Struktur Keamanan:**
```
config/
├── env.ts           ← Environment helper dengan validasi
├── ngrok.ts         ← Menggunakan ENV.NGROK_URL
├── apiConfig.ts     ← Menggunakan ENV.API_KEYS
└── .env             ← API keys (di .gitignore)
```

### 3. **Validasi Otomatis:**
```typescript
// config/env.ts
export const hasApiKey = (service: string): boolean => !!ENV.API_KEYS[service];
export const getApiKey = (service: string): string => ENV.API_KEYS[service] || '';
```

## 🚀 **Setup Instructions:**

### 1. **Copy Template:**
```bash
cp .env.example .env
```

### 2. **Fill API Keys:**
```bash
# Edit .env file
EXPO_PUBLIC_GROQ_API_KEY=gsk_your_actual_key_here
EXPO_PUBLIC_GEMINI_API_KEY=AIza_your_actual_key_here
```

### 3. **Update Ngrok:**
```bash
# When ngrok restarts, update .env
EXPO_PUBLIC_NGROK_URL=https://new-url.ngrok-free.app
```

## 🛡️ **Security Features:**

### ✅ **Git Safety:**
- `.env` added to `.gitignore`
- Only `.env.example` committed (no real keys)
- API keys never in source code

### ✅ **Runtime Validation:**
- Warning jika API key kosong
- Fallback ke empty string jika tidak ada
- Type-safe access ke environment variables

### ✅ **Easy Management:**
- Satu file `.env` untuk semua keys
- Helper functions untuk akses aman
- Clear error messages jika key hilang

## 📁 **File Structure:**

```
splitr-mobile/
├── .env                 ← API keys (PRIVATE)
├── .env.example         ← Template (PUBLIC)
├── .gitignore           ← Contains .env
└── config/
    ├── env.ts           ← Environment helper
    ├── ngrok.ts         ← Uses ENV.NGROK_URL
    └── apiConfig.ts     ← Uses ENV.API_KEYS
```

## ⚠️ **Important Notes:**

1. **NEVER commit .env** - Already in .gitignore
2. **Share .env.example** - Template for team
3. **Update .env when ngrok restarts** - Only 1 place to change
4. **Use ENV helper** - Type-safe access to variables

## 🎯 **Benefits:**

- ✅ **Secure** - No API keys in source code
- ✅ **Simple** - One .env file to manage
- ✅ **Safe** - Automatic .gitignore protection
- ✅ **Team-friendly** - .env.example template
- ✅ **Production-ready** - Environment-based configuration