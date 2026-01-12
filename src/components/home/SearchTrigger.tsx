import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchTriggerProps {
  placeholder?: string;
  isActive?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

/**
 * Real search input that activates overlay on focus.
 * Uzum/WB style - inline input with Cancel button.
 */
export function SearchTrigger({ 
  placeholder = 'Шуруповёрт, дрель, перчатки…',
  isActive,
  onActivate,
  onDeactivate,
  value,
  onChangeText
}: SearchTriggerProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
      Keyboard.dismiss();
    }
  }, [isActive]);

  const handleCancel = () => {
    onDeactivate?.();
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, isActive && styles.containerActive]}>
        <Ionicons name="search" size={20} color="#999" style={styles.icon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          onFocus={onActivate}
          returnKeyType="search"
          autoCorrect={false}
        />
        {isActive && value && value.length > 0 && (
          <Pressable onPress={() => onChangeText?.('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </Pressable>
        )}
      </View>
      
      {isActive && (
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Отмена</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  containerActive: {
    backgroundColor: '#F2F2F7',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    paddingVertical: 8,
    fontWeight: '400',
  },
  cancelButton: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
});
