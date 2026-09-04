export interface Product {
  id: string;
  name: string;
  brand?: string;
  description?: string;
  category: string;
  product_type?: string;
  price: number;
  cost_price?: number;
  stock: number;
  rating?: number;
  sales_count?: number;
  views?: number;
  conversion_rate?: number;
  color?: string;
  sizes_or_capacity?: string;
  specification?: string;
  stock_status?: string;
  attributes?: Record<string, any>;
}

export interface MandateState {
  id: string;
  merchant_id: string;
  max_amount: number;
  spent_amount: number;
  available_amount: number;
  allowed_categories: string[];
  max_items_per_order: number;
  expires_at: string;
  time_remaining_formatted: string;
  time_remaining_seconds: number;
  status: string;
  is_active: boolean;
  payment_source: string;
  currency_symbol: string;
}

export interface AuditEvent {
  id: string;
  trace_id: string;
  timestamp: string;
  actor: string;
  event_type: string;
  action: string;
  decision: string;
  reason_code?: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  order_id?: string;
  payment_id?: string;
}

export interface SafetyGateStep {
  gate_id: string;
  title: string;
  label: string;
  status: "passed" | "blocked" | "pending";
  is_blocking_point?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "buyer" | "agent";
  text: string;
  timestamp: string;
  trace_id?: string;
  action_id?: string;
  component_type?: "carousel" | "approved_card" | "rejected_card" | "comparison" | null;
  carousel_products?: Product[];
  upsell_item?: Product | null;
  failure_details?: {
    cart_total: number;
    max_amount: number;
    difference: number;
    items_count: number;
    reason: string;
    code: string;
    alternative_price?: number;
  } | null;
  alternative_product?: Product | null;
  order_id?: string | null;
  cart_total?: number | null;
}

export interface CheckoutProposeResponse {
  allowed: boolean;
  decision_code: string;
  message: string;
  cart_total: number;
  total_items: number;
  items: Array<{
    product: Product;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  details: Record<string, any>;
  trace_id: string;
  action_id: string;
}

export interface CheckoutConfirmResponse {
  success: boolean;
  allowed: boolean;
  decision_code: string;
  message: string;
  order_id?: string;
  cart_total: number;
  razorpay_order?: {
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
    merchant_name: string;
    is_mock: boolean;
  };
  details: Record<string, any>;
  trace_id: string;
}
