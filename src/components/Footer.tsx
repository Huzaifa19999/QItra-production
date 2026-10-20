import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationRoute } from '../types';

interface FooterProps {
  onNavigate: (route: NavigationRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.footer}>
      <View style={styles.inner}>
        {/* TOP BRAND SECTION */}
        <View style={[styles.grid, isMobile && styles.gridMobile]}>
          {/* BRAND COLUMN */}
          <View style={styles.brandCol}>
            <View style={styles.brandHeader}>
              <Text style={styles.brandTitle}>QITRA</Text>
              <Ionicons name="sparkles" size={14} color="#d4af37" />
            </View>
            <Text style={styles.brandSub}>HAUTE MAISON</Text>
            <Text style={styles.brandDescription}>
              Curating high-perfumerie, bespoke couture, precious gems, and luxury essentials.
              Crafted for connoisseurs of timeless elegance and distinction.
            </Text>
          </View>

          {/* QUICK LINKS */}
          <View style={styles.linksCol}>
            <Text style={styles.colTitle}>COLLECTIONS</Text>
            {['clothes', 'makeup', 'jewellery', 'perfume'].map((slug) => (
              <TouchableOpacity
                key={slug}
                onPress={() =>
                  onNavigate({
                    name: 'products',
                    params: { category: slug },
                  })
                }
                style={styles.linkItem}
              >
                <Text style={styles.linkText}>
                  {slug.charAt(0).toUpperCase() + slug.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AUDIENCE */}
          <View style={styles.linksCol}>
            <Text style={styles.colTitle}>EDITIONS</Text>
            {[
              { label: 'Men Atelier', gender: 'MEN' as const },
              { label: 'Women Atelier', gender: 'WOMEN' as const },
              { label: 'Children Collection', gender: 'CHILDREN' as const },
              { label: 'Unisex Masterpieces', gender: 'UNISEX' as const },
            ].map((aud) => (
              <TouchableOpacity
                key={aud.gender}
                onPress={() =>
                  onNavigate({
                    name: 'products',
                    params: { gender: aud.gender },
                  })
                }
                style={styles.linkItem}
              >
                <Text style={styles.linkText}>{aud.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CONCIERGE & CARE */}
          <View style={styles.linksCol}>
            <Text style={styles.colTitle}>VIP CONCIERGE</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://wa.me/923343451617')}
              style={styles.conciergeBtn}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              <Text style={styles.conciergeBtnText}>WhatsApp VIP Desk</Text>
            </TouchableOpacity>

            <View style={styles.guaranteeRow}>
              <Ionicons name="shield-checkmark" size={14} color="#d4af37" />
              <Text style={styles.guaranteeText}>100% Authentic Guaranteed</Text>
            </View>
            <View style={styles.guaranteeRow}>
              <Ionicons name="cube" size={14} color="#d4af37" />
              <Text style={styles.guaranteeText}>Discreet Nationwide Courier</Text>
            </View>
          </View>
        </View>

        {/* BOTTOM COPYRIGHT */}
        <View style={styles.bottomBar}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} QITRA Haute Maison. All rights reserved.
          </Text>
          <Text style={styles.taglineText}>The Art of Refined Luxury</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#050609',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
    marginTop: 48,
  },
  inner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 32,
    marginBottom: 40,
  },
  gridMobile: {
    flexDirection: 'column',
    gap: 28,
  },
  brandCol: {
    flex: 2,
    minWidth: 260,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
  },
  brandSub: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  brandDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 380,
  },
  linksCol: {
    flex: 1,
    minWidth: 140,
  },
  colTitle: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  linkItem: {
    paddingVertical: 6,
  },
  linkText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  conciergeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  conciergeBtnText: {
    color: '#25D366',
    fontSize: 12,
    fontWeight: '600',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  guaranteeText: {
    color: '#9ca3af',
    fontSize: 11,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  copyrightText: {
    color: '#6b7280',
    fontSize: 11,
  },
  taglineText: {
    color: '#dfba73',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
