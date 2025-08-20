# Registration API Integration Guide

## Overview
Implementasi lengkap untuk flow registrasi 5 langkah dengan integrasi API menggunakan Zustand untuk state management.

## Flow Registrasi

### Step 1: Validasi Rekening BNI (20%)
- **Screen**: `app/(auth)/register/index.tsx`
- **API**: `POST /api/mobile/auth/validate-bni`
- **Data**: `{ namaRekening, nomorRekening }`
- **Validasi**: Nomor rekening 10 digit, nama hanya huruf
- **Store**: Menyimpan `nomorRekening`, `namaRekening`, `phone`, `branchCode`

### Step 2: Kirim OTP ke Email (40%)
- **Screen**: `app/(auth)/register/regist_email.tsx`
- **API**: `POST /api/mobile/auth/send-otp`
- **Data**: `{ email }`
- **Validasi**: Format email valid (Gmail)
- **Store**: Menyimpan `email`

### Step 3: Verifikasi OTP (60%)
- **Screen**: `app/(auth)/register/regist_otp.tsx`
- **API**: `POST /api/mobile/auth/verify-otp`
- **Data**: `{ email, otp }`
- **Features**: Timer 60 detik, resend OTP
- **Store**: Menyimpan `tempToken` ke SecureStore

### Step 4: Buat Username & Password (80%)
- **Screen**: `app/(auth)/register/regist_username.tsx`
- **Validasi**: Username min 3 karakter, password min 8 karakter
- **Store**: Menyimpan `username`, `password`

### Step 5: Set PIN & Complete Registration (100%)
- **Screen**: `app/(auth)/register/regist_set-pin.tsx`
- **API**: `POST /api/mobile/auth/register`
- **Data**: Semua data yang dikumpulkan dari step 1-5
- **Action**: Clear temporary data, redirect ke login

## Files Created/Modified

### New Files:
1. `services/register.api.ts` - API service functions
2. `store/register.store.ts` - Zustand store untuk data registrasi
3. `utils/errorHandler.ts` - Consistent error handling
4. `components/ui/RegistrationProgress.tsx` - Progress indicator

### Modified Files:
1. `app/(auth)/register/index.tsx` - Step 1 dengan validasi BNI
2. `app/(auth)/register/regist_email.tsx` - Step 2 dengan send OTP
3. `app/(auth)/register/regist_otp.tsx` - Step 3 dengan verify OTP + timer
4. `app/(auth)/register/regist_username.tsx` - Step 4 dengan data storage
5. `app/(auth)/register/regist_set-pin.tsx` - Step 5 dengan complete registration
6. `constants/config.ts` - Added new API endpoints

## Key Features

### State Management
- Menggunakan Zustand untuk menyimpan data registrasi sementara
- Data dibersihkan setelah registrasi berhasil
- TempToken disimpan di SecureStore untuk keamanan

### Error Handling
- Consistent error handling dengan `utils/errorHandler.ts`
- Network error detection
- User-friendly error messages

### Loading States
- Loading indicators pada semua API calls
- Disabled buttons saat loading
- ActivityIndicator untuk visual feedback

### Validation
- Real-time validation pada semua input
- Format validation (email, phone, rekening)
- Password strength validation

### Security
- TempToken disimpan di SecureStore
- Data sensitif tidak disimpan di plain text
- Automatic cleanup setelah registrasi

## Usage

### Import Store
```typescript
import { useRegisterStore } from '../../../store/register.store';
```

### Use in Component
```typescript
const { 
  validateBni, 
  sendOtp, 
  verifyOtp, 
  completeRegister,
  isLoading, 
  setStep1Data 
} = useRegisterStore();
```

### API Call Example
```typescript
try {
  const isValid = await validateBni(nomorRekening, namaRekening);
  if (isValid) {
    setStep1Data({ nomorRekening, namaRekening, phone });
    router.push('/next-step');
  }
} catch (error) {
  Alert.alert('Error', error.message);
}
```

## Testing
1. Pastikan backend API endpoints sudah running
2. Update `BASE_URL` di `constants/config.ts`
3. Test setiap step secara berurutan
4. Verify data persistence antar step
5. Test error scenarios (network error, invalid data, etc.)

## Notes
- Semua API calls menggunakan existing axios instance dari `services/api.ts`
- Error handling konsisten di seluruh aplikasi
- Loading states untuk UX yang baik
- Data validation sebelum API calls
- Secure storage untuk sensitive data