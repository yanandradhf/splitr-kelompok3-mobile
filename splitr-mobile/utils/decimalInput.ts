/**
 * Utility untuk handle input decimal yang user-friendly
 * Support koma dan titik sebagai decimal separator
 */

export interface DecimalInputConfig {
  maxDecimals?: number;
  allowNegative?: boolean;
  maxValue?: number;
}

/**
 * Normalize input decimal - convert koma ke titik
 */
export const normalizeDecimalInput = (input: string): string => {
  if (!input) return '';
  
  // Replace comma with dot
  let normalized = input.replace(',', '.');
  
  // Remove multiple dots - keep only first one
  const parts = normalized.split('.');
  if (parts.length > 2) {
    normalized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  return normalized;
};

/**
 * Validate dan format input decimal
 */
export const validateDecimalInput = (
  input: string, 
  config: DecimalInputConfig = {}
): { isValid: boolean; formatted: string; value: number } => {
  const { maxDecimals = 2, allowNegative = false, maxValue } = config;
  
  if (!input || input === '') {
    return { isValid: true, formatted: '', value: 0 };
  }
  
  // Normalize input
  const normalized = normalizeDecimalInput(input);
  
  // Check basic format
  const regex = allowNegative 
    ? /^-?\d*\.?\d*$/ 
    : /^\d*\.?\d*$/;
    
  if (!regex.test(normalized)) {
    return { isValid: false, formatted: input, value: 0 };
  }
  
  // Parse value
  const numValue = parseFloat(normalized) || 0;
  
  // Check max value
  if (maxValue && numValue > maxValue) {
    return { isValid: false, formatted: input, value: numValue };
  }
  
  // Check decimal places
  const parts = normalized.split('.');
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    const truncated = parts[0] + '.' + parts[1].substring(0, maxDecimals);
    return { isValid: true, formatted: truncated, value: parseFloat(truncated) || 0 };
  }
  
  return { isValid: true, formatted: normalized, value: numValue };
};

/**
 * Format number untuk display (dengan koma sebagai decimal separator)
 */
export const formatDecimalDisplay = (value: number, useComma: boolean = false): string => {
  if (value === 0) return '';
  
  const formatted = value.toString();
  return useComma ? formatted.replace('.', ',') : formatted;
};

/**
 * Hook untuk handle decimal input dengan state management
 */
export const useDecimalInput = (
  initialValue: number = 0,
  config: DecimalInputConfig = {},
  onValueChange?: (value: number) => void
) => {
  const [displayValue, setDisplayValue] = React.useState(
    formatDecimalDisplay(initialValue)
  );
  
  const handleChange = (input: string) => {
    const validation = validateDecimalInput(input, config);
    
    if (validation.isValid) {
      setDisplayValue(validation.formatted);
      onValueChange?.(validation.value);
    }
  };
  
  const setValue = (value: number) => {
    const formatted = formatDecimalDisplay(value);
    setDisplayValue(formatted);
    onValueChange?.(value);
  };
  
  return {
    displayValue,
    handleChange,
    setValue,
  };
};

/**
 * Percentage input khusus untuk pajak, service, diskon
 */
export const validatePercentageInput = (input: string) => {
  return validateDecimalInput(input, {
    maxDecimals: 1,
    allowNegative: false,
    maxValue: 100
  });
};

/**
 * Currency input khusus untuk nominal rupiah
 */
export const validateCurrencyInput = (input: string) => {
  return validateDecimalInput(input, {
    maxDecimals: 0, // Rupiah tidak pakai decimal
    allowNegative: false,
    maxValue: 999999999 // 999 juta
  });
};