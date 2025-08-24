export const formatRp = (n: number | string | null | undefined) => {
  if (n === null || n === undefined || n === '') {
    return 'Rp 0';
  }
  
  const num = typeof n === 'string' ? parseFloat(n) : Number(n);
  
  if (isNaN(num)) {
    console.warn('formatRp: Invalid number received:', n);
    return 'Rp 0';
  }
  
  return `Rp ${Math.max(0, Math.floor(num))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
};