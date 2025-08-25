# 🆕 First Time Setup - READ THIS FIRST!

## ⚠️ PENTING: File .env Tidak Ada!

Ketika pertama kali clone, file `.env` **TIDAK ADA** karena:

- Berisi data sensitif (API keys, URLs)
- Tidak di-commit ke git untuk keamanan
- Setiap developer harus buat sendiri

## 🔥 Setup Wajib (TIDAK BISA DILEWATI)

### Step 1: Buat file .env

```bash
cp .env.example .env
```

### Step 2: Edit .env dengan data aktual

```bash
nano .env
# atau
code .env
```

**Isi minimal ini:**

```env
EXPO_PUBLIC_NGROK_URL=https://c520ce759f72.ngrok-free.app --> ganti yg benar
EXPO_PUBLIC_GROQ_API_KEY= blabla
```

### Step 3: Verify

```bash
cat .env
# Pastikan ada isi, bukan kosong
```

## 🚨 Jika Tidak Setup .env:

**Error yang akan muncul:**

- ❌ Network request failed
- ❌ 401 Unauthorized
- ❌ Cannot connect to backend
- ❌ Groq API key not configured

**App tidak akan jalan sama sekali!**

## 📞 Kontak untuk Data:

**Ngrok URL (WAJIB):**

- Contact: Backend Developer
- Update setiap restart ngrok

**API Keys (OPTIONAL):**

- Groq: https://console.groq.com/keys
- Atau minta ke tim yang sudah punya

## ✅ Setelah Setup .env:

```bash
npm install
npx expo start
```

**File .env sudah benar jika app bisa login dan load data!**
