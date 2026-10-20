import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { formatCurrency } from '../utils/format';
import { Badge } from './Badge';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isOutOfStock = product.stock <= 0;

  return (
    <Pressable
      style={[styles.card, isHovered && styles.cardHovered]}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      {/* IMAGE & BADGES */}
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={[styles.image, isHovered && styles.imageHovered]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>QITRA MAISON</Text>
          </View>
        )}

        {/* TOP BADGES */}
        <View style={styles.badgeRow}>
          {product.category && (
            <Badge label={product.category.name} variant="gold" />
          )}
          {product.gender && product.gender !== 'UNISEX' && (
            <Badge
              label={
                product.gender === 'CHILDREN'
                  ? 'KIDS'
                  : product.gender === 'MEN'
                  ? 'MEN'
                  : 'WOMEN'
              }
              variant="sky"
            />
          )}
        </View>

        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>SOLD OUT</Text>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {product.category?.name || 'Exclusive'}
        </Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>PRICE</Text>
            <Text style={styles.priceText}>{formatCurrency(product.price)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
            onPress={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                onAddToCart();
              }
            }}
            disabled={isOutOfStock}
            activeOpacity={0.8}
          >
            <Ionicons
              name="bag-add-outline"
              size={18}
              color={isOutOfStock ? '#6b7280' : '#000000'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'column',
    transitionDuration: '300ms' as any,
  },
  cardHovered: {
    borderColor: 'rgba(212, 175, 55, 0.4)',
    transform: [{ translateY: -4 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#11121a',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    transitionDuration: '500ms' as any,
  },
  imageHovered: {
    transform: [{ scale: 1.05 }],
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#11121a',
  },
  placeholderText: {
    color: '#4b5563',
    fontStyle: 'italic',
    letterSpacing: 2,
    fontSize: 12,
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 10,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#f87171',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 10,
    color: '#d4af37',
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 14,
    minHeight: 40,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  priceText: {
    color: '#dfba73',
    fontSize: 17,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: '#d4af37',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#262626',
  },
});
