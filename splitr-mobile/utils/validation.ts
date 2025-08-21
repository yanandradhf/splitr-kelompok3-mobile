// Validation utilities for registration forms

export const validateEmail = (email: string): string => {
  if (!email) return 'Email harus diisi';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Format email tidak valid';
  return '';
};

export const validatePhone = (phone: string): string => {
  if (!phone) return 'Nomor HP harus diisi';
  if (!/^[0-9]+$/.test(phone)) return 'Nomor HP hanya boleh berisi angka';
  if (phone.length < 10 || phone.length > 15) return 'Nomor HP tidak valid';
  return '';
};

export const validateBankAccount = (accountNumber: string): string => {
  if (!accountNumber) return 'Nomor rekening harus diisi';
  if (!/^[0-9]+$/.test(accountNumber)) return 'Nomor rekening hanya boleh berisi angka';
  if (accountNumber.length !== 10) return 'Nomor rekening harus 10 digit';
  return '';
};

export const validateAccountName = (name: string): string => {
  if (!name) return 'Nama rekening harus diisi';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Nama hanya boleh berisi huruf dan spasi';
  if (name.length < 2) return 'Nama terlalu pendek';
  return '';
};

export const validateUsername = (username: string): string => {
  if (!username) return 'Username harus diisi';
  if (username.length < 3) return 'Username minimal 3 karakter';
  if (username.length > 20) return 'Username maksimal 20 karakter';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username hanya boleh berisi huruf, angka, dan underscore';
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return 'Password harus diisi';
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (password.length > 50) return 'Password maksimal 50 karakter';
  
  // Check for at least one number
  if (!/\d/.test(password)) return 'Password harus mengandung minimal 1 angka';
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) return 'Password harus mengandung minimal 1 huruf';
  
  return '';
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string => {
  if (!confirmation) return 'Konfirmasi password harus diisi';
  if (password !== confirmation) return 'Password tidak sama';
  return '';
};

export const validatePin = (pin: string): string => {
  if (!pin) return 'PIN harus diisi';
  if (!/^[0-9]+$/.test(pin)) return 'PIN hanya boleh berisi angka';
  if (pin.length !== 6) return 'PIN harus 6 digit';
  
  // Check for simple patterns
  if (/^(.)\1{5}$/.test(pin)) return 'PIN tidak boleh menggunakan angka yang sama semua';
  if (pin === '123456' || pin === '654321') return 'PIN terlalu mudah ditebak';
  
  return '';
};

export const validateOtp = (otp: string): string => {
  if (!otp) return 'Kode OTP harus diisi';
  if (!/^[0-9]+$/.test(otp)) return 'Kode OTP hanya boleh berisi angka';
  if (otp.length !== 6) return 'Kode OTP harus 6 digit';
  return '';
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +62 xxx-xxxx-xxxx
  if (cleaned.startsWith('0')) {
    const withoutZero = cleaned.substring(1);
    return `+62 ${withoutZero.substring(0, 3)}-${withoutZero.substring(3, 7)}-${withoutZero.substring(7)}`;
  }
  
  if (cleaned.startsWith('62')) {
    const withoutCountryCode = cleaned.substring(2);
    return `+62 ${withoutCountryCode.substring(0, 3)}-${withoutCountryCode.substring(3, 7)}-${withoutCountryCode.substring(7)}`;
  }
  
  return phone;
};

// Format bank account number for display
export const formatBankAccount = (accountNumber: string): string => {
  if (!accountNumber) return '';
  
  // Format as xxxx-xxxx-xx
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
  }
  
  return accountNumber;
};