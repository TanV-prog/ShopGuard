import {
  ProcessedOrder,
  RawOrderItem,
  Product,
  OrderStatus,
} from './types';
import { DEFAULT_PRODUCTS, calculateTotal } from './products';
import { validateItems } from './validator';
import {
  DEFAULT_SPENDING_LIMIT,
  DEFAULT_OWNER_PIN,
  evaluateGuardrail,
  authorizeOverLimitOrder,
} from './guardrail';

export async function processCustomerMessage(params: {
  message: string;
  catalog?: Product[];
  spendingLimit?: number;
}): Promise<ProcessedOrder> {
  const { message, catalog = DEFAULT_PRODUCTS, spendingLimit = DEFAULT_SPENDING_LIMIT } = params;
  const orderId = `SG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const auditTrail: ProcessedOrder['auditTrail'] = [];

  auditTrail.push({
    timestamp: new Date().toISOString(),
    step: '1. Message Ingestion',
    status: 'info',
    detail: `Received customer text: "${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`,
  });

  // 1. Call AI Parser (Server route or local fallback)
  let rawItems: RawOrderItem[] = [];
  try {
    const parseRes = await fetch('/api/parse-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, catalog }),
    });

    if (!parseRes.ok) {
      throw new Error(`Parser returned HTTP ${parseRes.status}`);
    }

    const parseData = await parseRes.json();
    rawItems = parseData.items || [];

    auditTrail.push({
      timestamp: new Date().toISOString(),
      step: '2. Gemini Language Understanding',
      status: rawItems.length > 0 ? 'pass' : 'warn',
      detail: `Parser extracted ${rawItems.length} candidate item(s) via ${parseData.methodUsed || 'gemini-3.8-flash'}. The AI was never shown prices or monetary math.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI error';
    auditTrail.push({
      timestamp: new Date().toISOString(),
      step: '2. Gemini Language Understanding',
      status: 'fail',
      detail: `Parser communication failed: ${errorMsg}`,
    });

    return {
      orderId,
      rawMessage: message,
      parsedItems: [],
      validatedItems: [],
      totalAmount: 0,
      totalFormatted: '0.00',
      spendingLimit,
      isOverLimit: false,
      status: 'ai_error',
      statusMessage: 'Temporary parsing error. Please retry or contact merchant.',
      ownerApproved: false,
      timestamp: now,
      auditTrail,
    };
  }

  // 2. Validate Items (Strict safety checks)
  const validation = validateItems(rawItems, catalog);
  if (!validation.isValid) {
    auditTrail.push({
      timestamp: new Date().toISOString(),
      step: '3. Safety Validation',
      status: 'fail',
      detail: `Rejected by safety validator: ${validation.errorMessage}`,
    });

    return {
      orderId,
      rawMessage: message,
      parsedItems: rawItems,
      validatedItems: [],
      totalAmount: 0,
      totalFormatted: '0.00',
      spendingLimit,
      isOverLimit: false,
      status: validation.status,
      statusMessage: validation.errorMessage || 'Order items could not be validated.',
      ownerApproved: false,
      timestamp: now,
      auditTrail,
    };
  }

  auditTrail.push({
    timestamp: new Date().toISOString(),
    step: '3. Safety Validation',
    status: 'pass',
    detail: `Validation passed: All ${validation.sanitizedItems.length} items exist in shop catalog and quantities are within integer bounds (1..50).`,
  });

  // 3. Price Calculation (Deterministic Code)
  const { totalAmount, totalFormatted, lineItems } = calculateTotal(
    validation.sanitizedItems,
    catalog
  );

  auditTrail.push({
    timestamp: new Date().toISOString(),
    step: '4. Deterministic Pricing',
    status: 'pass',
    detail: `Calculated total $${totalFormatted} USD from official price list. No LLM arithmetic involved.`,
  });

  // 4. Guardrail Check
  const guardrail = evaluateGuardrail(totalAmount, spendingLimit);

  if (guardrail.isOverLimit) {
    auditTrail.push({
      timestamp: new Date().toISOString(),
      step: '5. Spending Guardrail',
      status: 'warn',
      detail: `STOPPED: Order total $${totalFormatted} USD strictly exceeds limit of $${spendingLimit.toFixed(2)} USD. PayPal checkout blocked pending Owner PIN.`,
    });

    return {
      orderId,
      rawMessage: message,
      parsedItems: validation.sanitizedItems,
      validatedItems: lineItems,
      totalAmount,
      totalFormatted,
      spendingLimit,
      isOverLimit: true,
      status: 'needs_confirmation',
      statusMessage: guardrail.message,
      ownerApproved: false,
      timestamp: now,
      auditTrail,
    };
  }

  auditTrail.push({
    timestamp: new Date().toISOString(),
    step: '5. Spending Guardrail',
    status: 'pass',
    detail: `PASSED: Total $${totalFormatted} USD is within merchant limit of $${spendingLimit.toFixed(2)} USD. Cleared for PayPal checkout.`,
  });

  return {
    orderId,
    rawMessage: message,
    parsedItems: validation.sanitizedItems,
    validatedItems: lineItems,
    totalAmount,
    totalFormatted,
    spendingLimit,
    isOverLimit: false,
    status: 'valid',
    statusMessage: 'Order verified and cleared for payment.',
    ownerApproved: false,
    timestamp: now,
    auditTrail,
  };
}

export function handleOwnerApproval(params: {
  order: ProcessedOrder;
  pin: string;
  expectedPin?: string;
  catalog?: Product[];
}): ProcessedOrder {
  const {
    order,
    pin,
    expectedPin = DEFAULT_OWNER_PIN,
    catalog = DEFAULT_PRODUCTS,
  } = params;

  const auth = authorizeOverLimitOrder({
    pin,
    expectedPin,
    items: order.parsedItems,
    catalog,
  });

  const updatedAudit = [...order.auditTrail];

  if (!auth.success) {
    updatedAudit.push({
      timestamp: new Date().toISOString(),
      step: '6. Owner Approval Check',
      status: 'fail',
      detail: `Authorization denied: ${auth.message}`,
    });

    return {
      ...order,
      status: 'unauthorized',
      statusMessage: auth.message,
      auditTrail: updatedAudit,
    };
  }

  updatedAudit.push({
    timestamp: new Date().toISOString(),
    step: '6. Owner Approval Check',
    status: 'pass',
    detail: `Owner PIN verified via constant-time comparison. Items re-validated. Order unlocked for PayPal checkout.`,
  });

  return {
    ...order,
    status: 'owner_approved',
    statusMessage: auth.message,
    ownerApproved: true,
    auditTrail: updatedAudit,
  };
}
