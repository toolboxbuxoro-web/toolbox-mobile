import React from 'react';
import { View, Text } from 'react-native';
import { HomeSection, HomeBanner } from '../../types/mobile';

/**
 * Empty placeholders for now, containing zero networking logic.
 */

import { BannerSlider } from './BannerSlider';
import { CategoryGrid } from './CategoryGrid';
import { ProductRail } from './ProductRail';

interface SectionRendererProps {
  section: HomeSection;
  index: number;
}

export function SectionRenderer({ section, index }: SectionRendererProps) {
  const commonProps = {
    id: section.id,
    position: index,
  };

  switch (section.type) {
    case 'banner_slider':
      return <BannerSlider {...commonProps} />;

    case 'category_chips':
    case 'category_grid':
      return <CategoryGrid {...commonProps} />;

    case 'product_rail':
      return (
        <ProductRail 
          collectionId={section.collection_id} 
          title={section.title.ru} // Assuming we want RU for now, can be locale-aware later
          {...commonProps}
        />
      );

    default:
      return null;
  }
}
