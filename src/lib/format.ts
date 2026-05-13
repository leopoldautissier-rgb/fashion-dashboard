// Format currency with K/M abbreviations
// €34,453 -> €34.5K
// €890,676 -> €0.9M
// €1,234 -> €1,234

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1000000) {
    return sign + '€' + (abs / 1000000).toFixed(1) + 'M';
  }
  if (abs >= 10000) {
    return sign + '€' + (abs / 1000).toFixed(1) + 'K';
  }
  if (abs >= 1000) {
    return sign + '€' + abs.toLocaleString('fr-FR');
  }
  return sign + '€' + abs.toFixed(0);
}

// For table cells where you want exact values
export function formatCurrencyExact(value: number): string {
  return '€' + value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}