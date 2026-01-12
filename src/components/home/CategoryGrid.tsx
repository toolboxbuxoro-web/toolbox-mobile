import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../../hooks/useCategories';
import { track } from '../../lib/analytics/track';
import { CategoryChipsSkeleton } from './skeletons';
import { LazySection } from './LazySection';
import { useRouter } from 'expo-router';

import { SectionError } from './SectionError';

interface CategoryGridProps {
  id?: string;
  position?: number;
}

export function CategoryGrid({ id, position }: CategoryGridProps) {
  const router = useRouter();
  const { data: categories, isLoading, isError, refetch } = useCategories();

  const handleImpression = () => {
    track('section_impression', {
      section_id: id || 'category_grid',
      section_type: 'category_grid',
      position,
    });
  };

  const handlePress = (category: any) => {
    track('section_click', {
      section_id: id || 'category_grid',
      section_type: 'category_grid',
      category_id: category.id,
    });
    router.push(`/catalog/${category.handle}`);
  };

  if (isLoading) {
    return <CategoryChipsSkeleton />;
  }

  if (isError) {
    return (
      <SectionError 
        title="Категории недоступны" 
        onRetry={refetch} 
      />
    );
  }

  if (!categories?.length) {
    return null;
  }

  // Helper to map category names to icons
  const getIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const lower = name.toLowerCase();
    if (lower.includes('дрель') || lower.includes('drill')) return 'construct-outline';
    if (lower.includes('болгарка') || lower.includes('disc')) return 'disc-outline';
    if (lower.includes('сад') || lower.includes('garden')) return 'leaf-outline';
    if (lower.includes('набор') || lower.includes('set')) return 'grid-outline';
    if (lower.includes('авто') || lower.includes('auto')) return 'car-outline';
    if (lower.includes('свет') || lower.includes('light')) return 'sunny-outline';
    return 'cube-outline';
  };

  // Limit to 11 categories + 1 "All categories" card = 12 items (3 rows of 4)
  const displayCategories = categories.slice(0, 11);

  const handleAllCategoriesPress = () => {
    track('section_click', {
      section_id: id || 'category_grid',
      section_type: 'category_grid',
      action: 'view_all',
    });
    router.push('/catalog');
  };

  return (
    <LazySection height={260} skeleton={<CategoryChipsSkeleton />} onImpression={handleImpression}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Категории</Text>
        </View>
        <View style={styles.grid}>
          {displayCategories.map((category) => (
            <Pressable 
              key={category.id} 
              onPress={() => handlePress(category)}
              style={styles.item}
            >
              <View style={styles.iconContainer}>
                {category.metadata?.icon_url ? (
                  <Image
                    source={{ uri: category.metadata.icon_url }}
                    style={{ width: 44, height: 44 }}
                    contentFit="contain"
                    transition={200}
                    placeholder={{ blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I' }}
                  />
                ) : (
                  <Ionicons name={getIcon(category.name)} size={28} color="#DC2626" />
                )}
              </View>
              <Text 
                  numberOfLines={2}
                  style={styles.label}
              >
                  {category.name}
              </Text>
            </Pressable>
          ))}

          {/* "All Categories" Card */}
          <Pressable 
            onPress={handleAllCategoriesPress}
            style={styles.item}
          >
            <View style={[styles.iconContainer, styles.allIconContainer]}>
              <Ionicons name="apps-outline" size={28} color="#4B5563" />
            </View>
            <Text style={styles.label}>Все</Text>
          </Pressable>
        </View>
      </View>
    </LazySection>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '23%', // 4 columns with spacing
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  allIconContainer: {
    backgroundColor: '#E5E7EB',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
    lineHeight: 14,
  },
});
