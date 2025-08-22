export const formatRp = (n: number) =>
  `Rp ${Math.max(0, Math.floor(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;