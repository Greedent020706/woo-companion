export function formatPrice(amount: number, currency = 'EUR', locale = 'es-ES'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDate(isoDate: string, locale = 'es-ES'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(isoDate));
}
