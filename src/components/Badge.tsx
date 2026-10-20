import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'gold' | 'sky' | 'emerald' | 'amber' | 'rose' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'gold' }) => {
  const getStyle = () => {
    switch (variant) {
      case 'sky':
        return {
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.3)',
          text: '#7dd3fc',
        };
      case 'emerald':
        return {
          bg: 'rgba(52, 211, 153, 0.12)',
          border: 'rgba(52, 211, 153, 0.3)',
          text: '#6ee7b7',
        };
      case 'amber':
        return {
          bg: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.3)',
          text: '#fde047',
        };
      case 'rose':
        return {
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.3)',
          text: '#fda4af',
        };
      case 'neutral':
        return {
          bg: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.12)',
          text: '#9ca3af',
        };
      case 'gold':
      default:
        return {
          bg: 'rgba(212, 175, 55, 0.15)',
          border: 'rgba(212, 175, 55, 0.35)',
          text: '#dfba73',
        };
    }
  };

  const colors = getStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
