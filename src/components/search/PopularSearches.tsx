import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const POPULAR_QUERIES = ["дрель", "шуруповерт", "болгарка", "перфоратор", "сварка"];

interface PopularSearchesProps {
  onSelect: (term: string) => void;
}

export function PopularSearches({ onSelect }: PopularSearchesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Популярные запросы</Text>
      <View style={styles.chipsContainer}>
        {POPULAR_QUERIES.map((item) => (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
});
