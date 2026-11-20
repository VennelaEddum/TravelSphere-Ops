/**
 * Currency and data formatting helpers for TravelSphere Ops
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatLakhs = (amount) => {
  if (!amount) return '₹0 L';
  const lakhs = (amount / 100000).toFixed(2);
  return `₹${lakhs} L`;
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatPercent = (percent) => {
  if (percent === undefined || percent === null) return '0%';
  return `${Number(percent).toFixed(1)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};
