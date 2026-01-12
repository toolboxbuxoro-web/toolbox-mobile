export enum SortOption {
  RELEVANCE = 'relevance',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
}

export const SORT_OPTIONS_CONFIG = {
  [SortOption.RELEVANCE]: { label: 'По релевантности', value: '' },
  [SortOption.PRICE_ASC]: { label: 'Сначала дешевле', value: 'variants.calculated_price' },
  [SortOption.PRICE_DESC]: { label: 'Сначала дороже', value: '-variants.calculated_price' },
  [SortOption.NEWEST]: { label: 'Сначала новые', value: '-created_at' },
};
