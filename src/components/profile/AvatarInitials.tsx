import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarInitialsProps {
  firstName?: string;
  lastName?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export function AvatarInitials({ 
  firstName, 
  lastName, 
  size = 40, 
  backgroundColor = '#F3F4F6', 
  textColor = '#4B5563' 
}: AvatarInitialsProps) {
  
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    return null;
  };

  const initials = getInitials();

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor 
        }
      ]}
    >
      {initials ? (
        <Text 
          style={[
            styles.text, 
            { 
              fontSize: size * 0.4, 
              color: textColor 
            }
          ]}
        >
          {initials}
        </Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={textColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
