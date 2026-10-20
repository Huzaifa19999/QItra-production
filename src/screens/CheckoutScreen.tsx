import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { createOrder } from '../services/api';
import { NavigationRoute } from '../types';

interface CheckoutScreenProps {
  onNavigate: (route: NavigationRoute) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onNavigate }) => {
  const { items, totalAmount, clearCart } = useCart();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    whatsapp: '',
    city: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const shippingFee = totalAmount >= 3000 || totalAmount === 0 ? 0 : 250;
  const grandTotal = totalAmount + shippingFee;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => onNavigate({ name: 'cart' })}
        >
          <Text style={styles.backBtnText}>Return to Bag</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Please provide your full name';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Please provide a valid contact number';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Phone number must be at least 10 digits';
    }
    if (!formData.city.trim()) {
      errs.city = 'Please specify your city';
    }
    if (!formData.address.trim()) {
      errs.address = 'Please provide complete delivery street address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        items: items.map((it) => ({
          productId: it.id,
          quantity: it.quantity,
        })),
      };

      const order = await createOrder(orderPayload);
      clearCart();
      onNavigate({
        name: 'order-confirmation',
        params: { orderNumber: order.orderNumber },
      });
    } catch (err: any) {
      setApiError(err?.message || 'Failed to complete order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => onNavigate({ name: 'cart' })}
          >
            <Ionicons name="arrow-back" size={16} color="#dfba73" />
            <Text style={styles.backLinkText}>Return to Bag</Text>
          </TouchableOpacity>
          <Text style={styles.headerTag}>MAISON ATELIER</Text>
          <Text style={styles.headerTitle}>Secure Checkout</Text>
          <Text style={styles.headerSubtitle}>
            Complete your delivery details for complimentary VIP dispatch.
          </Text>
        </View>

        {apiError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#f87171" />
            <Text style={styles.errorText}>{apiError}</Text>
          </View>
        ) : null}

        {/* MAIN ROW */}
        <View style={[styles.mainRow, isMobile && styles.mainRowMobile]}>
          {/* FORM COLUMN */}
          <View style={[styles.formCol, isMobile && styles.formColMobile]}>
            <View style={styles.card}>
              <Text style={styles.cardHeading}>DELIVERY DETAILS</Text>

              {/* FULL NAME */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={[styles.input, errors.customerName && styles.inputError]}
                  placeholder="e.g. Shahmeer Khan"
                  placeholderTextColor="#6b7280"
                  value={formData.customerName}
                  onChangeText={(val) => {
                    setFormData({ ...formData, customerName: val });
                    if (errors.customerName) setErrors({ ...errors, customerName: '' });
                  }}
                />
                {errors.customerName && (
                  <Text style={styles.fieldError}>{errors.customerName}</Text>
                )}
              </View>

              {/* CONTACT NUMBER */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Contact Phone Number *</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  placeholder="e.g. 0300 1234567"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(val) => {
                    setFormData({ ...formData, phone: val });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                />
                {errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}
              </View>

              {/* WHATSAPP */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>WhatsApp Number (Optional, for order tracking)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 0300 1234567 (same as above if blank)"
                  placeholderTextColor="#6b7280"
                  keyboardType="phone-pad"
                  value={formData.whatsapp}
                  onChangeText={(val) => setFormData({ ...formData, whatsapp: val })}
                />
              </View>

              {/* CITY */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={[styles.input, errors.city && styles.inputError]}
                  placeholder="e.g. Lahore, Karachi, Islamabad..."
                  placeholderTextColor="#6b7280"
                  value={formData.city}
                  onChangeText={(val) => {
                    setFormData({ ...formData, city: val });
                    if (errors.city) setErrors({ ...errors, city: '' });
                  }}
                />
                {errors.city && <Text style={styles.fieldError}>{errors.city}</Text>}
              </View>

              {/* ADDRESS */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Complete Delivery Address *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.address && styles.inputError,
                  ]}
                  placeholder="House/Apartment number, street name, sector / area"
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={3}
                  value={formData.address}
                  onChangeText={(val) => {
                    setFormData({ ...formData, address: val });
                    if (errors.address) setErrors({ ...errors, address: '' });
                  }}
                />
                {errors.address && <Text style={styles.fieldError}>{errors.address}</Text>}
              </View>

              {/* PAYMENT SELECTION */}
              <View style={styles.paymentBox}>
                <Text style={styles.paymentTitle}>PAYMENT METHOD</Text>
                <View style={styles.paymentOption}>
                  <Ionicons name="checkmark-circle" size={20} color="#dfba73" />
                  <View style={styles.paymentOptionText}>
                    <Text style={styles.paymentMethodName}>
                      Cash on Delivery (COD)
                    </Text>
                    <Text style={styles.paymentMethodDesc}>
                      Pay with cash when courier delivers the luxury parcel to your address.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* SUMMARY REVIEW COLUMN */}
          <View style={[styles.summaryCol, isMobile && styles.summaryColMobile]}>
            <View style={styles.summaryCard}>
              <Text style={styles.cardHeading}>REVIEW SELECTION ({items.length})</Text>

              <View style={styles.reviewItemsList}>
                {items.map((it) => (
                  <View key={it.id} style={styles.reviewItem}>
                    <View style={styles.reviewItemLeft}>
                      <Text style={styles.reviewItemName} numberOfLines={1}>
                        {it.name}
                      </Text>
                      <Text style={styles.reviewItemQty}>Qty: {it.quantity}</Text>
                    </View>
                    <Text style={styles.reviewItemPrice}>
                      {formatCurrency(it.price * it.quantity)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.summaryDivider} />

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

              <View style={styles.summaryDivider} />

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Payable Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
              </View>

              <TouchableOpacity
                style={[styles.placeOrderBtn, submitting && styles.btnDisabled]}
                onPress={handlePlaceOrder}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={16} color="#000000" />
                    <Text style={styles.placeOrderBtnText}>Confirm Order (COD)</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.vipGuarantee}>
                <Ionicons name="sparkles" size={14} color="#dfba73" />
                <Text style={styles.vipGuaranteeText}>
                  Complimentary order confirmation & live dispatch updates sent via WhatsApp.
                </Text>
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
  header: {
    marginBottom: 28,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backLinkText: {
    color: '#dfba73',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  errorText: {
    color: '#fda4af',
    fontSize: 12,
  },
  mainRow: {
    flexDirection: 'row',
    gap: 32,
  },
  mainRowMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  formCol: {
    flex: 2,
  },
  formColMobile: {
    width: '100%',
  },
  card: {
    backgroundColor: '#0c0d14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
  },
  cardHeading: {
    color: '#dfba73',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    outlineStyle: 'none' as any,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.05)',
  },
  fieldError: {
    color: '#f87171',
    fontSize: 11,
    marginTop: 4,
  },
  paymentBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 16,
  },
  paymentTitle: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentMethodName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentMethodDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
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
  reviewItemsList: {
    gap: 10,
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  reviewItemName: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
  },
  reviewItemQty: {
    color: '#9ca3af',
    fontSize: 11,
  },
  reviewItemPrice: {
    color: '#dfba73',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  grandTotalLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  grandTotalValue: {
    color: '#dfba73',
    fontSize: 22,
    fontWeight: '800',
  },
  placeOrderBtn: {
    backgroundColor: '#dfba73',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  placeOrderBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  vipGuarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderRadius: 8,
    padding: 10,
  },
  vipGuaranteeText: {
    color: '#dfba73',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
