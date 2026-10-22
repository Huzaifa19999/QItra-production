import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, Category, NavigationRoute, Gender } from '../types';
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImageFile,
} from '../services/api';
import { formatCurrency } from '../utils/format';
import { Badge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';

interface AdminProductsScreenProps {
  onNavigate: (route: NavigationRoute) => void;
}

export const AdminProductsScreen: React.FC<AdminProductsScreenProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [gender, setGender] = useState<Gender>('UNISEX');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleManualImagePick = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
          setImageUploadError('Image size exceeds 10MB limit.');
          return;
        }

        setImageUploadError('');
        setUploadingImage(true);

        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          // Set preview immediately
          setImage(base64Data);

          try {
            const uploadedUrl = await uploadImageFile(base64Data);
            if (uploadedUrl) {
              setImage(uploadedUrl);
            }
          } catch (err: any) {
            console.error('Image upload failed', err);
          } finally {
            setUploadingImage(false);
          }
        };
        reader.onerror = () => {
          setImageUploadError('Failed to read image file.');
          setUploadingImage(false);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts({ sort: 'newest' }),
        fetchCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (e) {
      console.error('Failed to load admin products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('10');
    setCategoryId(categories[0]?.id || 1);
    setGender('UNISEX');
    setImage('');
    setImageUploadError('');
    setUploadingImage(false);
    setShowUrlInput(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(String(prod.price));
    setStock(String(prod.stock));
    setCategoryId(prod.categoryId);
    setGender(prod.gender || 'UNISEX');
    setImage(prod.image || '');
    setImageUploadError('');
    setUploadingImage(false);
    setShowUrlInput(false);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid price.');
      return;
    }
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setFormError('Please enter a valid stock quantity.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setFormError('Description must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        stock: numStock,
        categoryId: Number(categoryId),
        gender,
        image: image.trim() || undefined,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        );
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (typeof window !== 'undefined') {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this creation from the catalogue?'
      );
      if (!confirmDelete) return;
    }
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {/* ADMIN SUB-NAV BAR */}
        <View style={[styles.navTabs, isMobile && styles.navTabsMobile]}>
          <View style={styles.tabGroup}>
            <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
              <Ionicons name="cube-outline" size={16} color="#dfba73" />
              <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>
                Products Catalogue
              </Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{products.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => onNavigate({ name: 'admin-orders' })}
            >
              <Ionicons name="clipboard-outline" size={16} color="#9ca3af" />
              <Text style={styles.tabBtnText}>Orders & Client Address</Text>
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

        {/* HEADER BAR */}
        <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
          <View>
            <View style={styles.tagRow}>
              <Ionicons name="sparkles" size={12} color="#dfba73" />
              <Text style={styles.tagText}>ATELIER INVENTORY</Text>
            </View>
            <Text style={styles.heading}>Product Management</Text>
              {/* <Text style={styles.subheading}>
                Direct CRUD controller connected to the TiDB/MySQL database.
              </Text> */}
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color="#000000" />
            <Text style={styles.addBtnText}>Add New Creation</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH & COUNTER */}
        <View style={[styles.toolbar, isMobile && styles.toolbarMobile]}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Filter by name, category, or audience..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Text style={styles.counterText}>
            Total: <Text style={styles.counterHighlight}>{filteredProducts.length}</Text> pieces
          </Text>
        </View>

        {/* PRODUCTS TABLE / LIST */}
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#dfba73" />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={48} color="#4b5563" />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtitle}>
              Click "Add New Creation" above to insert your first piece.
            </Text>
          </View>
        ) : (
          <View style={styles.tableCard}>
            {/* TABLE HEADER (Desktop) */}
            {!isMobile && (
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.th, { width: 60 }]}>Image</Text>
                <Text style={[styles.th, { flex: 2 }]}>Creation Name</Text>
                <Text style={[styles.th, { flex: 1 }]}>Category</Text>
                <Text style={[styles.th, { flex: 1 }]}>Audience</Text>
                <Text style={[styles.th, { flex: 1 }]}>Price</Text>
                <Text style={[styles.th, { width: 80 }]}>Stock</Text>
                <Text style={[styles.th, { width: 120, textAlign: 'right' }]}>Actions</Text>
              </View>
            )}

            {/* TABLE BODY */}
            {filteredProducts.map((p) => (
              <View key={p.id} style={[styles.tableRow, isMobile && styles.tableRowMobile]}>
                {/* THUMB */}
                <View style={styles.thumbBox}>
                  {p.image ? (
                    <Image source={{ uri: p.image }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Text style={styles.thumbPlaceholderText}>Q</Text>
                    </View>
                  )}
                </View>

                {/* NAME & INFO */}
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Text style={styles.prodName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.prodId}>ID: #{p.id}</Text>
                </View>

                {/* CATEGORY */}
                <View style={isMobile ? styles.mobileMetaCol : { flex: 1 }}>
                  <Text style={styles.cellText}>{p.category?.name || 'Exclusive'}</Text>
                </View>

                {/* AUDIENCE */}
                <View style={isMobile ? styles.mobileMetaCol : { flex: 1 }}>
                  <Badge
                    label={
                      p.gender === 'CHILDREN'
                        ? 'Kids'
                        : p.gender === 'MEN'
                        ? 'Men'
                        : p.gender === 'WOMEN'
                        ? 'Women'
                        : 'Unisex'
                    }
                    variant={p.gender === 'WOMEN' ? 'amber' : p.gender === 'MEN' ? 'sky' : 'neutral'}
                  />
                </View>

                {/* PRICE */}
                <View style={isMobile ? styles.mobileMetaCol : { flex: 1 }}>
                  <Text style={styles.priceCell}>{formatCurrency(p.price)}</Text>
                </View>

                {/* STOCK */}
                <View style={isMobile ? styles.mobileMetaCol : { width: 80 }}>
                  <Badge
                    label={`${p.stock} pcs`}
                    variant={p.stock <= 0 ? 'rose' : p.stock < 10 ? 'amber' : 'emerald'}
                  />
                </View>

                {/* ACTIONS */}
                <View style={[styles.actionButtons, isMobile && styles.actionButtonsMobile]}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(p)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={14} color="#dfba73" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(p.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={14} color="#f87171" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* RETURN BUTTON */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => onNavigate({ name: 'products' })}
        >
          <Ionicons name="arrow-back" size={16} color="#dfba73" />
          <Text style={styles.returnBtnText}>Return to Customer Storefront</Text>
        </TouchableOpacity>
      </View>

      {/* ADD / EDIT MODAL */}
      <Modal visible={modalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
            {/* MODAL HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Creation' : 'Add New Creation'}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {formError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#f87171" />
                <Text style={styles.errorBannerText}>{formError}</Text>
              </View>
            ) : null}

            {/* FORM FIELDS */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Creation Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Royal Oud Extrait"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formRow}>
              {/* CATEGORY SELECTION */}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Category</Text>
                <View style={styles.pillsRow}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.catPill,
                        categoryId === c.id && styles.catPillActive,
                      ]}
                      onPress={() => setCategoryId(c.id)}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          categoryId === c.id && styles.catPillTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* AUDIENCE / GENDER */}
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Audience</Text>
                <View style={styles.pillsRow}>
                  {(['MEN', 'WOMEN', 'CHILDREN', 'UNISEX'] as Gender[]).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.catPill, gender === g && styles.catPillActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          gender === g && styles.catPillTextActive,
                        ]}
                      >
                        {g === 'CHILDREN' ? 'Kids' : g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formRow}>
              {/* PRICE */}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Price in PKR (₨) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 18500"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              {/* STOCK */}
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Inventory Stock *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>
            </View>

            {/* MANUAL IMAGE UPLOAD */}
            <View style={styles.formGroup}>
              <View style={styles.imageLabelRow}>
                <Text style={styles.fieldLabel}>Creation Portrait (Manual Upload) *</Text>
                <TouchableOpacity
                  onPress={() => setShowUrlInput(!showUrlInput)}
                  style={styles.toggleUrlBtn}
                >
                  <Ionicons
                    name={showUrlInput ? 'cloud-upload-outline' : 'link-outline'}
                    size={12}
                    color="#dfba73"
                  />
                  <Text style={styles.toggleUrlBtnText}>
                    {showUrlInput ? 'Switch to File Upload' : 'Paste Image URL'}
                  </Text>
                </TouchableOpacity>
              </View>

              {imageUploadError ? (
                <View style={styles.imageErrorBox}>
                  <Ionicons name="warning-outline" size={14} color="#f87171" />
                  <Text style={styles.imageErrorText}>{imageUploadError}</Text>
                </View>
              ) : null}

              {showUrlInput ? (
                <TextInput
                  style={styles.input}
                  placeholder="https://images.unsplash.com/photo-..."
                  placeholderTextColor="#6b7280"
                  value={image}
                  onChangeText={setImage}
                />
              ) : image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
                  <View style={styles.imagePreviewOverlay}>
                    <View style={styles.imageReadyBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#10b981" />
                      <Text style={styles.imageReadyText}>Image Selected</Text>
                    </View>
                    <View style={styles.imagePreviewActions}>
                      <TouchableOpacity
                        style={styles.changeImageBtn}
                        onPress={handleManualImagePick}
                        disabled={uploadingImage}
                      >
                        <Ionicons name="camera-reverse-outline" size={14} color="#dfba73" />
                        <Text style={styles.changeImageText}>Change</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeImageBtn}
                        onPress={() => setImage('')}
                        disabled={uploadingImage}
                      >
                        <Ionicons name="trash-outline" size={14} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.manualUploadBox, uploadingImage && styles.btnDisabled]}
                  onPress={handleManualImagePick}
                  disabled={uploadingImage}
                  activeOpacity={0.8}
                >
                  {uploadingImage ? (
                    <View style={styles.uploadingBox}>
                      <ActivityIndicator size="small" color="#dfba73" />
                      <Text style={styles.uploadingText}>Processing & uploading image...</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadIdleBox}>
                      <View style={styles.uploadIconCircle}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#dfba73" />
                      </View>
                      <Text style={styles.uploadMainText}>
                        Click to manually choose image from device
                      </Text>
                      <Text style={styles.uploadSubText}>PNG, JPG, WEBP up to 10MB</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* DESCRIPTION */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Detailed Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Fragrance notes, materials, embroidery details..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* MODAL ACTIONS */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, submitting && styles.btnDisabled]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingProduct ? 'Save Changes' : 'Create Piece'}
                  </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  headerRowMobile: {
    flexDirection: 'column',
    gap: 16,
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
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subheading: {
    color: '#9ca3af',
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: '#dfba73',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  toolbarMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  searchBox: {
    flex: 1,
    maxWidth: 420,
    backgroundColor: '#0c0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  counterText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  counterHighlight: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tableCard: {
    backgroundColor: '#0c0d14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  th: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  mobileMetaCol: {
    marginBottom: 4,
  },
  thumbBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1b1d28',
    marginRight: 16,
  },
  thumb: {
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
    color: '#dfba73',
    fontWeight: '800',
    fontSize: 16,
  },
  prodName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  prodId: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 2,
  },
  cellText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  priceCell: {
    color: '#dfba73',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtons: {
    width: 120,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonsMobile: {
    width: '100%',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  editBtnText: {
    color: '#dfba73',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  loaderBox: {
    paddingVertical: 60,
    alignItems: 'center',
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
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  returnBtnText: {
    color: '#dfba73',
    fontSize: 13,
    fontWeight: '600',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0c0d14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    width: '100%',
    maxWidth: 580,
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
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#fda4af',
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
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
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  catPillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#dfba73',
  },
  catPillText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  catPillTextActive: {
    color: '#dfba73',
    fontWeight: '700',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#dfba73',
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },

  /* ADMIN NAV TABS */
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

  /* MANUAL IMAGE UPLOAD STYLES */
  imageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  toggleUrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleUrlBtnText: {
    color: '#dfba73',
    fontSize: 11,
    fontWeight: '600',
  },
  imageErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  imageErrorText: {
    color: '#f87171',
    fontSize: 11,
  },
  manualUploadBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIdleBox: {
    alignItems: 'center',
    gap: 6,
  },
  uploadIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadMainText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadSubText: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
  },
  uploadingBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  uploadingText: {
    color: '#dfba73',
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 140,
    backgroundColor: '#1b1d28',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(7, 8, 13, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageReadyText: {
    color: '#10b981',
    fontSize: 11.5,
    fontWeight: '600',
  },
  imagePreviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeImageText: {
    color: '#dfba73',
    fontSize: 11,
    fontWeight: '600',
  },
  removeImageBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    padding: 5,
    borderRadius: 6,
  },
});
