export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  attributes?: Record<string, any>;
  created_at?: string;
}

export interface Mandate {
  id: string;
  merchant_id: string;
  max_amount: number;
  allowed_categories: string[];
  max_items_per_order: number;
  expires_at: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface CartItemDetail {
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CheckoutProposeResponse {
  allowed: boolean;
  decision_code: string;
  message: string;
  cart_total: number;
  total_items: number;
  items: CartItemDetail[];
  details: Record<string, any>;
  trace_id: string;
  action_id: string;
}

export interface RazorpayOrderDetails {
  order_id: string;
  amount: number;
  currency: string;
  key_id?: string;
  merchant_name: string;
  is_mock: boolean;
}

export interface CheckoutConfirmResponse {
  success: boolean;
  allowed: boolean;
  decision_code: string;
  message: string;
  order_id?: string;
  cart_total: number;
  razorpay_order?: RazorpayOrderDetails;
  details: Record<string, any>;
  trace_id: string;
}

export interface AuditEvent {
  id: string;
  trace_id: string;
  timestamp: string;
  actor: 'buyer' | 'agent' | 'backend' | 'mandate_engine' | 'payment';
  event_type: string;
  action: string;
  decision: 'approved' | 'rejected' | 'info';
  reason_code?: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  order_id?: string;
  payment_id?: string;
}

export interface ExplainResponse {
  action_id: string;
  decision: string;
  code: string;
  explanation: string;
  details: Record<string, any>;
}

export interface ToolCallRecord {
  tool: string;
  input: Record<string, any>;
  output: Record<string, any>;
}

export interface AgentChatResponse {
  message: string;
  conversation_id: string;
  trace_id: string;
  tools_invoked: ToolCallRecord[];
  products_considered: Product[];
  proposed_cart: CartItemDetail[];
  cart_total?: number;
  mandate_decision?: {
    allowed: boolean;
    decision_code: string;
    message: string;
    cart_total: number;
    details: Record<string, any>;
  };
  order_id?: string;
  alternative_product?: Product;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'agent';
  text: string;
  timestamp: Date;
  tools?: ToolCallRecord[];
  decision?: {
    allowed: boolean;
    code: string;
    details?: Record<string, any>;
  };
  orderId?: string;
  alternativeProduct?: Product;
  traceId?: string;
}
