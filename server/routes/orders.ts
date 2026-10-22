import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { orderSchema } from '../validators';
import { sendOrderConfirmation } from '../whatsapp';
import { OrderStatus } from '@prisma/client';

const router = Router();

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `ORD-${year}${month}${day}-${randomStr}`;
}

// GET /api/orders
router.get('/', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const orderId = parseInt(idParam, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = orderSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { customerName, phone, whatsapp, address, city, items } = result.data;

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Product ID ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = Number(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });

      // Decrement stock
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - item.quantity,
        },
      });
    }

    // Add shipping if applicable (free over 3000)
    const shippingFee = totalAmount >= 3000 ? 0 : 250;
    const grandTotal = totalAmount + shippingFee;

    const orderNumber = generateOrderNumber();

    const orderResult = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        phone,
        whatsapp: whatsapp || phone,
        address,
        city,
        totalAmount: grandTotal,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Attempt WhatsApp confirmation asynchronously
    sendOrderConfirmation(orderResult as any).catch((err) =>
      console.error('Failed to trigger WhatsApp notification:', err)
    );

    return res.status(201).json(orderResult);
  } catch (error: any) {
    console.error('Failed to process order:', error);
    return res.status(500).json({ error: error.message || 'Failed to place order' });
  }
});

// PATCH /api/orders/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const orderId = parseInt(idParam, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { status, address, city, customerName, phone, whatsapp } = req.body;
    const updateData: any = {};

    if (status) {
      const validStatuses: OrderStatus[] = [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ];

      if (!validStatuses.includes(status as OrderStatus)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updateData.status = status as OrderStatus;
    }

    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.json(order);
  } catch (error) {
    console.error('Failed to update order:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
