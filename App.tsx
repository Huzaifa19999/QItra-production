import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CartProvider, useCart } from './src/context/CartContext';
import { NavigationRoute, ScreenName } from './src/types';
import { Header } from './src/components/Header';
import { Footer } from './src/components/Footer';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { OrderConfirmationScreen } from './src/screens/OrderConfirmationScreen';

function MainApp() {
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute>({ name: 'home' });
  const { lastAddedName, clearLastAddedNotification } = useCart();
  const scrollViewRef = useRef<ScrollView>(null);

  // Web Browser History Synchronization
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handlePopState = (e: PopStateEvent) => {
        if (e.state && e.state.route) {
          setCurrentRoute(e.state.route);
        } else {
          // Parse current URL path
          const path = window.location.pathname;
          const searchParams = new URLSearchParams(window.location.search);
          if (path.includes('/cart')) {
            setCurrentRoute({ name: 'cart' });
          } else if (path.includes('/checkout')) {
            setCurrentRoute({ name: 'checkout' });
          } else if (path.includes('/order-confirmation')) {
            setCurrentRoute({
              name: 'order-confirmation',
              params: { orderNumber: searchParams.get('orderNumber') || undefined },
            });
          } else if (path.includes('/product/')) {
            const id = parseInt(path.split('/product/')[1], 10);
            if (!isNaN(id)) {
              setCurrentRoute({ name: 'product-detail', params: { productId: id } });
            }
          } else if (path.includes('/products')) {
            setCurrentRoute({
              name: 'products',
              params: {
                category: searchParams.get('category') || undefined,
                gender: (searchParams.get('gender') as any) || undefined,
                search: searchParams.get('search') || undefined,
              },
            });
          } else {
            setCurrentRoute({ name: 'home' });
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const navigate = (route: NavigationRoute) => {
    setCurrentRoute(route);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      let url = '/';
      if (route.name === 'products') {
        const params = new URLSearchParams();
        if (route.params?.category) params.set('category', route.params.category);
        if (route.params?.gender) params.set('gender', route.params.gender);
        if (route.params?.search) params.set('search', route.params.search);
        url = `/products${params.toString() ? `?${params.toString()}` : ''}`;
      } else if (route.name === 'product-detail') {
        url = `/product/${route.params?.productId}`;
      } else if (route.name === 'cart') {
        url = '/cart';
      } else if (route.name === 'checkout') {
        url = '/checkout';
      } else if (route.name === 'order-confirmation') {
        url = `/order-confirmation${
          route.params?.orderNumber ? `?orderNumber=${route.params.orderNumber}` : ''
        }`;
      }
      window.history.pushState({ route }, '', url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderScreen = () => {
    switch (currentRoute.name) {
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'products':
        return (
          <ProductsScreen
            category={currentRoute.params?.category}
            gender={currentRoute.params?.gender}
            search={currentRoute.params?.search}
            onNavigate={navigate}
          />
        );
      case 'product-detail':
        return (
          <ProductDetailScreen
            productId={currentRoute.params?.productId || 1}
            onNavigate={navigate}
          />
        );
      case 'cart':
        return <CartScreen onNavigate={navigate} />;
      case 'checkout':
        return <CheckoutScreen onNavigate={navigate} />;
      case 'order-confirmation':
        return (
          <OrderConfirmationScreen
            orderNumber={currentRoute.params?.orderNumber}
            onNavigate={navigate}
          />
        );
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <View style={styles.appWrapper}>
      <StatusBar style="light" />

      {/* LUXURY TOAST POPUP */}
      {lastAddedName && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <View style={styles.toastLeft}>
              <Ionicons name="bag-check" size={18} color="#10b981" />
              <View>
                <Text style={styles.toastTitle}>Added to Luxury Bag</Text>
                <Text style={styles.toastItemName} numberOfLines={1}>
                  {lastAddedName}
                </Text>
              </View>
            </View>
            <View style={styles.toastActions}>
              <TouchableOpacity
                onPress={() => {
                  clearLastAddedNotification();
                  navigate({ name: 'cart' });
                }}
                style={styles.toastViewBtn}
              >
                <Text style={styles.toastViewText}>View Bag</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearLastAddedNotification}
                style={styles.toastCloseBtn}
              >
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* UNIFIED SCROLLABLE PAGE CONTAINER */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* HEADER */}
        <Header
          onNavigate={navigate}
          activeScreen={currentRoute.name}
          activeCategory={currentRoute.params?.category}
          activeGender={currentRoute.params?.gender}
        />

        {/* ACTIVE SCREEN CONTENT */}
        <View style={styles.screenWrapper}>{renderScreen()}</View>

        {/* FOOTER */}
        <Footer onNavigate={navigate} />
      </ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07080d',
  },
  appWrapper: {
    flex: 1,
    backgroundColor: '#07080d',
    minHeight: '100%' as any,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    display: 'flex' as any,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  screenWrapper: {
    flex: 1,
  },
  toastContainer: {
    position: 'fixed' as any,
    top: 24,
    right: 24,
    zIndex: 9999,
  },
  toastCard: {
    backgroundColor: '#0c0d14',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    minWidth: 280,
  },
  toastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toastTitle: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  toastItemName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 160,
  },
  toastActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastViewBtn: {
    backgroundColor: '#dfba73',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  toastViewText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  toastCloseBtn: {
    padding: 4,
  },
});
