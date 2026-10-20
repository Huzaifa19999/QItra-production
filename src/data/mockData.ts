import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Clothes',
    slug: 'clothes',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    productCount: 5,
  },
  {
    id: 2,
    name: 'Makeup',
    slug: 'makeup',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    productCount: 5,
  },
  {
    id: 3,
    name: 'Jewellery',
    slug: 'jewellery',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    productCount: 5,
  },
  {
    id: 4,
    name: 'Perfume',
    slug: 'perfume',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
    productCount: 5,
  },
];

export const PRODUCTS: Product[] = [
  // Clothes
  {
    id: 1,
    name: 'Velvet Embroidered Sherwani',
    description:
      'Opulent midnight black velvet sherwani adorned with handcrafted zardozi and antique tilla embroidery. Designed for gala evenings and royal celebrations.',
    price: 38500,
    stock: 15,
    gender: 'MEN',
    categoryId: 1,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800',
    category: CATEGORIES[0],
  },
  {
    id: 2,
    name: 'Silk Chiffon Evening Gown',
    description:
      'Ethereal emerald silk chiffon gown with delicate crystal beadwork along the neckline and an elongated flowing silhouette.',
    price: 29000,
    stock: 20,
    gender: 'WOMEN',
    categoryId: 1,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
    category: CATEGORIES[0],
  },
  {
    id: 3,
    name: 'Artisanal Embroidered Kurta Set',
    description:
      'Pure raw silk tailored kurta set featuring subtle thread embroidery, mother-of-pearl buttons, and tailored trousers.',
    price: 16500,
    stock: 35,
    gender: 'MEN',
    categoryId: 1,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
    category: CATEGORIES[0],
  },
  {
    id: 4,
    name: 'Pure Cashmere Pashmina Shawl',
    description:
      'Hand-spun and hand-woven luxury cashmere shawl with intricate Kashmiri sozni floral borders. Incomparable warmth and softness.',
    price: 22000,
    stock: 25,
    gender: 'UNISEX',
    categoryId: 1,
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800',
    category: CATEGORIES[0],
  },
  {
    id: 5,
    name: 'Little Prince Junior Kurta',
    description:
      'Soft cotton kurta set for boys featuring delicate hand embroidery and comfortable fit for festive occasions.',
    price: 4500,
    stock: 60,
    gender: 'CHILDREN',
    categoryId: 1,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    category: CATEGORIES[0],
  },

  // Makeup
  {
    id: 6,
    name: 'Velvet Matte Lip Rouge',
    description:
      'Ultra-pigmented, feather-light matte lipstick enriched with French camellia oil for 16-hour velvety comfort and couture color payoff.',
    price: 4800,
    stock: 80,
    gender: 'WOMEN',
    categoryId: 2,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
    category: CATEGORIES[1],
  },
  {
    id: 7,
    name: 'Luminous Silk Foundation',
    description:
      'Award-winning fluid foundation delivering seamless medium buildable coverage with an imperceptible satin skin-like finish.',
    price: 8500,
    stock: 65,
    gender: 'WOMEN',
    categoryId: 2,
    image: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?w=800',
    category: CATEGORIES[1],
  },
  {
    id: 8,
    name: '24K Celestial Glow Highlighter',
    description:
      'Micro-milled baked powder highlighter infused with reflective gold pearls for an ethereal, glass-like multidimensional radiance.',
    price: 6200,
    stock: 50,
    gender: 'UNISEX',
    categoryId: 2,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
    category: CATEGORIES[1],
  },
  {
    id: 9,
    name: 'Royal Amber Eyeshadow Palette',
    description:
      '12 richly pigmented pans spanning decadent metallics, buttery foils, and velvet mattes inspired by desert sunsets and warm amber.',
    price: 9800,
    stock: 40,
    gender: 'WOMEN',
    categoryId: 2,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
    category: CATEGORIES[1],
  },
  {
    id: 10,
    name: 'Cotton Candy Lip Gloss Set',
    description:
      'Playful and sweet flavored lip gloss trio with spun sugar, bubblegum, and vanilla elements. Safe and hypoallergenic.',
    price: 1800,
    stock: 150,
    gender: 'CHILDREN',
    categoryId: 2,
    image: 'https://images.unsplash.com/photo-1608528577891-eb0558e80718?w=800',
    category: CATEGORIES[1],
  },

  // Jewellery
  {
    id: 11,
    name: 'Emerald Solitaire Diamond Ring',
    description:
      'Spectacular 2.5-carat Zambian emerald center stone framed by brilliant-cut pavé diamonds set in handcrafted 18K yellow gold.',
    price: 85000,
    stock: 8,
    gender: 'WOMEN',
    categoryId: 3,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    category: CATEGORIES[2],
  },
  {
    id: 12,
    name: 'Kundan Polki Choker Necklace',
    description:
      'Heritage bridal choker featuring uncut polki stones, meenakari reverse detailing, and cluster pearl hangings with gold plating.',
    price: 120000,
    stock: 5,
    gender: 'WOMEN',
    categoryId: 3,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    category: CATEGORIES[2],
  },
  {
    id: 13,
    name: 'Pearl & Gold Filigree Drop Earrings',
    description:
      'Lustrous South Sea baroque pearls suspended from delicate hand-carved floral filigree tops in 18K solid yellow gold.',
    price: 34000,
    stock: 18,
    gender: 'WOMEN',
    categoryId: 3,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
    category: CATEGORIES[2],
  },
  {
    id: 14,
    name: '18K Solid Gold Textured Bangle',
    description:
      'Minimalist statement bangle crafted with artisanal hammered texture and a secure hidden clasp for effortless timeless stacking.',
    price: 68000,
    stock: 12,
    gender: 'UNISEX',
    categoryId: 3,
    image: 'https://images.unsplash.com/photo-1611591475860-264663e2e0e5?w=800',
    category: CATEGORIES[2],
  },
  {
    id: 15,
    name: 'Rainbow Charm Bracelet',
    description:
      'Colorful beaded charm bracelet with playful enamel pendants. Adjustable clasp fits young wrists comfortably.',
    price: 2200,
    stock: 100,
    gender: 'CHILDREN',
    categoryId: 3,
    image: 'https://images.unsplash.com/photo-1611591475860-264663e2e0e5?w=800',
    category: CATEGORIES[2],
  },

  // Perfume
  {
    id: 16,
    name: 'Oud Noir Intense',
    description:
      'A deep, dark woodsy fragrance with hints of leather, cardamom, and smoky Cambodian agarwood. Perfect for evening wear.',
    price: 12500,
    stock: 50,
    gender: 'MEN',
    categoryId: 4,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
    category: CATEGORIES[3],
  },
  {
    id: 17,
    name: 'Rose De Mai',
    description:
      'A luxurious bouquet of fresh Grasse roses, French jasmine, powdery iris, and a gentle base of crystalline white musk.',
    price: 9500,
    stock: 60,
    gender: 'WOMEN',
    categoryId: 4,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800',
    category: CATEGORIES[3],
  },
  {
    id: 18,
    name: 'Sandalwood Reserve',
    description:
      'Creamy Mysore sandalwood, gentle cracked cardamom, cedarwood atlas, and soft Florentine iris. Elegant and understated.',
    price: 11000,
    stock: 80,
    gender: 'UNISEX',
    categoryId: 4,
    image: 'https://images.unsplash.com/photo-1519669011783-4eaa95fa1b7d?w=800',
    category: CATEGORIES[3],
  },
  {
    id: 19,
    name: 'Azure Marine',
    description:
      'Fresh aquatic notes blended with Italian bergamot, salty ocean breeze, sea kelp, and crisp Virginian cedar.',
    price: 6800,
    stock: 120,
    gender: 'MEN',
    categoryId: 4,
    image: 'https://images.unsplash.com/photo-1523293115678-d2902f5027a0?w=800',
    category: CATEGORIES[3],
  },
  {
    id: 20,
    name: 'Sweet Berry Kids Fragrance',
    description:
      'A fun, light fragrance with strawberry and marshmallow notes. Alcohol-free and gentle for young ones.',
    price: 2500,
    stock: 200,
    gender: 'CHILDREN',
    categoryId: 4,
    image: 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?w=800',
    category: CATEGORIES[3],
  },
];
