import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationRoute } from '../types';

interface OrderConfirmationScreenProps {
  orderNumber?: string;
  onNavigate: (route: NavigationRoute) => void;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  orderNumber,
  onNavigate,
}) => {
  const handleWhatsAppContact = () => {
    const text = orderNumber
      ? `Hello Qitra Maison, I placed an order with Order Number: ${orderNumber}. Please confirm my delivery status.`
      : 'Hello Qitra Maison, I would like to inquire about my order.';
    Linking.openURL(`https://wa.me/923343451617?text=${encodeURIComponent(text)}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* CHECKMARK ICON */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={36} color="#10b981" />
        </View>

        <Text style={styles.tag}>ORDER PLACED SUCCESSFULLY</Text>
        <Text style={styles.title}>Thank You for Your Order</Text>

        <Text style={styles.subtitle}>
          Your bespoke selection is currently being prepared at our atelier. Your luxury
          journey begins here.
        </Text>

        {orderNumber ? (
          <View style={styles.orderNumberBox}>
            <Text style={styles.orderNumberLabel}>ORDER NUMBER</Text>
            <Text style={styles.orderNumberValue}>{orderNumber}</Text>
          </View>
        ) : null}

        {/* WHATSAPP REASSURANCE & CONTACT */}
        <TouchableOpacity
          style={styles.whatsAppBox}
          onPress={handleWhatsAppContact}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <Text style={styles.whatsAppText}>
            You will receive live dispatch tracking via WhatsApp. Tap here to chat with our
            concierge.
          </Text>
        </TouchableOpacity>

        {/* RETURN BUTTON */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => onNavigate({ name: 'home' })}
          activeOpacity={0.8}
        >
          <Text style={styles.returnBtnText}>Return to Maison</Text>
          <Ionicons name="arrow-forward" size={16} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 550,
    backgroundColor: '#07080d',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  card: {
    backgroundColor: '#0c0d14',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 24,
    padding: 36,
    maxWidth: 540,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center' as any,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  tag: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  orderNumberBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  orderNumberLabel: {
    color: '#6b7280',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  orderNumberValue: {
    color: '#dfba73',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  whatsAppBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(37, 211, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 28,
  },
  whatsAppText: {
    color: '#a7f3d0',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  returnBtn: {
    backgroundColor: '#dfba73',
    borderRadius: 9999,
    paddingHorizontal: 28,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  returnBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
});
