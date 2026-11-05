import { OrderStatus, RawOrderItem, Product } from './types';
import { validateItems } from './validator';
import { calculateTotal, DEFAULT_PRODUCTS } from './products';

export const DEFAULT_SPENDING_LIMIT = 50.00;
export const DEFAULT_OWNER_PIN = '1234';

/**
 * Constant-time string comparison to prevent timing attacks on the owner PIN.
 * Mimics Python's hmac.compare_digest.
 */
export function comparePinConstantTime(providedPin: string, correctPin: string): boolean {
  if (typeof providedPin !== 'string' || typeof correctPin !== 'string') {
    return false;
  }

  // To prevent length leak, we pad or hash, or iterate uniformly
  const a = Buffer.from(providedPin);
  const b = Buffer.from(correctPin);

  if (a.length !== b.length) {
    // Constant-time dummy comparison so time doesn't vary with length difference
    let diff = a.length ^ b.length;
    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ (b[i % b.length] || 0);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

export interface GuardrailDecision {
  isOverLimit: boolean;
  totalAmount: number;
  spendingLimit: number;
  status: OrderStatus;
  message: string;
}

/**
 * Evaluates whether an order total exceeds the merchant spending guardrail.
 * If total > limit, stops execution and requires owner authorization.
 */
export function evaluateGuardrail(
  totalAmount: number,
  spendingLimit: number = DEFAULT_SPENDING_LIMIT
): GuardrailDecision {
  const isOverLimit = totalAmount > spendingLimit;

  if (isOverLimit) {
    return {
      isOverLimit: true,
      totalAmount,
      spendingLimit,
      status: 'needs_confirmation',
      message: `Order total ($${totalAmount.toFixed(2)}) exceeds the spending limit ($${spendingLimit.toFixed(2)}). Shop owner PIN authorization required.`,
    };
  }

  return {
    isOverLimit: false,
    totalAmount,
    spendingLimit,
    status: 'valid',
    message: `Order total ($${totalAmount.toFixed(2)}) is within the spending limit ($${spendingLimit.toFixed(2)}). Ready for payment.`,
  };
}

/**
 * Owner authorization with constant-time PIN comparison and item re-validation.
 */
export function authorizeOverLimitOrder(params: {
  pin: string;
  expectedPin: string;
  items: RawOrderItem[];
  catalog?: Product[];
}): {
  success: boolean;
  status: OrderStatus;
  message: string;
} {
  const { pin, expectedPin, items, catalog = DEFAULT_PRODUCTS } = params;

  // 1. Constant-time PIN verification
  const isPinValid = comparePinConstantTime(pin.trim(), expectedPin.trim());
  if (!isPinValid) {
    return {
      success: false,
      status: 'unauthorized',
      message: 'Incorrect owner PIN. High-value order remains locked.',
    };
  }

  // 2. Defense in Depth: Re-validate all items before approval
  const validation = validateItems(items, catalog);
  if (!validation.isValid) {
    return {
      success: false,
      status: validation.status,
      message: `Security re-validation failed: ${validation.errorMessage}`,
    };
  }

  const { totalFormatted } = calculateTotal(validation.sanitizedItems, catalog);

  return {
    success: true,
    status: 'owner_approved',
    message: `Owner approval confirmed. Order for $${totalFormatted} authorized for checkout.`,
  };
}
