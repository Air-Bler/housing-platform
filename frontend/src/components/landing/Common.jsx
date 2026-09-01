// Σταθερά όρια τιμών & χρωμάτων 
export const PRICE_TIERS = {
  MID_THRESHOLD: 10.5,
  PREMIUM_THRESHOLD: 14.0,
  COLORS: {
    BUDGET: '#4C7A6D',   // Προσιτό (< 10.5€)
    MID: '#C98A3E',      // Μεσαίο (10.5€ - 14.0€)
    PREMIUM: '#B33F30',  // Ακριβό (> 14.0€)
  },
};


export const getMarkerColor = (price) => {
  const val = Number(price) || 0;
  if (val >= PRICE_TIERS.PREMIUM_THRESHOLD) return PRICE_TIERS.COLORS.PREMIUM;
  if (val >= PRICE_TIERS.MID_THRESHOLD) return PRICE_TIERS.COLORS.MID;
  return PRICE_TIERS.COLORS.BUDGET;
};


export const formatCurrency = (val, decimals = 0) => {
  const num = Number(val) || 0;
  return `€${num.toLocaleString('el-GR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};


export const formatSqmPrice = (val) => {
  const num = Number(val) || 0;
  return `€${num.toFixed(1)}/m²`;
};


export const cleanSuburbName = (raw) => {
  if (!raw) return '';
  return raw
    .split('(')[0]
    .split('-')[0]
    .trim();
};