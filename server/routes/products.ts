import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { productSchema } from '../validators';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, sort, gender } = req.query;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    let where: any = {};
    if (category && category !== 'all') {
      where.category = { slug: String(category) };
    }
    if (search && String(search).trim()) {
      where.name = { contains: String(search).trim() };
    }
    if (gender && gender !== 'ALL') {
      where.gender = String(gender);
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
      },
    });

    const formatted = products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = productSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { name, description, price, stock, categoryId, image, gender } = result.data;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        image,
        gender: (gender as any) || 'UNISEX',
      },
      include: { category: true },
    });

    return res.status(201).json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const result = productSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { name, description, price, stock, categoryId, image, gender } = result.data;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        image,
        ...(gender && { gender: gender as any }),
      },
      include: { category: true },
    });

    return res.json({
      ...product,
      price: Number(product.price),
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
