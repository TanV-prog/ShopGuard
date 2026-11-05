import { RawOrderItem, Product, OrderStatus } from './types';
import { DEFAULT_PRODUCTS, getProductMap } from './products';

export interface ValidationResult {
  isValid: boolean;
  status: OrderStatus;
  errorMessage?: string;
  sanitizedItems: RawOrderItem[];
}

/**
 * Validates raw items extracted from the AI parser.
 * Strict rules:
 * 1. Must be a non-empty array
 * 2. Every entry must have `id` (string) and `qty` (number)
 * 3. Product `id` must exist in shop price catalog
 * 4. `qty` must be an integer between 1 and 50 (inclusive)
 * 5. Anything unknown or out of range is strictly rejected
 */
export function validateItems(
  items: unknown,
  catalog: Product[] = DEFAULT_PRODUCTS
): ValidationResult {
  if (!items || !Array.isArray(items)) {
    return {
      isValid: false,
      status: 'rejected',
      errorMessage: 'Invalid response format: expected a list of items.',
      sanitizedItems: [],
    };
  }

  if (items.length === 0) {
    return {
      isValid: false,
      status: 'no_items',
      errorMessage: 'No recognized items found in your order request.',
      sanitizedItems: [],
    };
  }

  const productMap = getProductMap(catalog);
  const aggregated = new Map<string, number>();

  for (let i = 0; i < items.length; i++) {
    const entry = items[i];
    if (typeof entry !== 'object' || entry === null) {
      return {
        isValid: false,
        status: 'rejected',
        errorMessage: `Item at index ${i} is not a valid object.`,
        sanitizedItems: [],
      };
    }

    const { id, qty } = entry as Record<string, unknown>;

    if (typeof id !== 'string' || id.trim() === '') {
      return {
        isValid: false,
        status: 'rejected',
        errorMessage: `Item at index ${i} has an invalid or missing product ID.`,
        sanitizedItems: [],
      };
    }

    const cleanId = id.trim().toLowerCase();
    if (!productMap.has(cleanId)) {
      return {
        isValid: false,
        status: 'no_items',
        errorMessage: `Product "${id}" is not sold by this shop.`,
        sanitizedItems: [],
      };
    }

    if (typeof qty !== 'number' || !Number.isInteger(qty)) {
      return {
        isValid: false,
        status: 'rejected',
        errorMessage: `Quantity for "${id}" must be a whole integer (got ${qty}).`,
        sanitizedItems: [],
      };
    }

    if (qty < 1) {
      return {
        isValid: false,
        status: 'rejected',
        errorMessage: `Quantity for "${id}" must be at least 1 (got ${qty}).`,
        sanitizedItems: [],
      };
    }

    if (qty > 50) {
      return {
        isValid: false,
        status: 'rejected',
        errorMessage: `Quantity for "${id}" exceeds maximum allowable limit of 50 units (got ${qty}).`,
        sanitizedItems: [],
      };
    }

    const existingQty = aggregated.get(cleanId) || 0;
    const combinedQty = existingQty + qty;

    if (combinedQty > 50) {
      return {
        isValid: false,
        status: 'rejected',
        errorMessage: `Combined quantity for "${cleanId}" exceeds maximum limit of 50 units (got ${combinedQty}).`,
        sanitizedItems: [],
      };
    }

    aggregated.set(cleanId, combinedQty);
  }

  const sanitizedItems: RawOrderItem[] = Array.from(aggregated.entries()).map(([id, qty]) => ({
    id,
    qty,
  }));

  return {
    isValid: true,
    status: 'valid',
    sanitizedItems,
  };
}
