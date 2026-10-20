import { Category, Product, OrderPayload, OrderResponse } from '../types';
import { CATEGORIES, PRODUCTS } from '../data/mockData';
import { generateOrderNumber } from '../utils/format';

// Primary backend port is 5000 (Express server) with fallback to 3000 (Next.js)
const PRIMARY_URL = 'http://localhost:5000';
const NEXTJS_URL = 'http://localhost:3000';

async function fetchWithFallback(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${PRIMARY_URL}${endpoint}`, options);
    if (res.ok) return res;
  } catch {}

  try {
    const res = await fetch(`${NEXTJS_URL}${endpoint}`, options);
    if (res.ok) return res;
  } catch {}

  return null;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetchWithFallback('/api/categories', {
      headers: { 'Accept': 'application/json' },
    });
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Backend offline, fallback to mock data
  }
  return CATEGORIES;
}

export async function fetchProducts(options?: {
  category?: string;
  gender?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}): Promise<Product[]> {
  const { category, gender, search, sort } = options || {};

  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (gender && gender !== 'ALL') params.append('gender', gender);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    const res = await fetchWithFallback(`/api/products?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((p) => ({
          ...p,
          price: Number(p.price),
        }));
      }
    }
  } catch {
    // Backend offline, fallback to client-side filtering
  }

  let filtered = [...PRODUCTS];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category?.slug === category || p.category?.name.toLowerCase() === category.toLowerCase());
  }

  if (gender && gender !== 'ALL') {
    filtered = filtered.filter((p) => p.gender === gender || p.gender === 'UNISEX');
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  return filtered;
}

export async function fetchProductById(id: number): Promise<Product | null> {
  try {
    const res = await fetchWithFallback(`/api/products/${id}`);
    if (res && res.ok) {
      const data = await res.json();
      return {
        ...data,
        price: Number(data.price),
      };
    }
  } catch {
    // Backend offline
  }

  return PRODUCTS.find((p) => p.id === id) || null;
}

export async function createOrder(payload: OrderPayload): Promise<OrderResponse> {
  try {
    const res = await fetchWithFallback('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res && res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Backend offline, simulate offline order generation
  }

  // Calculate total locally
  let totalAmount = 0;
  const items = payload.items.map((it, idx) => {
    const product = PRODUCTS.find((p) => p.id === it.productId) || {
      id: it.productId,
      name: 'Product Item',
      price: 0,
      description: '',
      image: null,
      stock: 10,
      gender: 'UNISEX' as const,
      categoryId: 1,
    };
    totalAmount += product.price * it.quantity;
    return {
      id: idx + 1,
      productId: it.productId,
      quantity: it.quantity,
      price: product.price,
      product,
    };
  });

  return {
    orderNumber: generateOrderNumber(),
    customerName: payload.customerName,
    phone: payload.phone,
    whatsapp: payload.whatsapp || payload.phone,
    address: payload.address,
    city: payload.city,
    totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    items,
  };
}

export async function createProduct(productData: {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  gender?: string;
  image?: string;
}): Promise<Product> {
  try {
    const res = await fetchWithFallback('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res && res.ok) {
      const created = await res.json();
      const formatted = { ...created, price: Number(created.price) };
      PRODUCTS.unshift(formatted);
      return formatted;
    }
  } catch (e) {
    console.error('Failed to create product via API:', e);
  }

  // Local fallback
  const category = CATEGORIES.find((c) => c.id === productData.categoryId) || CATEGORIES[0];
  const newProduct: Product = {
    id: Date.now(),
    name: productData.name,
    description: productData.description,
    price: Number(productData.price),
    stock: Number(productData.stock),
    gender: (productData.gender as any) || 'UNISEX',
    categoryId: productData.categoryId,
    category,
    image: productData.image || null,
  };
  PRODUCTS.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(
  id: number,
  productData: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number;
    gender?: string;
    image?: string;
  }>
): Promise<Product> {
  try {
    const res = await fetchWithFallback(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res && res.ok) {
      const updated = await res.json();
      const formatted = { ...updated, price: Number(updated.price) };
      const idx = PRODUCTS.findIndex((p) => p.id === id);
      if (idx !== -1) PRODUCTS[idx] = formatted;
      return formatted;
    }
  } catch (e) {
    console.error('Failed to update product via API:', e);
  }

  // Local fallback
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx !== -1) {
    const category = productData.categoryId
      ? CATEGORIES.find((c) => c.id === productData.categoryId) || PRODUCTS[idx].category
      : PRODUCTS[idx].category;
    PRODUCTS[idx] = {
      ...PRODUCTS[idx],
      ...productData,
      price: productData.price !== undefined ? Number(productData.price) : PRODUCTS[idx].price,
      stock: productData.stock !== undefined ? Number(productData.stock) : PRODUCTS[idx].stock,
      category,
    };
    return PRODUCTS[idx];
  }
  throw new Error('Product not found');
}

export async function deleteProduct(id: number): Promise<{ success: boolean }> {
  try {
    const res = await fetchWithFallback(`/api/products/${id}`, {
      method: 'DELETE',
    });
    if (res && res.ok) {
      const idx = PRODUCTS.findIndex((p) => p.id === id);
      if (idx !== -1) PRODUCTS.splice(idx, 1);
      return { success: true };
    }
  } catch (e) {
    console.error('Failed to delete product via API:', e);
  }

  // Local fallback
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx !== -1) {
    PRODUCTS.splice(idx, 1);
    return { success: true };
  }
  return { success: false };
}

