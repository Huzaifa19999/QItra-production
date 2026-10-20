import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { NavigationRoute } from '../types';

interface CartScreenProps {
  onNavigate: (route: NavigationRoute) => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onNavigate }) => {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const shippingFee = totalAmount >= 3000 || totalAmount === 0 ? 0 : 250;
  const grandTotal = totalAmount + shippingFee;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="bag-outline" size={48} color="#dfba73" />
        </View>
        <Text style={styles.emptyTitle}>Your Bag is Currently Empty</Text>
        <Text style={styles.emptySubtitle}>
          Explore our haute perfumerie, imperial couture, and fine jewelry pieces.
        </Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => onNavigate({ name: 'products' })}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreBtnText}>Discover Collections</Text>
          <Ionicons name="arrow-forward" size={16} color="#000000" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTag}>YOUR SELECTION</Text>
            <Text style={styles.headerTitle}>Shopping Bag</Text>
          </View>
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear Bag</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT ROW */}
        <View style={[styles.mainRow, isMobile && styles.mainRowMobile]}>
          {/* ITEMS LIST */}
          <View style={[styles.itemsCol, isMobile && styles.itemsColMobile]}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                {/* THUMBNAIL */}
                <TouchableOpacity
                  onPress={() =>
                    onNavigate({
                      name: 'product-detail',
                      params: { productId: item.id },
                    })
                  }
                  style={styles.thumbContainer}
                >
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Text style={styles.thumbPlaceholderText}>QITRA</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* DETAILS */}
                <View style={styles.itemDetails}>
                  <TouchableOpacity
                    onPress={() =>
                      onNavigate({
                        name: 'product-detail',
                        params: { productId: item.id },
                      })
                    }
                  >
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.itemUnitPrice}>{formatCurrency(item.price)} each</Text>

                  {/* QUANTITY & DELETE */}
                  <View style={styles.itemControlsRow}>
                    <View style={styles.qtyBox}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={14} color="#ffffff" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* LINE TOTAL */}
                <View style={styles.lineTotalCol}>
                  <Text style={styles.lineTotal}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.continueLink}
              onPress={() => onNavigate({ name: 'products' })}
            >
              <Ionicons name="arrow-back" size={16} color="#dfba73" />
              <Text style={styles.continueText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>

          {/* SUMMARY SIDEBAR */}
          <View style={[styles.summaryCol, isMobile && styles.summaryColMobile]}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nationwide Shipping</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    shippingFee === 0 && { color: '#6ee7b7' },
                  ]}
                >
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </Text>
              </View>

              {totalAmount < 3000 && (
                <Text style={styles.freeShippingNotice}>
                  Add {formatCurrency(3000 - totalAmount)} more for Free Express Delivery!
                </Text>
              )}

              <View style={styles.summaryDivider} />

              <View style={styles.summaryTotalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => onNavigate({ name: 'checkout' })}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={16} color="#000000" />
              </TouchableOpacity>

              <View style={styles.securityBox}>
                <View style={styles.securityItem}>
                  <Ionicons name="shield-checkmark" size={14} color="#dfba73" />
                  <Text style={styles.securityText}>Cash on Delivery Accepted</Text>
                </View>
                <View style={styles.securityItem}>
                  <Ionicons name="cube" size={14} color="#dfba73" />
                  <Text style={styles.securityText}>Discrete VIP Parcel Packing</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
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
    paddingVertical: 36,
    paddingBottom: 60,
  },
  inner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    minHeight: 480,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#dfba73',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exploreBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 16,
    marginBottom: 28,
  },
  headerTag: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
  mainRow: {
    flexDirection: 'row',
    gap: 32,
  },
  mainRowMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  itemsCol: {
    flex: 2,
  },
  itemsColMobile: {
    width: '100%',
  },
  itemCard: {
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  thumbContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#11121c',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbPlaceholderText: {
    color: '#4b5563',
    fontSize: 10,
    fontWeight: '700',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemUnitPrice: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 10,
  },
  itemControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 22,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  lineTotalCol: {
    alignItems: 'flex-end',
  },
  lineTotal: {
    color: '#dfba73',
    fontSize: 16,
    fontWeight: '700',
  },
  continueLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  continueText: {
    color: '#dfba73',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCol: {
    flex: 1,
  },
  summaryColMobile: {
    width: '100%',
  },
  summaryCard: {
    backgroundColor: '#0c0d14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    padding: 24,
  },
  summaryTitle: {
    color: '#dfba73',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  freeShippingNotice: {
    color: '#dfba73',
    fontSize: 11,
    marginBottom: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: '#dfba73',
    fontSize: 22,
    fontWeight: '800',
  },
  checkoutBtn: {
    backgroundColor: '#dfba73',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  checkoutBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  securityBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    color: '#9ca3af',
    fontSize: 11,
  },
});
