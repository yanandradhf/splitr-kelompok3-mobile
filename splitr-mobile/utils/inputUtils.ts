// Enhanced utility for handling decimal input validation
export const handleDecimalInput = (value: string, maxDecimals: number = 1): string => {
  // Allow empty string
  if (value === '') return '';
  
  // Remove non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '');
  
  // Handle leading decimal point
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned;
  }
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    cleaned = parts[0] + '.' + parts[1].substring(0, maxDecimals);
  }
  
  return cleaned;
};

export const parseDecimalValue = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};