export function formatPrice(price: number): string {
  const formatted = price.toLocaleString('uz-UZ').replace(/,/g, ' ');
  return `${formatted} so'm`;
}

export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M so'm`;
  }
  if (price >= 1_000) {
    const thousands = price / 1_000;
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(0)}K so'm`;
  }
  return formatPrice(price);
}
