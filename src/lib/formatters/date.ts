/**
 * Formats an order date with localized, human-readable output.
 * 
 * @param dateString - ISO date string from the API
 * @param locale - The locale to use for formatting ('ru' or 'uz')
 * @returns Formatted date string
 * 
 * Examples:
 * - RU: "20 декабря 2025 г., 12:56"
 * - UZ: "20-dekabr 2025-yil, 12:56"
 */
export function formatOrderDate(dateString: string, locale: 'ru' | 'uz' = 'ru'): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    if (locale === 'uz') {
      // Uzbek format: "20-dekabr 2025-yil, 12:56"
      const months = [
        'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
        'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}-${month} ${year}-yil, ${hours}:${minutes}`;
    }

    // Russian format: "20 декабря 2025 г., 12:56"
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

/**
 * Formats a short order date (without time).
 * Used in order lists where space is limited.
 * 
 * @param dateString - ISO date string from the API
 * @param locale - The locale to use for formatting ('ru' or 'uz')
 * @returns Formatted short date string
 * 
 * Examples:
 * - RU: "20 дек. 2025 г."
 * - UZ: "20-dek. 2025"
 */
export function formatOrderDateShort(dateString: string, locale: 'ru' | 'uz' = 'ru'): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    if (locale === 'uz') {
      const months = [
        'yan.', 'fev.', 'mar.', 'apr.', 'may', 'iyn.',
        'iyl.', 'avg.', 'sen.', 'okt.', 'noy.', 'dek.'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day}-${month} ${year}`;
    }

    // Russian short format: "20 дек. 2025 г."
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}
