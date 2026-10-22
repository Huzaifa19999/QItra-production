import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationRoute, OrderResponse, OrderStatus } from '../types';
import { fetchOrders, updateOrder } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';

interface AdminOrdersScreenProps {
  onNavigate: (route: NavigationRoute) => void;
}

const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export const AdminOrdersScreen: React.FC<AdminOrdersScreenProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');

  // Updating Status state
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Address Edit Modal State
  const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null);
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (order: OrderResponse, newStatus: OrderStatus) => {
    if (order.status === newStatus) return;
    const orderId = order.id;
    if (!orderId) return;

    setUpdatingId(orderId);
    try {
      const updated = await updateOrder(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setToastMessage(`✓ Order #${order.orderNumber} successfully set to ${newStatus}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error('Failed to update status', err);
      setToastMessage(`Failed to update status: ${err?.message || 'Server error'}`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setUpdatingId(null);
    }
  };

  const openAddressEdit = (order: OrderResponse) => {
    setEditingOrder(order);
    setEditAddress(order.address);
    setEditCity(order.city);
    setEditCustomerName(order.customerName);
    setEditPhone(order.phone);
    setAddressError('');
  };

  const handleSaveAddress = async () => {
    if (!editingOrder || !editingOrder.id) return;
    if (!editAddress.trim()) {
      setAddressError('Delivery address is required.');
      return;
    }
    if (!editCity.trim()) {
      setAddressError('City is required.');
      return;
    }

    setSavingAddress(true);
    setAddressError('');
    try {
      const updated = await updateOrder(editingOrder.id, {
        address: editAddress.trim(),
        city: editCity.trim(),
        customerName: editCustomerName.trim() || editingOrder.customerName,
        phone: editPhone.trim() || editingOrder.phone,
      });

      setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? updated : o)));
      setEditingOrder(null);
    } catch (err: any) {
      setAddressError(err?.message || 'Failed to update address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (st: OrderStatus) => {
    switch (st) {
      case 'PENDING':
        return { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' };
      case 'CONFIRMED':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
      case 'PROCESSING':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
      case 'SHIPPED':
        return { bg: 'rgba(212, 175, 55, 0.18)', text: '#dfba73', border: 'rgba(212, 175, 55, 0.4)' };
      case 'DELIVERED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'CANCELLED':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' };
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const inTransitCount = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* STATUS UPDATE TOAST */}
        {toastMessage && (
          <View style={styles.toastBanner}>
            <Ionicons name="sparkles" size={16} color="#dfba73" />
            <Text style={styles.toastBannerText}>{toastMessage}</Text>
            <TouchableOpacity onPress={() => setToastMessage(null)} style={{ padding: 4 }}>
              <Ionicons name="close" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        )}

        {/* ADMIN SUB-NAV BAR */}
        <View style={[styles.navTabs, isMobile && styles.navTabsMobile]}>
          <View style={styles.tabGroup}>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => onNavigate({ name: 'admin-products' })}
            >
              <Ionicons name="cube-outline" size={16} color="#9ca3af" />
              <Text style={styles.tabBtnText}>Products Catalogue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
              <Ionicons name="clipboard-outline" size={16} color="#dfba73" />
              <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>
                Orders & Client Address
              </Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{orders.length}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <Ionicons name="person-circle-outline" size={18} color="#dfba73" />
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || 'admin@perfumestore.com'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                await logout();
                onNavigate({ name: 'login' });
              }}
            >
              <Ionicons name="log-out-outline" size={15} color="#f87171" />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SCREEN TITLE */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.tagRow}>
              <Ionicons name="sparkles" size={12} color="#dfba73" />
              <Text style={styles.tagText}>CLIENT FULFILLMENT</Text>
            </View>
            <Text style={styles.heading}>Order Status & Client Address</Text>
            <Text style={styles.subheading}>
              Inspect delivery destinations, update order processing state, or edit client shipping addresses.
            </Text>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={loadOrders} activeOpacity={0.8}>
            <Ionicons name="reload" size={15} color="#000000" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* METRICS ROW */}
        <View style={[styles.metricsRow, isMobile && styles.metricsRowMobile]}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <Text style={styles.metricValue}>{orders.length}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pending Action</Text>
            <Text style={[styles.metricValue, { color: '#facc15' }]}>{pendingCount}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>In Transit / Shipped</Text>
            <Text style={[styles.metricValue, { color: '#38bdf8' }]}>{inTransitCount}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Delivered</Text>
            <Text style={[styles.metricValue, { color: '#34d399' }]}>{deliveredCount}</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Net Revenue</Text>
            <Text style={[styles.metricValue, { color: '#dfba73' }]}>
              {formatCurrency(totalRevenue)}
            </Text>
          </View>
        </View>

        {/* FILTERS & SEARCH */}
        <View style={[styles.toolbar, isMobile && styles.toolbarMobile]}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Order #, client name, city, address, or phone..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* STATUS PILLS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusPillsRow}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                statusFilter === 'ALL' && styles.filterPillActive,
              ]}
              onPress={() => setStatusFilter('ALL')}
            >
              <Text
                style={[
                  styles.filterPillText,
                  statusFilter === 'ALL' && styles.filterPillTextActive,
                ]}
              >
                All ({orders.length})
              </Text>
            </TouchableOpacity>

            {ALL_STATUSES.map((st) => {
              const count = orders.filter((o) => o.status === st).length;
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.filterPill,
                    statusFilter === st && styles.filterPillActive,
                  ]}
                  onPress={() => setStatusFilter(st)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      statusFilter === st && styles.filterPillTextActive,
                    ]}
                  >
                    {st} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ORDERS LIST */}
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#dfba73" />
            <Text style={styles.loaderText}>Loading client orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="file-tray-outline" size={48} color="#4b5563" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no orders matching the selected filter criteria.
            </Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              const isUpdating = updatingId === order.id;

              return (
                <View key={order.id || order.orderNumber} style={styles.orderCard}>
                  {/* CARD HEADER */}
                  <View style={[styles.orderHeader, isMobile && styles.orderHeaderMobile]}>
                    <View style={styles.orderHeaderLeft}>
                      <View style={styles.orderNumberRow}>
                        <Ionicons name="receipt-outline" size={18} color="#dfba73" />
                        <Text style={styles.orderNumberText}>{order.orderNumber}</Text>
                      </View>
                      <Text style={styles.orderDateText}>
                        Placed on {formatDate(order.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.orderHeaderRight}>
                      {order.status === 'PENDING' && (
                        <TouchableOpacity
                          style={styles.quickConfirmBtn}
                          onPress={() => handleStatusChange(order, 'CONFIRMED')}
                          disabled={isUpdating}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark-circle" size={15} color="#000000" />
                          <Text style={styles.quickConfirmBtnText}>Confirm Order</Text>
                        </TouchableOpacity>
                      )}

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: statusStyle.bg,
                            borderColor: statusStyle.border,
                          },
                        ]}
                      >
                        <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                          ● {order.status}
                        </Text>
                      </View>
                      <Text style={styles.orderTotalAmount}>
                        {formatCurrency(order.totalAmount)}
                      </Text>
                    </View>
                  </View>

                  {/* MAIN BODY: 2 COLUMNS (CLIENT ADDRESS vs ORDERED ITEMS) */}
                  <View style={[styles.orderBody, isMobile && styles.orderBodyMobile]}>
                    {/* CLIENT ADDRESS SECTION */}
                    <View style={styles.clientAddressCol}>
                      <View style={styles.sectionHeadingRow}>
                        <Ionicons name="location-outline" size={16} color="#dfba73" />
                        <Text style={styles.sectionHeadingText}>CLIENT DELIVERY ADDRESS</Text>
                        <TouchableOpacity
                          style={styles.editAddressLink}
                          onPress={() => openAddressEdit(order)}
                        >
                          <Ionicons name="pencil-outline" size={13} color="#dfba73" />
                          <Text style={styles.editAddressLinkText}>Edit Address</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.addressBox}>
                        <View style={styles.clientDetailRow}>
                          <Ionicons name="person-outline" size={14} color="#9ca3af" />
                          <Text style={styles.clientNameText}>{order.customerName}</Text>
                        </View>

                        <View style={styles.clientDetailRow}>
                          <Ionicons name="home-outline" size={14} color="#9ca3af" />
                          <Text style={styles.clientAddressText}>
                            {order.address}
                          </Text>
                        </View>

                        <View style={styles.clientDetailRow}>
                          <Ionicons name="business-outline" size={14} color="#9ca3af" />
                          <Text style={styles.clientCityText}>
                            City:{' '}
                            <Text style={styles.cityHighlight}>{order.city || 'Standard Shipping'}</Text>
                          </Text>
                        </View>

                        {/* PHONE & WHATSAPP CHAT BUTTON */}
                        <View style={styles.contactRow}>
                          <View style={styles.phoneBadge}>
                            <Ionicons name="call-outline" size={13} color="#dfba73" />
                            <Text style={styles.phoneText}>{order.phone}</Text>
                          </View>

                          {order.whatsapp ? (
                            <TouchableOpacity
                              style={styles.whatsappChatBtn}
                              onPress={() =>
                                Linking.openURL(
                                  `https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`
                                )
                              }
                            >
                              <Ionicons name="logo-whatsapp" size={13} color="#ffffff" />
                              <Text style={styles.whatsappChatBtnText}>WhatsApp Client</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    {/* ITEMS LIST */}
                    <View style={styles.itemsCol}>
                      <View style={styles.sectionHeadingRow}>
                        <Ionicons name="bag-handle-outline" size={16} color="#dfba73" />
                        <Text style={styles.sectionHeadingText}>
                          ORDER ITEMS ({order.items?.length || 0})
                        </Text>
                      </View>

                      <View style={styles.itemsList}>
                        {order.items?.map((item, idx) => (
                          <View key={item.id || idx} style={styles.itemRow}>
                            <View style={styles.itemThumbBox}>
                              {item.product?.image ? (
                                <Image
                                  source={{ uri: item.product.image }}
                                  style={styles.itemThumb}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={styles.itemThumbPlaceholder}>
                                  <Text style={styles.itemThumbPlaceholderText}>Q</Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.itemDetails}>
                              <Text style={styles.itemName} numberOfLines={1}>
                                {item.product?.name || `Product #${item.productId}`}
                              </Text>
                              <Text style={styles.itemMeta}>
                                Qty: <Text style={styles.itemMetaBold}>{item.quantity}</Text> ×{' '}
                                {formatCurrency(item.price)}
                              </Text>
                            </View>

                            <Text style={styles.itemSubtotal}>
                              {formatCurrency(item.price * item.quantity)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* MANUAL STATUS UPDATE CONTROLLER */}
                  <View style={styles.statusActionRow}>
                    <View style={styles.statusActionLabelRow}>
                      <Ionicons name="swap-horizontal-outline" size={14} color="#dfba73" />
                      <Text style={styles.statusActionLabel}>MANUALLY UPDATE ORDER STATUS:</Text>
                      {isUpdating && <ActivityIndicator size="small" color="#dfba73" />}
                    </View>

                    <View style={styles.statusBtnGroup}>
                      {ALL_STATUSES.map((st) => {
                        const isCurrent = order.status === st;
                        const conf = getStatusColor(st);
                        return (
                          <TouchableOpacity
                            key={st}
                            style={[
                              styles.statusSelectBtn,
                              isCurrent && {
                                backgroundColor: conf.bg,
                                borderColor: conf.text,
                              },
                              isUpdating && styles.btnDisabled,
                            ]}
                            disabled={isUpdating}
                            onPress={() => handleStatusChange(order, st)}
                          >
                            <Text
                              style={[
                                styles.statusSelectBtnText,
                                isCurrent && { color: conf.text, fontWeight: '700' },
                              ]}
                            >
                              {isCurrent ? `✓ ${st}` : st}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* EDIT CLIENT ADDRESS MODAL */}
      <Modal visible={!!editingOrder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Update Client Delivery Address</Text>
                <Text style={styles.modalSubtitle}>Order #{editingOrder?.orderNumber}</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingOrder(null)}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {addressError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#f87171" />
                <Text style={styles.errorBannerText}>{addressError}</Text>
              </View>
            ) : null}

            {/* CUSTOMER NAME */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Client Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editCustomerName}
                onChangeText={setEditCustomerName}
                placeholder="Recipient name"
                placeholderTextColor="#6b7280"
              />
            </View>

            {/* PHONE */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Contact Phone / WhatsApp</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+92 300 0000000"
                placeholderTextColor="#6b7280"
              />
            </View>

            {/* STREET ADDRESS */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Complete Shipping Address *</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="House / Apartment #, Street, Sector / Area"
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* CITY */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>City / Destination *</Text>
              <TextInput
                style={styles.modalInput}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                placeholderTextColor="#6b7280"
              />
            </View>

            {/* ACTIONS */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingOrder(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveAddressBtn, savingAddress && styles.btnDisabled]}
                onPress={handleSaveAddress}
                disabled={savingAddress}
              >
                {savingAddress ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.saveAddressBtnText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 36,
    paddingBottom: 60,
  },
  inner: {
    maxWidth: 1300,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: 20,
  },
  navTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c0d14',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 28,
  },
  navTabsMobile: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  tabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  tabBtnText: {
    color: '#9ca3af',
    fontSize: 12.5,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#dfba73',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#dfba73',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 2,
  },
  tabBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userEmail: {
    color: '#d1d5db',
    fontSize: 12,
    maxWidth: 180,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 11.5,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heading: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 4,
  },
  subheading: {
    color: '#9ca3af',
    fontSize: 13,
    maxWidth: 680,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dfba73',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricsRowMobile: {
    flexDirection: 'column',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0c0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
  },
  metricLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  toolbar: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  toolbarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#0c0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  statusPillsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#dfba73',
  },
  filterPillText: {
    color: '#9ca3af',
    fontSize: 11.5,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#dfba73',
    fontWeight: '700',
  },
  loaderBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  ordersList: {
    gap: 20,
  },
  orderCard: {
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  orderHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  orderHeaderLeft: {
    gap: 4,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orderDateText: {
    color: '#6b7280',
    fontSize: 11.5,
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orderTotalAmount: {
    color: '#dfba73',
    fontSize: 16,
    fontWeight: '800',
  },
  orderBody: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  orderBodyMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  clientAddressCol: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  itemsCol: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 8,
  },
  sectionHeadingText: {
    color: '#dfba73',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.5,
    flex: 1,
    marginLeft: 6,
  },
  editAddressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  editAddressLinkText: {
    color: '#dfba73',
    fontSize: 10.5,
    fontWeight: '700',
  },
  addressBox: {
    gap: 8,
  },
  clientDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  clientNameText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  clientAddressText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  clientCityText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  cityHighlight: {
    color: '#ffffff',
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  phoneText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '500',
  },
  whatsappChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#128C7E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  whatsappChatBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemThumbBox: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#1b1d28',
    overflow: 'hidden',
  },
  itemThumb: {
    width: '100%',
    height: '100%',
  },
  itemThumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemThumbPlaceholderText: {
    color: '#dfba73',
    fontWeight: '700',
    fontSize: 14,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '600',
  },
  itemMeta: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  itemMetaBold: {
    color: '#dfba73',
    fontWeight: '700',
  },
  itemSubtotal: {
    color: '#d1d5db',
    fontSize: 12.5,
    fontWeight: '600',
  },
  statusActionRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 14,
    gap: 10,
  },
  statusActionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusActionLabel: {
    color: '#dfba73',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusBtnGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusSelectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusSelectBtnText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.5,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0c0d14',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    width: '100%',
    maxWidth: 520,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  modalCardMobile: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#dfba73',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#fda4af',
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  modalTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 12.5,
    fontWeight: '600',
  },
  saveAddressBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#dfba73',
  },
  saveAddressBtnText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '700',
  },
  quickConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dfba73',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: '#dfba73',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  quickConfirmBtnText: {
    color: '#000000',
    fontSize: 11.5,
    fontWeight: '800',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#111422',
    borderWidth: 1,
    borderColor: '#dfba73',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#dfba73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  toastBannerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
