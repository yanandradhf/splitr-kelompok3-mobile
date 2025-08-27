# Splitr Mobile App - Setup Guide

## 🚀 Quick Setup (5 menit)

### 1. Clone & Install
```bash
git clone <repository-url>
cd splitr-kelompok3-mobile/splitr-mobile
npm install
```

### 2. ⚠️ WAJIB: Setup Environment File
File `.env` tidak ada di git (untuk keamanan). Buat manual:

```bash
# Copy template
cp .env.example .env
```

**Edit file `.env` dan isi:**
```env
# Ngrok URL - WAJIB (minta ke developer backend)
EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app

# API Keys - OPTIONAL (untuk scan receipt)
EXPO_PUBLIC_GROQ_API_KEY=your-groq-key-here
```

### 3. Run App
```bash
npx expo start
```

## 📋 Yang Perlu Diminta ke Tim:

### WAJIB (App tidak jalan tanpa ini):
- **Ngrok URL** dari backend developer
  - Format: `https://xxxxx.ngrok-free.app`
  - Berubah setiap restart ngrok

### OPTIONAL (Untuk fitur scan receipt):
- **Groq API Key** dari https://console.groq.com/keys

## 🔧 Troubleshooting

### Error: "Network request failed" / 401
```bash
# Periksa ngrok URL di .env
cat .env | grep NGROK_URL

# Update dengan URL terbaru dari backend
```

### Error: "Module not found"
```bash
rm -rf node_modules
npm install
```

### Cache issues
```bash
npx expo start --clear
```

## 📁 File Structure
```
splitr-mobile/
├── .env                 # ❌ TIDAK ADA (buat manual)
├── .env.example         # ✅ Template
├── app/                 # Screens
├── config/              # API config
└── services/            # API calls
```

## 🔒 Security Notes
- File `.env` tidak di-commit ke git
- Setiap developer punya `.env` sendiri
- Jangan share API keys di chat/email

## ✅ Checklist Setup
- [ ] Clone repo
- [ ] `npm install`
- [ ] Copy `.env.example` ke `.env`
- [ ] Isi `EXPO_PUBLIC_NGROK_URL`
- [ ] `npx expo start`
- [ ] Scan QR code dengan Expo Go

**Need help?** Contact backend developer untuk ngrok URL terbaru.