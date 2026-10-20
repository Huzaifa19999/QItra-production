import React, { useState } from 'react';
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

const COLLECTIONS = [
  { label: 'Clothes', slug: 'clothes' },
  { label: 'Makeup', slug: 'makeup' },
  { label: 'Jewellery', slug: 'jewellery' },
  { label: 'Perfume', slug: 'perfume' },
];

const EDITIONS = [
  { label: 'Men', gender: 'MEN' as const },
  { label: 'Women', gender: 'WOMEN' as const },
  { label: 'Children', gender: 'CHILDREN' as const },
  { label: 'Unisex', gender: 'UNISEX' as const },
];

const TRUST_BADGES = [
  { icon: 'shield-checkmark' as const, label: '100% Authentic' },
  { icon: 'cube' as const, label: 'Discreet Courier' },
  { icon: 'cash' as const, label: 'Cash on Delivery' },
  { icon: 'lock-closed' as const, label: 'Secure Orders' },
];

function HoverLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.linkItem}
      // @ts-ignore — web-only props
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Text style={[styles.linkText, hovered && styles.linkTextHovered]}>
        {label}
      </Text>
      {hovered && <View style={styles.linkUnderline} />}
    </TouchableOpacity>
  );
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width < 1024;

  return (
    <View style={styles.footer}>
      {/* GOLD TOP ACCENT */}
      <View style={styles.goldAccentBar} />

      <View style={styles.inner}>
        {/* TRUST BADGES STRIP */}
        <View style={[styles.badgeStrip, isMobile && styles.badgeStripMobile]}>
          {TRUST_BADGES.map((b) => (
            <View key={b.label} style={[styles.badgeItem, isMobile && styles.badgeItemMobile]}>
              <Ionicons name={b.icon} size={16} color="#d4af37" />
              <Text style={styles.badgeLabel}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* GOLD DIVIDER */}
        <View style={styles.goldDivider} />

        {/* MAIN GRID */}
        <View style={[styles.grid, isTablet && styles.gridTablet, isMobile && styles.gridMobile]}>
          {/* ── BRAND COLUMN ── */}
          <View style={[styles.brandCol, isMobile && styles.brandColMobile]}>
            <View style={styles.brandLogoRow}>
              <Text style={styles.brandTitle}>QITRA</Text>
              <Ionicons name="sparkles" size={16} color="#d4af37" />
            </View>
            <Text style={styles.brandSub}>HAUTE MAISON · EST. MMXXIV</Text>
            <Text style={styles.brandDescription}>
              Curating high-perfumerie, bespoke couture, precious gems, and
              luxury essentials. Crafted for connoisseurs of timeless elegance
              and distinction.
            </Text>

            {/* WHATSAPP CTA */}
            <TouchableOpacity
              onPress={() => Linking.openURL('https://wa.me/923002785474')}
              style={styles.whatsappBtn}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <View>
                <Text style={styles.whatsappBtnTitle}>Contact Us</Text>
                <Text style={styles.whatsappBtnSub}>+92 300 2785474</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── NAVIGATION LINK COLUMNS WRAPPER FOR TABLET/MOBILE ── */}
          <View style={[styles.linksGrid, isMobile && styles.linksGridMobile]}>
            {/* ── COLLECTIONS ── */}
            <View style={styles.linksCol}>
              <View style={styles.colTitleRow}>
                <Text style={styles.colTitle}>COLLECTIONS</Text>
                <View style={styles.colTitleLine} />
              </View>
              {COLLECTIONS.map((c) => (
                <HoverLink
                  key={c.slug}
                  label={c.label}
                  onPress={() =>
                    onNavigate({ name: 'products', params: { category: c.slug } })
                  }
                />
              ))}
            </View>

            {/* ── EDITIONS ── */}
            <View style={styles.linksCol}>
              <View style={styles.colTitleRow}>
                <Text style={styles.colTitle}>EDITIONS</Text>
                <View style={styles.colTitleLine} />
              </View>
              {EDITIONS.map((e) => (
                <HoverLink
                  key={e.gender}
                  label={e.label}
                  onPress={() =>
                    onNavigate({ name: 'products', params: { gender: e.gender } })
                  }
                />
              ))}
            </View>

            {/* ── SERVICES ── */}
            <View style={styles.linksCol}>
              <View style={styles.colTitleRow}>
                <Text style={styles.colTitle}>SERVICES</Text>
                <View style={styles.colTitleLine} />
              </View>
              {[
                { label: 'Browse All Products', route: { name: 'products' as const } },
                { label: 'Your Cart', route: { name: 'cart' as const } },
              ].map((item) => (
                <HoverLink
                  key={item.label}
                  label={item.label}
                  onPress={() => onNavigate(item.route)}
                />
              ))}

              {/* COD BADGE */}
              <View style={styles.codBadge}>
                <Ionicons name="cash-outline" size={14} color="#d4af37" />
                <Text style={styles.codBadgeText}>Cash on Delivery</Text>
              </View>

              {/* NATIONWIDE BADGE */}
              <View style={[styles.codBadge, { marginTop: 8 }]}>
                <Ionicons name="bicycle-outline" size={14} color="#d4af37" />
                <Text style={styles.codBadgeText}>Nationwide Delivery</Text>
              </View>
            </View>
          </View>
        </View>

        {/* THIN GOLD DIVIDER */}
        <View style={styles.thinDivider} />

        {/* BOTTOM BAR */}
        <View style={[styles.bottomBar, isMobile && styles.bottomBarMobile]}>
          <View style={styles.bottomLeft}>
            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} QITRA Haute Maison. All rights reserved.
            </Text>
          </View>

          <View style={styles.bottomCenter}>
            <Text style={styles.taglineText}>✦ The Art of Refined Luxury ✦</Text>
          </View>

          <View style={styles.bottomRight}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://wa.me/923343451617')}
              style={styles.socialIcon}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="mail-outline" size={16} color="#d4af37" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const GOLD = '#d4af37';
const GOLD_LIGHT = '#dfba73';
const BG = '#050609';
const TEXT_MUTED = '#9ca3af';
const TEXT_LINK = '#c9cdd6';

const styles = StyleSheet.create({
  footer: {
    backgroundColor: BG,
    marginTop: 56,
  },
  goldAccentBar: {
    height: 2,
    backgroundColor: GOLD,
    opacity: 0.85,
  },
  inner: {
    maxWidth: 1320,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    // paddingBottom: 28,
  },

  /* ─── TRUST BADGE STRIP ─── */
  badgeStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 16,
  },
  badgeStripMobile: {
    justifyContent: 'space-between',
    gap: 10,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
  },
  badgeItemMobile: {
    flex: 1,
    minWidth: '46%',
    justifyContent: 'center',
  },
  badgeLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  /* ─── DIVIDERS ─── */
  goldDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
    marginVertical: 28,
  },
  thinDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 28,
    marginBottom: 20,
  },

  /* ─── MAIN GRID ─── */
  grid: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'space-between',
  },
  gridTablet: {
    flexDirection: 'column',
    gap: 32,
  },
  gridMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  linksGrid: {
    flexDirection: 'row',
    gap: 32,
    flex: 3,
    justifyContent: 'space-between',
  },
  linksGridMobile: {
    flexDirection: 'column',
    gap: 28,
  },

  /* ─── BRAND COLUMN ─── */
  brandCol: {
    flex: 2,
    minWidth: 240,
  },
  brandColMobile: {
    flex: 1,
    minWidth: '100%',
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 5,
  },
  brandSub: {
    color: GOLD,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  brandDescription: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 22,
    maxWidth: '100%',
    marginBottom: 20,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#128C7E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  whatsappBtnTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  whatsappBtnSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 1,
  },

  /* ─── LINKS COLUMNS ─── */
  linksCol: {
    flex: 1,
    minWidth: 130,
  },
  colTitleRow: {
    marginBottom: 16,
  },
  colTitle: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  colTitleLine: {
    width: 28,
    height: 1.5,
    backgroundColor: GOLD,
    opacity: 0.6,
    borderRadius: 2,
  },
  linkItem: {
    paddingVertical: 7,
  },
  linkText: {
    color: TEXT_LINK,
    fontSize: 13,
    lineHeight: 18,
  },
  linkTextHovered: {
    color: GOLD_LIGHT,
  },
  linkUnderline: {
    height: 1,
    width: '100%',
    backgroundColor: GOLD_LIGHT,
    opacity: 0.5,
    marginTop: 2,
  },

  /* ─── COD / SERVICE BADGES ─── */
  codBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  codBadgeText: {
    color: GOLD_LIGHT,
    fontSize: 11,
    fontWeight: '600',
  },

  /* ─── BOTTOM BAR ─── */
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  bottomBarMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  bottomLeft: {},
  bottomCenter: {},
  bottomRight: {
    flexDirection: 'row',
    gap: 10,
  },
  copyrightText: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
  },
  taglineText: {
    color: GOLD,
    fontSize: 11,
    fontStyle: 'italic',
    opacity: 0.8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});