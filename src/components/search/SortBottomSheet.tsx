import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { SortOption, SORT_OPTIONS_CONFIG } from '@/types/search';

interface SortBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  currentSort: SortOption;
  onSelect: (option: SortOption) => void;
}

export function SortBottomSheet({ sheetRef, currentSort, onSelect }: SortBottomSheetProps) {
  const snapPoints = useMemo(() => ['40%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleSelect = (option: SortOption) => {
    onSelect(option);
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Сортировка</Text>
          <Pressable onPress={() => sheetRef.current?.close()}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </Pressable>
        </View>

        <View style={styles.optionsList}>
          {(Object.keys(SortOption) as Array<keyof typeof SortOption>).map((key) => {
            const option = SortOption[key];
            const isSelected = currentSort === option;
            const config = SORT_OPTIONS_CONFIG[option];

            return (
              <Pressable
                key={option}
                onPress={() => handleSelect(option)}
                style={[styles.optionItem, isSelected && styles.optionItemActive]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                  {config.label}
                </Text>
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  optionItemActive: {
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#DC2626',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
});
