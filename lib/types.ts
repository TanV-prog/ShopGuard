export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  description: string;
  inStock: boolean;
}

export interface RawOrderItem {
  id: string;
  qty: number;
}

export interface ValidatedOrderItem {
  id: string;
  name: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  unit: string;
}

export type OrderStatus =
  | 'idle'
  | 'parsing'
  | 'valid'
  | 'needs_confirmation'
  | 'rejected'
  | 'no_items'
  | 'ai_error'
  | 'paypal_error'
  | 'unauthorized'
  | 'owner_approved'
  | 'paypal_created'
  | 'captured';

export interface ProcessedOrder {
  orderId: string;
  rawMessage: string;
  parsedItems: RawOrderItem[];
  validatedItems: ValidatedOrderItem[];
  totalAmount: number;
  totalFormatted: string;
  spendingLimit: number;
  isOverLimit: boolean;
  status: OrderStatus;
  statusMessage: string;
  ownerApproved: boolean;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalApprovalLink?: string;
  timestamp: string;
  auditTrail: {
    timestamp: string;
    step: string;
    status: 'pass' | 'warn' | 'fail' | 'info';
    detail: string;
  }[];
}

export interface TestResult {
  id: string;
  suite: string;
  name: string;
  description: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface TestSuiteResult {
  suiteName: string;
  total: number;
  passed: number;
  failed: number;
  tests: TestResult[];
}
