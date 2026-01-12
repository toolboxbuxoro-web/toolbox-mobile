import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, TextInput, Switch, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { useCategories } from '@/hooks/useCategories';

interface FilterSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  onApply: () => void;
}

export function FilterSheet({ sheetRef, onApply }: FilterSheetProps) {
  const { draftFilters, setDraftFilter, resetFilters, applyFilters, syncDraft } = useSearch();
  const { data: categories = [] } = useCategories();

  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const handleApply = () => {
    applyFilters();
    onApply();
    sheetRef.current?.close();
  };

  const handleReset = () => {
    resetFilters();
  };

  const toggleCategory = (id: string) => {
    const current = draftFilters.categoryIds || [];
    if (current.includes(id)) {
      setDraftFilter('categoryIds', current.filter(i => i !== id));
    } else {
      setDraftFilter('categoryIds', [...current, id]);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onAnimate={(from, to) => {
        if (to === 0 || to === 1) syncDraft();
      }}
    >
      <View className="flex-1 px-4 pb-10">
        <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
          <Text className="text-xl font-black uppercase text-dark">Фильтры</Text>
          <Pressable onPress={handleReset}>
            <Text className="text-primary font-bold uppercase text-xs">Сбросить</Text>
          </Pressable>
        </View>

        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View className="py-6 border-b border-gray-50">
            <Text className="text-sm font-black uppercase text-gray-400 mb-4 tracking-widest">Цена (сум)</Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3">
                <Text className="text-[10px] text-gray-500 uppercase font-bold mb-1">От</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  className="text-dark font-black text-base p-0"
                  value={draftFilters.priceMin?.toString()}
                  onChangeText={(val) => setDraftFilter('priceMin', val ? parseInt(val) : undefined)}
                />
              </View>
              <View className="w-2 h-[2px] bg-gray-300" />
              <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3">
                <Text className="text-[10px] text-gray-500 uppercase font-bold mb-1">До</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="∞"
                  className="text-dark font-black text-base p-0"
                  value={draftFilters.priceMax?.toString()}
                  onChangeText={(val) => setDraftFilter('priceMax', val ? parseInt(val) : undefined)}
                />
              </View>
            </View>
          </View>

          {/* Availability */}
          <View className="py-6 border-b border-gray-50 flex-row justify-between items-center">
            <View>
              <Text className="text-sm font-black uppercase text-dark tracking-wide">Только в наличии</Text>
              <Text className="text-xs text-gray-500 mt-1">Скрыть товары, которых нет на складе</Text>
            </View>
            <Switch
              value={draftFilters.inStock || false}
              onValueChange={(val) => setDraftFilter('inStock', val)}
              trackColor={{ false: '#E5E7EB', true: '#DC2626' }}
            />
          </View>

          {/* Categories */}
          <View className="py-6">
            <Text className="text-sm font-black uppercase text-gray-400 mb-4 tracking-widest">Категории</Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = draftFilters.categoryIds?.includes(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id)}
                    className={`px-4 py-2 rounded-full border ${
                      isSelected ? 'bg-dark border-dark' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </BottomSheetScrollView>

        {/* Footer Actions */}
        <View className="pt-4 border-t border-gray-100">
          <Pressable
            onPress={handleApply}
            className="bg-primary w-full py-4 rounded-xl active:bg-red-700"
          >
            <Text className="text-white text-center font-black uppercase tracking-widest text-base">
              Показать результаты
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}
