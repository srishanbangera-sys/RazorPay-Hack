import {
  MandateState,
  AuditEvent,
  CheckoutProposeResponse,
  CheckoutConfirmResponse,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8008/api/v1";

export async function fetchMandateState(mandateId?: string): Promise<MandateState> {
  const url = mandateId 
    ? `${API_BASE}/mandates/${mandateId}/state` 
    : `${API_BASE}/mandates/active/state`;
  
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    // Fallback baseline state matching Figma mockup if backend is starting
    return {
      id: "mandate_travel",
      merchant_id: "merchant_demo",
      max_amount: 800,
      spent_amount: 389,
      available_amount: 411,
      allowed_categories: ["Travel gear", "Office", "Electronics"],
      max_items_per_order: 4,
      expires_at: new Date(Date.now() + 2.6 * 86400000).toISOString(),
      time_remaining_formatted: "02d : 14h : 08m",
      time_remaining_seconds: 224000,
      status: "active",
      is_active: true,
      payment_source: "Operations wallet • 8042",
      currency_symbol: "$",
    };
  }
  return res.json();
}

export async function sendAgentMessage(
  message: string,
  mandateId: string = "mandate_demo",
  conversationId: string = "conv_live",
  traceId?: string
) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      mandate_id: mandateId,
      conversation_id: conversationId,
      trace_id: traceId,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to send message: ${res.statusText}`);
  }
  return res.json();
}

export async function proposeCheckout(
  items: Array<{ product_id: string; quantity: number }>,
  mandateId: string,
  traceId?: string
): Promise<CheckoutProposeResponse> {
  const res = await fetch(`${API_BASE}/checkout/propose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      mandate_id: mandateId,
      trace_id: traceId,
    }),
  });
  return res.json();
}

export async function confirmCheckout(
  items: Array<{ product_id: string; quantity: number }>,
  mandateId: string,
  traceId?: string
): Promise<CheckoutConfirmResponse> {
  const res = await fetch(`${API_BASE}/checkout/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      mandate_id: mandateId,
      trace_id: traceId,
    }),
  });
  return res.json();
}

export async function fetchAuditTrail(traceId?: string): Promise<AuditEvent[]> {
  const url = traceId ? `${API_BASE}/audit?trace_id=${traceId}` : `${API_BASE}/audit?limit=20`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function explainAction(actionId: string) {
  const res = await fetch(`${API_BASE}/explain/${actionId}`);
  if (!res.ok) return null;
  return res.json();
}
