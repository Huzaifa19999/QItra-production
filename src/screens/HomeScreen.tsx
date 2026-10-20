import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, Product, NavigationRoute } from '../types';
import { fetchCategories, fetchProducts } from '../services/api';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

interface HomeScreenProps {
  onNavigate: (route: NavigationRoute) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts({ sort: 'newest' }),
        ]);
        if (mounted) {
          setCategories(cats);
          setFeaturedProducts(prods.slice(0, 8));
        }
      } catch (e) {
        console.error('Failed to load home data', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const benefits = [
    {
      icon: 'cube-outline' as const,
      title: 'Free Express Delivery',
      desc: 'Complimentary shipping across Pakistan on orders above Rs. 3,000.',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: '100% Verified Authentic',
      desc: 'Directly sourced from prestigious master perfumers and luxury houses.',
    },
    {
      icon: 'card-outline' as const,
      title: 'Cash On Delivery',
      desc: 'Inspect your luxury parcel and pay conveniently upon arrival.',
    },
    {
      icon: 'logo-whatsapp' as const,
      title: 'VIP WhatsApp Concierge',
      desc: 'Personalized scent consultations and bespoke styling advice.',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ─── 1. HERO SECTION ─── */}
      <View style={styles.heroSection}>
        <View style={[styles.heroInner, isMobile && styles.heroInnerMobile]}>
          {/* Left / Text Content */}
          <View style={[styles.heroContent, isMobile && styles.heroContentMobile]}>
            <View style={styles.badgeRow}>
              <View style={styles.heroTag}>
                <Ionicons name="sparkles" size={12} color="#dfba73" />
                <Text style={styles.heroTagText}>HAUTE MAISON ATELIER</Text>
              </View>
            </View>

            <Text
              style={[
                styles.heroHeading,
                isMobile && styles.heroHeadingMobile,
              ]}
            >
              The Epitome of Modern Elegance & Fragrance
            </Text>

            <Text style={[styles.heroSubheading, isMobile && styles.heroSubheadingMobile]}>
              Immerse yourself in artisanal haute perfumerie, imperial velvet couture,
              and heirloom jewels crafted for those with discerning taste.
            </Text>

            <View style={[styles.heroCtaRow, isMobile && styles.heroCtaRowMobile]}>
              <TouchableOpacity
                style={styles.primaryCta}
                onPress={() => onNavigate({ name: 'products' })}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryCtaText}>Explore All Creations</Text>
                <Ionicons name="arrow-forward" size={16} color="#000000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCta}
                onPress={() =>
                  onNavigate({
                    name: 'products',
                    params: { category: 'perfume' },
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryCtaText}>Discover Perfumes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right / Hero Image Container */}
          <View
            style={[
              styles.heroImageContainer,
              isMobile && styles.heroImageContainerMobile,
            ]}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=1000&q=80',
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* ─── 2. VALUE PROPOSITIONS ─── */}
      <View style={styles.benefitsSection}>
        <View style={styles.benefitsInner}>
          <View style={[styles.benefitsGrid, isMobile && styles.benefitsGridMobile]}>
            {benefits.map((b, idx) => (
              <View key={idx} style={styles.benefitCard}>
                <View style={styles.benefitIconBox}>
                  <Ionicons name={b.icon} size={20} color="#dfba73" />
                </View>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ─── 3. CATEGORIES SHOWCASE ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTag}>CURATED COLLECTIONS</Text>
            <Text style={styles.sectionTitle}>Explore by Maison Category</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => onNavigate({ name: 'products' })}
          >
            <Text style={styles.seeAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={14} color="#dfba73" />
          </TouchableOpacity>
        </View>

        <View style={[styles.categoriesGrid, isMobile && styles.categoriesGridMobile]}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryCol}>
              <CategoryCard
                category={category}
                onPress={() =>
                  onNavigate({
                    name: 'products',
                    params: { category: category.slug },
                  })
                }
              />
            </View>
          ))}
        </View>
      </View>

      {/* ─── 4. FEATURED PRODUCTS ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTag}>EXCLUSIVE RELEASES</Text>
            <Text style={styles.sectionTitle}>Featured Masterpieces</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => onNavigate({ name: 'products' })}
          >
            <Text style={styles.seeAllText}>Browse Catalog</Text>
            <Ionicons name="arrow-forward" size={14} color="#dfba73" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dfba73" />
          </View>
        ) : (
          <View style={[styles.productsGrid, isMobile && styles.productsGridMobile]}>
            {featuredProducts.map((product) => (
              <View
                key={product.id}
                style={[
                  styles.productCol,
                  isMobile && styles.productColMobile,
                ]}
              >
                <ProductCard
                  product={product}
                  onPress={() =>
                    onNavigate({
                      name: 'product-detail',
                      params: { productId: product.id },
                    })
                  }
                  onAddToCart={() => addToCart(product, 1)}
                />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ─── 5. VIP ATELIER CONCIERGE BANNER ─── */}
      <View style={styles.vipBanner}>
        <View style={styles.vipInner}>
          <View style={styles.vipTag}>
            <Ionicons name="sparkles" size={12} color="#dfba73" />
            <Text style={styles.vipTagText}>PERSONALIZED ASSISTANCE</Text>
          </View>
          <Text style={styles.vipTitle}>Bespoke Fragrance & Styling Concierge</Text>
          <Text style={styles.vipDesc}>
            Need assistance choosing a signature scent or wedding ensemble? Speak directly
            with our resident fragrance specialists on WhatsApp for personalized curations.
          </Text>
          <TouchableOpacity
            style={styles.vipCta}
            onPress={() => onNavigate({ name: 'products', params: { category: 'perfume' } })}
            activeOpacity={0.8}
          >
            <Text style={styles.vipCtaText}>Explore Signature Perfumes</Text>
            <Ionicons name="arrow-forward" size={16} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080d',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: '#0c0d14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    maxWidth: 1200,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
  },
  heroInnerMobile: {
    flexDirection: 'column',
    gap: 28,
  },
  heroContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  heroContentMobile: {
    alignItems: 'center',
  },
  badgeRow: {
    marginBottom: 16,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroTagText: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroHeading: {
    fontSize: 44,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 52,
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  heroHeadingMobile: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  heroSubheading: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'left',
    lineHeight: 26,
    maxWidth: 600,
    marginBottom: 32,
  },
  heroSubheadingMobile: {
    textAlign: 'center',
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  heroCtaRowMobile: {
    flexDirection: 'column',
    width: '100%',
  },
  primaryCta: {
    backgroundColor: '#dfba73',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryCta: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryCtaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroImageContainer: {
    flex: 1,
    width: '100%',
    height: 420,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginTop: 220,
  },
  heroImageContainerMobile: {
    height: 360,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  benefitsSection: {
    backgroundColor: '#090a10',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  benefitsInner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
  },
  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  benefitsGridMobile: {
    flexDirection: 'column',
    gap: 18,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 20,
  },
  benefitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  benefitDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 16,
  },
  sectionTag: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 2,
  },
  seeAllText: {
    color: '#dfba73',
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    width: '100%',
  },
  categoriesGridMobile: {
    flexDirection: 'column',
    marginHorizontal: 0,
    gap: 16,
  },
  categoryCol: {
    width: '100%',
    padding: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  productsGridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productCol: {
    width: '25%',
    padding: 8,
  },
  productColMobile: {
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  vipBanner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 48,
  },
  vipInner: {
    backgroundColor: '#11121c',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 40,
    alignItems: 'center',
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  vipTagText: {
    color: '#dfba73',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  vipTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  vipDesc: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 620,
    marginBottom: 24,
  },
  vipCta: {
    backgroundColor: '#dfba73',
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vipCtaText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
});