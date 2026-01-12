export interface HomeBanner {
  id: string;
  image: string;
  action: string;
  title: {
    ru: string;
    uz: string;
  };
}

export type HomeSectionType = 'banner_slider' | 'category_grid' | 'product_rail' | 'category_chips';

export interface BaseSectionConfig {
  id: string;
  type: HomeSectionType;
  order?: number;
}

export type HomeSection = 
  | (BaseSectionConfig & {
      type: 'banner_slider';
      data?: HomeBanner[]; // Optional now as it might be fetched internally
    })
  | (BaseSectionConfig & {
      type: 'category_chips' | 'category_grid';
      data_source?: string;
    })
  | (BaseSectionConfig & {
      type: 'product_rail';
      collection_id: string;
      title: {
        ru: string;
        uz: string;
      };
      handle?: string;
    });

/**
 * Static configuration for Home Screen sections to enable independent loading.
 */
export const HOME_PAGE_CONFIG: HomeSection[] = [
  { id: 'hero_banners', type: 'banner_slider', order: 1 },
  { id: 'main_categories', type: 'category_grid', order: 2 },
  { 
    id: 'featured_products', 
    type: 'product_rail', 
    collection_id: 'pcol_01KDPNZK38GHPNK8RZY7D01BHQ', // 'Хиты продаж'
    order: 3,
    title: { ru: 'Хиты продаж', uz: 'Hafta xitlari' }
  },
  { 
    id: 'seasonal_products', 
    type: 'product_rail', 
    collection_id: 'pcol_01KDPP098F5S7YFGQGSKN3RAT0', // 'Сезонные товары'
    order: 4,
    title: { ru: 'Сезонные товары', uz: 'Mavsumiy mahsulotlar' }
  },
];
