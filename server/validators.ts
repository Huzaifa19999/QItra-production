import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  categoryId: z.coerce.number().int().min(1, 'Category is required'),
  gender: z.enum(['MEN', 'WOMEN', 'CHILDREN', 'UNISEX']).default('UNISEX').optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  image: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
});

export const checkoutFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  whatsapp: z.string().min(10, 'Please enter a valid WhatsApp number').max(20).optional().or(z.literal('')),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500),
  city: z.string().min(2, 'City is required').max(100),
});

export const orderItemSchema = z.object({
  productId: z.number().int().min(1),
  quantity: z.number().int().min(1),
});

export const orderSchema = checkoutFormSchema.extend({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
