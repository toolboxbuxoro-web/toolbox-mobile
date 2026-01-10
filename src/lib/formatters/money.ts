/**
 * Formats a money amount with localized currency symbols.
 * 
 * @param amount - The amount to format (in major units, e.g., 1250000)
 * @param locale - The locale to use for formatting ('ru' or 'uz')
 * @returns Formatted string (e.g., "1 250 000 сум" or "1 250 000 so'm")
 */
export function formatMoney(amount: number, locale: 'ru' | 'uz' = 'ru'): string {
  if (amount === undefined || amount === null) return '0';

  const formatted = new Intl.NumberFormat(
    locale === 'ru' ? 'ru-RU' : 'uz-UZ'
  ).format(amount);
  
  return locale === 'ru' ? `${formatted} сум` : `${formatted} so'm`;
}
