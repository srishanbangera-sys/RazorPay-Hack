import {
  Product,
  Mandate,
  CheckoutProposeResponse,
  CheckoutConfirmResponse,
  AuditEvent,
  ExplainResponse,
  AgentChatResponse
} from '../types';

const API_BASE = '/api/v1';

export async function fetchProducts(params?: {
  category?: string;
  max_price?: number;
  q?: string;
  in_stock?: boolean;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.max_price) query.append('max_price', params.max_price.toString());
  if (params?.q) query.append('q', params.q);
  if (params?.in_stock !== undefined) query.append('in_stock', params.in_stock.toString());

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.items || [];
}

export async function fetchActiveMandate(): Promise<Mandate> {
  const res = await fetch(`${API_BASE}/mandates/active`);
  if (!res.ok) throw new Error('Failed to fetch active mandate');
  return res.json();
}

export async function updateMandate(
  mandateId: string,
  update: Partial<Mandate>
): Promise<Mandate> {
  const res = await fetch(`${API_BASE}/mandates/${mandateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update mandate');
  return res.json();
}

export async function proposeCheckout(
  mandateId: string,
  items: Array<{ product_id: string; quantity: number }>,
  traceId?: string
): Promise<CheckoutProposeResponse> {
  const res = await fetch(`${API_BASE}/checkout/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mandate_id: mandateId,
      items,
      trace_id: traceId,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Checkout proposal failed');
  }
  return res.json();
}

export async function confirmCheckout(
  mandateId: string,
  items: Array<{ product_id: string; quantity: number }>,
  traceId?: string
): Promise<CheckoutConfirmResponse> {
  const res = await fetch(`${API_BASE}/checkout/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mandate_id: mandateId,
      items,
      trace_id: traceId,
    }),
  });
  return res.json();
}

export async function verifyPayment(
  orderId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string,
  traceId?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
      trace_id: traceId,
    }),
  });
  return res.json();
}

export async function fetchAuditEvents(traceId?: string): Promise<AuditEvent[]> {
  const url = traceId ? `${API_BASE}/audit?trace_id=${traceId}` : `${API_BASE}/audit`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch audit events');
  const data = await res.json();
  return data.items || [];
}

export async function fetchExplain(actionId: string): Promise<ExplainResponse> {
  const res = await fetch(`${API_BASE}/explain/${actionId}`);
  if (!res.ok) throw new Error('Failed to fetch explanation');
  return res.json();
}

export async function sendAgentMessage(
  message: string,
  mandateId: string,
  conversationId: string,
  traceId?: string
): Promise<AgentChatResponse> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      mandate_id: mandateId,
      conversation_id: conversationId,
      trace_id: traceId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Agent interaction failed');
  }
  return res.json();
}
