import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { NavigationRoute } from '../types';

interface HeaderProps {
  onNavigate: (route: NavigationRoute) => void;
  activeScreen?: string;
  activeCategory?: string;
  activeGender?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  activeScreen,
  activeCategory,
  activeGender,
}) => {
  const { totalItems } = useCart();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    onNavigate({
      name: 'products',
      params: { search: searchInput },
    });
    setMobileMenuOpen(false);
  };

  const navCategories = [
    { label: 'All Products', slug: 'all' },
    { label: 'Clothes', slug: 'clothes' },
    { label: 'Makeup', slug: 'makeup' },
    { label: 'Jewellery', slug: 'jewellery' },
    { label: 'Perfume', slug: 'perfume' },
  ];

  const audienceLinks = [
    { label: 'Men', gender: 'MEN' as const },
    { label: 'Women', gender: 'WOMEN' as const },
    { label: 'Children', gender: 'CHILDREN' as const },
  ];

  return (
    <View style={styles.container}>
      {/* 1. TOP UTILITY ANNOUNCEMENT BAR */}
      <View style={styles.announcementBar}>
        <View style={styles.announcementContent}>
          <View style={styles.announcementLeft}>
            <View style={styles.infoBadge}>
              <Ionicons name="cube-outline" size={13} color="#d4af37" />
              <Text style={styles.announcementText}>
                Free Express Delivery Nationwide Over Rs. 3,000
              </Text>
            </View>
            {!isMobile && (
              <>
                <Text style={styles.divider}>|</Text>
                <View style={styles.infoBadge}>
                  <Ionicons name="shield-checkmark-outline" size={13} color="#d4af37" />
                  <Text style={[styles.announcementText, { color: '#f3d078' }]}>
                    Cash on Delivery (COD) Available
                  </Text>
                </View>
              </>
            )}
          </View>

          {!isMobile && (
            <View style={styles.announcementRight}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://wa.me/923343451617')}
                style={styles.conciergeLink}
              >
                <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
                <Text style={styles.conciergeText}>WhatsApp Concierge: +92 300 0000000</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 2. MAIN BRAND & NAVIGATION HEADER */}
      <View style={styles.mainNav}>
        <View style={styles.mainNavInner}>
          {/* LOGO */}
          <TouchableOpacity
            style={styles.logoContainer}
            onPress={() => onNavigate({ name: 'home' })}
            activeOpacity={0.8}
          >
            <View style={styles.brandRow}>
              <Text style={styles.logoTitle}>QITRA</Text>
              <Ionicons name="sparkles" size={16} color="#d4af37" />
            </View>
            <Text style={styles.logoSubtitle}>HAUTE MAISON</Text>
          </TouchableOpacity>

          {/* DESKTOP SEARCH BAR */}
          {!isMobile && (
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search perfumes, dresses, jewellery..."
                placeholderTextColor="#6b7280"
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchInput.length > 0 && (
                <TouchableOpacity onPress={() => setSearchInput('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={16} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* RIGHT ACTIONS: CART & MENU */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => onNavigate({ name: 'cart' })}
              activeOpacity={0.7}
            >
              <Ionicons name="bag-outline" size={22} color="#ffffff" />
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>

            {isMobile && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Ionicons
                  name={mobileMenuOpen ? 'close' : 'menu'}
                  size={24}
                  color="#ffffff"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* MOBILE SEARCH BAR */}
        {isMobile && (
          <View style={styles.mobileSearchContainer}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#6b7280"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        )}

        {/* 3. CATEGORY BAR (DESKTOP) */}
        {!isMobile && (
          <View style={styles.categoriesBar}>
            <View style={styles.categoriesInner}>
              <View style={styles.navLinks}>
                {navCategories.map((cat) => {
                  const isActive =
                    (cat.slug === 'all' && activeScreen === 'products' && !activeCategory && !activeGender) ||
                    activeCategory === cat.slug;
                  return (
                    <TouchableOpacity
                      key={cat.slug}
                      onPress={() =>
                        onNavigate({
                          name: 'products',
                          params: { category: cat.slug === 'all' ? undefined : cat.slug },
                        })
                      }
                      style={[styles.categoryLink, isActive && styles.activeCategoryLink]}
                    >
                      <Text
                        style={[
                          styles.categoryLinkText,
                          isActive && styles.activeCategoryLinkText,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.audienceLinks}>
                {audienceLinks.map((aud) => {
                  const isActive = activeGender === aud.gender;
                  return (
                    <TouchableOpacity
                      key={aud.gender}
                      onPress={() =>
                        onNavigate({
                          name: 'products',
                          params: { gender: aud.gender },
                        })
                      }
                      style={[styles.audienceLink, isActive && styles.activeAudienceLink]}
                    >
                      <Text
                        style={[
                          styles.audienceLinkText,
                          isActive && styles.activeAudienceLinkText,
                        ]}
                      >
                        {aud.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* 4. MOBILE MENU DROPDOWN */}
        {isMobile && mobileMenuOpen && (
          <View style={styles.mobileMenu}>
            <Text style={styles.mobileMenuHeading}>CATEGORIES</Text>
            {navCategories.map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                style={styles.mobileMenuItem}
                onPress={() => {
                  onNavigate({
                    name: 'products',
                    params: { category: cat.slug === 'all' ? undefined : cat.slug },
                  });
                  setMobileMenuOpen(false);
                }}
              >
                <Text style={styles.mobileMenuItemText}>{cat.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#d4af37" />
              </TouchableOpacity>
            ))}

            <Text style={[styles.mobileMenuHeading, { marginTop: 16 }]}>COLLECTIONS</Text>
            {audienceLinks.map((aud) => (
              <TouchableOpacity
                key={aud.gender}
                style={styles.mobileMenuItem}
                onPress={() => {
                  onNavigate({
                    name: 'products',
                    params: { gender: aud.gender },
                  });
                  setMobileMenuOpen(false);
                }}
              >
                <Text style={styles.mobileMenuItemText}>{aud.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#d4af37" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.mobileMenuItem, styles.whatsappMobileItem]}
              onPress={() => {
                Linking.openURL('https://wa.me/923343451617');
                setMobileMenuOpen(false);
              }}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={styles.whatsappMobileText}>WhatsApp Concierge</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0c0d14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 100,
  },
  announcementBar: {
    backgroundColor: '#050609',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  announcementContent: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  announcementRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  announcementText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 11,
  },
  conciergeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conciergeText: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '500',
  },
  mainNav: {
    width: '100%',
    paddingHorizontal: 16,
  },
  mainNavInner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'column',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
  },
  logoSubtitle: {
    color: '#d4af37',
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: -2,
  },
  searchContainer: {
    flex: 1,
    maxWidth: 440,
    marginHorizontal: 24,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  mobileSearchContainer: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    padding: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#d4af37',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  menuButton: {
    padding: 6,
  },
  categoriesBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
  },
  categoriesInner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  categoryLink: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  activeCategoryLink: {
    borderBottomWidth: 2,
    borderBottomColor: '#d4af37',
  },
  categoryLinkText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  activeCategoryLinkText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  audienceLinks: {
    flexDirection: 'row',
    gap: 14,
  },
  audienceLink: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  activeAudienceLink: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  audienceLinkText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  activeAudienceLinkText: {
    color: '#dfba73',
    fontWeight: '600',
  },
  mobileMenu: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    gap: 6,
  },
  mobileMenuHeading: {
    fontSize: 10,
    color: '#d4af37',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  mobileMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  mobileMenuItemText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
  whatsappMobileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    borderBottomWidth: 0,
  },
  whatsappMobileText: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '600',
  },
});
