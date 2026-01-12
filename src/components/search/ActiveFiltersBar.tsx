import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearch } from '@/hooks/useSearch';
import { useCategories } from '@/hooks/useCategories';

export function ActiveFiltersBar() {
  const {
    filters, clearFilter, resetFilters, activeFilterCount,
    removeCategoryFilter, removeBrandFilter
  } = useSearch();
  const { data: categories = [] } = useCategories();

  if (activeFilterCount === 0) return null;

  const renderChips = () => {
    const chips = [];

    // Price
    if (filters.priceMin || filters.priceMax) {
      const label = `${filters.priceMin || 0} - ${filters.priceMax || '∞'} сум`;
      chips.push(
        <FilterChip 
          key="price" 
          label={label} 
          onRemove={() => {
            clearFilter('priceMin');
            clearFilter('priceMax');
          }} 
        />
      );
    }

    // In Stock
    if (filters.inStock) {
      chips.push(
        <FilterChip 
          key="stock" 
          label="В наличии" 
          onRemove={() => clearFilter('inStock')} 
        />
      );
    }

    // Categories
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      filters.categoryIds.forEach(id => {
        const cat = categories.find(c => c.id === id);
        if (cat) {
          chips.push(
            <FilterChip 
              key={`cat-${id}`} 
              label={cat.name} 
              onRemove={() => removeCategoryFilter(id)} 
            />
          );
        }
      });
    }

    // Brands
    if (filters.brands && filters.brands.length > 0) {
      filters.brands.forEach(brand => {
        chips.push(
          <FilterChip 
            key={`brand-${brand}`} 
            label={brand} 
            onRemove={() => removeBrandFilter(brand)} 
          />
        );
      });
    }

    return chips;
  };

  return (
    <View className="py-2 bg-white border-b border-gray-50">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', gap: 8 }}
      >
        <Pressable 
          onPress={resetFilters}
          className="bg-gray-100 p-2 rounded-full mr-1"
        >
          <Ionicons name="trash-outline" size={16} color="#4B5563" />
        </Pressable>
        {renderChips()}
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View className="flex-row items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
      <Text className="text-gray-700 text-xs font-bold mr-1.5">{label}</Text>
      <Pressable onPress={onRemove}>
        <Ionicons name="close-circle" size={14} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}
