import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, NavigationRoute } from '../types';
import { fetchProducts } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

interface ProductsScreenProps {
  category?: string;
  gender?: string;
  search?: string;
  onNavigate: (route: NavigationRoute) => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  category: initialCategory,
  gender: initialGender,
  search: initialSearch,
  onNavigate,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedGender, setSelectedGender] = useState<string>(initialGender || 'ALL');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialGender) setSelectedGender(initialGender);
  }, [initialGender]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const data = await fetchProducts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          gender: selectedGender === 'ALL' ? undefined : selectedGender,
          search: initialSearch,
          sort: selectedSort,
        });
        if (mounted) {
          setProducts(data);
        }
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedCategory, selectedGender, selectedSort, initialSearch]);

  const categories = [
    { label: 'All Collections', slug: 'all' },
    { label: 'Clothes', slug: 'clothes' },
    { label: 'Makeup', slug: 'makeup' },
    { label: 'Jewellery', slug: 'jewellery' },
    { label: 'Perfume', slug: 'perfume' },
  ];

  const genders = [
    { label: 'All', value: 'ALL' },
    { label: 'Men', value: 'MEN' },
    { label: 'Women', value: 'WOMEN' },
    { label: 'Children', value: 'CHILDREN' },
    { label: 'Unisex', value: 'UNISEX' },
  ];

  const sortOptions = [
    { label: 'Newest Arrivals', value: 'newest' as const },
    { label: 'Price: Low to High', value: 'price_asc' as const },
    { label: 'Price: High to Low', value: 'price_desc' as const },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <View style={styles.inner}>
          <Text style={styles.pageTag}>HAUTE MAISON CATALOGUE</Text>
          <Text style={styles.pageTitle}>
            {selectedCategory === 'all'
              ? 'Complete Collection'
              : `${selectedCategory.toUpperCase()} COLLECTION`}
          </Text>
          {initialSearch ? (
            <View style={styles.searchNotice}>
              <Text style={styles.searchNoticeText}>
                Showing results for "{initialSearch}"
              </Text>
              <TouchableOpacity
                onPress={() => onNavigate({ name: 'products', params: {} })}
                style={styles.clearSearchBtn}
              >
                <Ionicons name="close" size={14} color="#dfba73" />
                <Text style={styles.clearSearchText}>Clear search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.pageDesc}>
              Bespoke luxury pieces designed and crafted with quintessential artistry.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inner}>
        {/* FILTER BAR */}
        <View style={styles.filterSection}>
          {/* CATEGORIES HORIZONTAL SCROLL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsRow}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <TouchableOpacity
                  key={cat.slug}
                  onPress={() => setSelectedCategory(cat.slug)}
                  style={[styles.pill, isActive && styles.pillActive]}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SECONDARY ROW: GENDER & SORT */}
          <View style={[styles.secondaryFiltersRow, isMobile && styles.secondaryFiltersRowMobile]}>
            {/* GENDERS */}
            <View style={styles.genderFilters}>
              <Text style={styles.filterLabel}>AUDIENCE:</Text>
              <View style={styles.genderButtons}>
                {genders.map((g) => {
                  const isActive = selectedGender === g.value;
                  return (
                    <TouchableOpacity
                      key={g.value}
                      onPress={() => setSelectedGender(g.value)}
                      style={[styles.genderBtn, isActive && styles.genderBtnActive]}
                    >
                      <Text
                        style={[
                          styles.genderBtnText,
                          isActive && styles.genderBtnTextActive,
                        ]}
                      >
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SORTING */}
            <View style={styles.sortContainer}>
              <Text style={styles.filterLabel}>SORT:</Text>
              <View style={styles.sortButtons}>
                {sortOptions.map((opt) => {
                  const isActive = selectedSort === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setSelectedSort(opt.value)}
                      style={[styles.sortBtn, isActive && styles.sortBtnActive]}
                    >
                      <Text
                        style={[
                          styles.sortBtnText,
                          isActive && styles.sortBtnTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* RESULTS COUNT */}
        <View style={styles.resultsBar}>
          <Text style={styles.resultsCount}>
            Showing <Text style={styles.resultsHighlight}>{products.length}</Text> creation
            {products.length === 1 ? '' : 's'}
          </Text>
        </View>

        {/* PRODUCTS GRID */}
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#dfba73" />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search" size={48} color="#4b5563" />
            <Text style={styles.emptyTitle}>No Creations Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your category, audience filter, or search keywords.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSelectedCategory('all');
                setSelectedGender('ALL');
                onNavigate({ name: 'products', params: {} });
              }}
            >
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.productsGrid, isMobile && styles.productsGridMobile]}>
            {products.map((product) => (
              <View
                key={product.id}
                style={[styles.productCol, isMobile && styles.productColMobile]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080d',
  },
  contentContainer: {
    paddingBottom: 48,
  },
  inner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 20,
  },
  headerBanner: {
    backgroundColor: '#0c0d14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 36,
    marginBottom: 24,
  },
  pageTag: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  pageDesc: {
    color: '#9ca3af',
    fontSize: 14,
  },
  searchNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  searchNoticeText: {
    color: '#dfba73',
    fontSize: 13,
    fontWeight: '500',
  },
  clearSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  clearSearchText: {
    color: '#dfba73',
    fontSize: 11,
  },
  filterSection: {
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 20,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: '#dfba73',
    borderColor: '#dfba73',
  },
  pillText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  secondaryFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    flexWrap: 'wrap',
    gap: 16,
  },
  secondaryFiltersRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  filterLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginRight: 8,
  },
  genderFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  genderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  genderBtnText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  genderBtnTextActive: {
    color: '#dfba73',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  sortBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortBtnText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  sortBtnTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultsBar: {
    marginBottom: 16,
  },
  resultsCount: {
    color: '#9ca3af',
    fontSize: 13,
  },
  resultsHighlight: {
    color: '#ffffff',
    fontWeight: '700',
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
    width: '50%',
  },
  loaderBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: '#dfba73',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resetBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
});
