import { Product, RawOrderItem, ValidatedOrderItem } from './types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'mangoes',
    name: 'Alphonso Mangoes (Ratnagiri)',
    price: 5.50,
    unit: 'kg',
    category: 'Fresh Produce',
    description: 'Sweet, fragrant GI-tagged Ratnagiri Alphonso mangoes.',
    inStock: true,
  },
  {
    id: 'pickle',
    name: 'Homemade Mango Pickle',
    price: 5.50,
    unit: 'jar',
    category: 'Pantry',
    description: 'Sun-cured traditional spiced mango pickle in mustard oil.',
    inStock: true,
  },
  {
    id: 'ghee',
    name: 'Pure A2 Desi Cow Ghee',
    price: 14.00,
    unit: 'jar',
    category: 'Dairy & Pantry',
    description: 'Bilona-churned golden grass-fed cow ghee (500ml).',
    inStock: true,
  },
  {
    id: 'saffron',
    name: 'Kashmiri Mongra Saffron',
    price: 18.00,
    unit: 'box',
    category: 'Spices',
    description: 'Grade A1 pure all-red stigma Kashmiri saffron threads (1g).',
    inStock: true,
  },
  {
    id: 'chai_mix',
    name: 'Masala Chai Spice Blend',
    price: 4.50,
    unit: 'pack',
    category: 'Beverages',
    description: 'Crushed cardamom, ginger, cinnamon, clove artisan blend (200g).',
    inStock: true,
  },
  {
    id: 'basmati',
    name: 'Aged Royal Basmati Rice',
    price: 6.00,
    unit: 'kg',
    category: 'Grains',
    description: '2-year Himalayan aged extra-long grain fragrant basmati rice.',
    inStock: true,
  },
  {
    id: 'turmeric',
    name: 'Organic Lakadong Turmeric',
    price: 4.00,
    unit: 'pack',
    category: 'Spices',
    description: 'High curcumin (7.5%) wild turmeric powder from Meghalaya (250g).',
    inStock: true,
  },
];

export function getProductMap(catalog: Product[] = DEFAULT_PRODUCTS): Map<string, Product> {
  const map = new Map<string, Product>();
  for (const p of catalog) {
    map.set(p.id.toLowerCase(), p);
  }
  return map;
}

/**
 * Deterministic pricing function.
 * Adds price * quantity directly from the shop's price list.
 * Returns both the numerical sum and standard 2-decimal string like "16.50".
 */
export function calculateTotal(
  items: RawOrderItem[],
  catalog: Product[] = DEFAULT_PRODUCTS
): { totalAmount: number; totalFormatted: string; lineItems: ValidatedOrderItem[] } {
  const productMap = getProductMap(catalog);
  let totalCents = 0;
  const lineItems: ValidatedOrderItem[] = [];

  for (const item of items) {
    const product = productMap.get(item.id.toLowerCase());
    if (!product) continue;

    // Use cents arithmetic to prevent floating-point rounding errors
    const unitPriceCents = Math.round(product.price * 100);
    const lineTotalCents = unitPriceCents * item.qty;
    totalCents += lineTotalCents;

    lineItems.push({
      id: product.id,
      name: product.name,
      unitPrice: product.price,
      qty: item.qty,
      lineTotal: lineTotalCents / 100,
      unit: product.unit,
    });
  }

  const totalAmount = totalCents / 100;
  const totalFormatted = totalAmount.toFixed(2);

  return {
    totalAmount,
    totalFormatted,
    lineItems,
  };
}
