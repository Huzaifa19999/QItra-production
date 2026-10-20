import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, NavigationRoute } from '../types';
import { fetchProductById, fetchProducts } from '../services/api';
import { formatCurrency } from '../utils/format';
import { Badge } from '../components/Badge';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

interface ProductDetailScreenProps {
  productId: number;
  onNavigate: (route: NavigationRoute) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId,
  onNavigate,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setQuantity(1);
    setAddedNotice(false);

    (async () => {
      try {
        const prod = await fetchProductById(productId);
        if (mounted && prod) {
          setProduct(prod);
          const related = await fetchProducts({
            category: prod.category?.slug,
          });
          if (mounted) {
            setRelatedProducts(related.filter((p) => p.id !== prod.id).slice(0, 4));
          }
        }
      } catch (e) {
        console.error('Failed to load product details', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    onNavigate({ name: 'checkout' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dfba73" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Creation Not Found</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => onNavigate({ name: 'products' })}
        >
          <Text style={styles.backBtnText}>Return to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* BREADCRUMB */}
        <View style={styles.breadcrumbs}>
          <TouchableOpacity onPress={() => onNavigate({ name: 'home' })}>
            <Text style={styles.breadcrumbLink}>MAISON</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSep}>/</Text>
          <TouchableOpacity
            onPress={() =>
              onNavigate({
                name: 'products',
                params: { category: product.category?.slug },
              })
            }
          >
            <Text style={styles.breadcrumbLink}>
              {product.category?.name.toUpperCase() || 'COLLECTION'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSep}>/</Text>
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
            {product.name}
          </Text>
        </View>

        {/* MAIN PRODUCT ROW */}
        <View style={[styles.mainRow, isMobile && styles.mainRowMobile]}>
          {/* IMAGE */}
          <View style={[styles.imageCol, isMobile && styles.imageColMobile]}>
            <View style={styles.imageCard}>
              {product.image ? (
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>QITRA MAISON</Text>
                </View>
              )}

              <View style={styles.imageBadges}>
                {product.category && (
                  <Badge label={product.category.name} variant="gold" />
                )}
                {product.gender && product.gender !== 'UNISEX' && (
                  <Badge
                    label={
                      product.gender === 'CHILDREN'
                        ? 'Kids'
                        : product.gender === 'MEN'
                        ? 'Men'
                        : 'Women'
                    }
                    variant="sky"
                  />
                )}
              </View>
            </View>
          </View>

          {/* DETAILS & ACTIONS */}
          <View style={[styles.detailsCol, isMobile && styles.detailsColMobile]}>
            <Text style={styles.categorySub}>
              {product.category?.name.toUpperCase() || 'EXCLUSIVE'}
            </Text>
            <Text style={styles.title}>{product.name}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatCurrency(product.price)}</Text>
              <Text style={styles.taxNotice}>Taxes included. Nationwide delivery.</Text>
            </View>

            {/* STOCK INDICATOR */}
            <View style={styles.stockRow}>
              <View
                style={[
                  styles.stockDot,
                  { backgroundColor: isOutOfStock ? '#ef4444' : '#10b981' },
                ]}
              />
              <Text
                style={[
                  styles.stockText,
                  { color: isOutOfStock ? '#ef4444' : '#6ee7b7' },
                ]}
              >
                {isOutOfStock
                  ? 'Currently Out of Stock'
                  : product.stock < 10
                  ? `Only ${product.stock} items remaining in atelier`
                  : 'In Stock & Ready for Dispatch'}
              </Text>
            </View>

            {/* DESCRIPTION */}
            <View style={styles.descBox}>
              <Text style={styles.descTitle}>CRAFTSMANSHIP & DETAILS</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>

            {/* QUANTITY & ACTIONS */}
            {!isOutOfStock && (
              <View style={styles.actionsSection}>
                <View style={styles.quantityRow}>
                  <Text style={styles.qtyLabel}>QUANTITY:</Text>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Ionicons name="remove" size={16} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                    >
                      <Ionicons name="add" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ADD TO CART & BUY NOW */}
                <View style={styles.ctaButtonsRow}>
                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={handleAddToCart}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="bag-outline" size={18} color="#000000" />
                    <Text style={styles.addToCartText}>Add to Luxury Bag</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.buyNowBtn}
                    onPress={handleBuyNow}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buyNowText}>Proceed to Checkout</Text>
                  </TouchableOpacity>
                </View>

                {addedNotice && (
                  <View style={styles.noticeBanner}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.noticeText}>Added to your shopping bag!</Text>
                  </View>
                )}
              </View>
            )}

            {/* GUARANTEES */}
            <View style={styles.guaranteeBox}>
              <View style={styles.guaranteeItem}>
                <Ionicons name="cube-outline" size={18} color="#dfba73" />
                <View>
                  <Text style={styles.guaranteeTitle}>Free Nationwide Delivery</Text>
                  <Text style={styles.guaranteeSub}>On orders exceeding Rs. 3,000</Text>
                </View>
              </View>
              <View style={styles.guaranteeItem}>
                <Ionicons name="card-outline" size={18} color="#dfba73" />
                <View>
                  <Text style={styles.guaranteeTitle}>Cash on Delivery</Text>
                  <Text style={styles.guaranteeSub}>Pay safely upon arrival at your doorstep</Text>
                </View>
              </View>
              <View style={styles.guaranteeItem}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#dfba73" />
                <View>
                  <Text style={styles.guaranteeTitle}>Authentic Atelier Guarantee</Text>
                  <Text style={styles.guaranteeSub}>100% genuine formulation & materials</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTag}>MAISON RECOMMENDATIONS</Text>
              <Text style={styles.relatedTitle}>You May Also Admire</Text>
            </View>

            <View style={[styles.relatedGrid, isMobile && styles.relatedGridMobile]}>
              {relatedProducts.map((rel) => (
                <View
                  key={rel.id}
                  style={[styles.relatedCol, isMobile && styles.relatedColMobile]}
                >
                  <ProductCard
                    product={rel}
                    onPress={() =>
                      onNavigate({
                        name: 'product-detail',
                        params: { productId: rel.id },
                      })
                    }
                    onAddToCart={() => addToCart(rel, 1)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080d',
  },
  contentContainer: {
    paddingVertical: 32,
    paddingBottom: 60,
  },
  inner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#dfba73',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#000000',
    fontWeight: '700',
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  breadcrumbLink: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  breadcrumbSep: {
    color: '#374151',
    fontSize: 11,
  },
  breadcrumbCurrent: {
    color: '#dfba73',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    maxWidth: 240,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 40,
  },
  mainRowMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  imageCol: {
    flex: 1,
  },
  imageColMobile: {
    width: '100%',
  },
  imageCard: {
    aspectRatio: 1,
    backgroundColor: '#0c0d14',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#11121c',
  },
  placeholderText: {
    color: '#4b5563',
    fontStyle: 'italic',
    fontSize: 16,
    letterSpacing: 2,
  },
  imageBadges: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 8,
  },
  detailsCol: {
    flex: 1,
  },
  detailsColMobile: {
    width: '100%',
  },
  categorySub: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 16,
  },
  price: {
    color: '#dfba73',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  taxNotice: {
    color: '#9ca3af',
    fontSize: 12,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 18,
    marginBottom: 24,
  },
  descTitle: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  description: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 22,
  },
  actionsSection: {
    marginBottom: 28,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  qtyLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qtyValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  ctaButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#dfba73',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  noticeText: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '600',
  },
  guaranteeBox: {
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    gap: 14,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guaranteeTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  guaranteeSub: {
    color: '#9ca3af',
    fontSize: 11,
  },
  relatedSection: {
    marginTop: 56,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 36,
  },
  relatedHeader: {
    marginBottom: 20,
  },
  relatedTag: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  relatedTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  relatedGridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  relatedCol: {
    width: '25%',
    padding: 8,
  },
  relatedColMobile: {
    width: '50%',
  },
});
