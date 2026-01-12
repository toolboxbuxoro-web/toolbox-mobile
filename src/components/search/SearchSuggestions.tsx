import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { highlightMatch, POPULAR_SEARCHES } from '@/lib/utils/search-utils';

interface SearchSuggestionsProps {
  query: string;
  recentSearches: string[];
  onSelect: (item: string) => void;
  onRemoveRecent: (item: string) => void;
}

export function SearchSuggestions({ query, recentSearches, onSelect, onRemoveRecent }: SearchSuggestionsProps) {
  const filteredSuggestions = useMemo(() => {
    if (query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    
    // Combine recent and popular, remove duplicates
    const combined = Array.from(new Set([...recentSearches, ...POPULAR_SEARCHES]));
    
    return combined
      .filter(item => item.toLowerCase().startsWith(lowerQuery))
      .slice(0, 7); // Max 7 suggestions
  }, [query, recentSearches]);

  if (filteredSuggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredSuggestions}
        keyExtractor={(item) => item}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const isRecent = recentSearches.includes(item);
          
          return (
            <View style={styles.suggestionRow}>
              <Pressable 
                onPress={() => onSelect(item)}
                style={styles.suggestionButton}
              >
                <Ionicons 
                  name={isRecent ? "time-outline" : "search-outline"} 
                  size={18} 
                  color="#9CA3AF" 
                  style={styles.icon}
                />
                <Text style={styles.suggestionText}>
                  {highlightMatch(item, query)}
                </Text>
              </Pressable>
              
              {isRecent && (
                <Pressable onPress={() => onRemoveRecent(item)} style={styles.removeButton}>
                  <Ionicons name="close" size={16} color="#D1D5DB" />
                </Pressable>
              )}
            </View>
          );
        }}
        ListHeaderComponent={() => (
          <Text style={styles.headerText}>Подсказки</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  removeButton: {
    padding: 16,
  }
});
