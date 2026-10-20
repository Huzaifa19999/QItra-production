import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      style={[styles.card, isHovered && styles.cardHovered]}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      {category.image && (
        <Image
          source={{ uri: category.image }}
          style={[styles.bgImage, isHovered && styles.bgImageHovered]}
          resizeMode="cover"
        />
      )}
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.subTitle}>MAISON ATELIER</Text>
          <Ionicons
            name="arrow-forward-outline"
            size={18}
            color="#dfba73"
            style={[styles.arrowIcon, isHovered && styles.arrowIconHovered]}
          />
        </View>

        <Text style={styles.categoryName}>{category.name}</Text>

        <Text style={styles.itemCount}>
          {category.productCount ? `${category.productCount} Exclusive Pieces` : 'Explore Collection'}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    transitionDuration: '300ms' as any,
  },
  cardHovered: {
    borderColor: 'rgba(212, 175, 55, 0.5)',
    transform: [{ translateY: -4 }],
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    transitionDuration: '700ms' as any,
  },
  bgImageHovered: {
    transform: [{ scale: 1.08 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 6, 9, 0.65)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    justifyContent: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subTitle: {
    color: '#dfba73',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  arrowIcon: {
    transitionDuration: '300ms' as any,
  },
  arrowIconHovered: {
    transform: [{ translateX: 4 }],
  },
  categoryName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  itemCount: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
