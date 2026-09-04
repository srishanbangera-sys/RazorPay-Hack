import {
  MandateState,
  AuditEvent,
  CheckoutProposeResponse,
  CheckoutConfirmResponse,
} from "../types";

// Default to backend on port 8080 or environment override
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const FALLBACK_MANDATE: MandateState = {
  id: "mandate_travel",
  merchant_id: "merchant_demo",
  max_amount: 800,
  spent_amount: 389,
  available_amount: 411,
  allowed_categories: ["Travel gear", "Office", "Electronics", "Footwear"],
  max_items_per_order: 4,
  expires_at: new Date(Date.now() + 2.6 * 86400000).toISOString(),
  time_remaining_formatted: "02d : 14h : 08m",
  time_remaining_seconds: 224000,
  status: "active",
  is_active: true,
  payment_source: "Operations wallet • 8042",
  currency_symbol: "$",
};

export async function fetchMandateState(mandateId?: string): Promise<MandateState> {
  const url = mandateId 
    ? `${API_BASE}/mandates/${mandateId}/state` 
    : `${API_BASE}/mandates/active/state`;
  
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn(`[Mandate API] ${url} returned ${res.status}, using baseline state.`);
      return FALLBACK_MANDATE;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Mandate API] Connection to backend at ${url} unavailable, using baseline state.`, err);
    return FALLBACK_MANDATE;
  }
}

export async function sendAgentMessage(
  message: string,
  mandateId: string = "mandate_demo",
  conversationId: string = "conv_live",
  traceId?: string
) {
  try {
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
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("[Agent API] Message sending failed:", err);
    throw err;
  }
}

export async function proposeCheckout(
  items: Array<{ product_id: string; quantity: number }>,
  mandateId: string,
  traceId?: string
): Promise<CheckoutProposeResponse> {
  try {
    const res = await fetch(`${API_BASE}/checkout/propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        mandate_id: mandateId,
        trace_id: traceId,
      }),
    });
    if (!res.ok) {
      return {
        allowed: false,
        decision_code: "SERVER_ERROR",
        message: `Checkout propose returned HTTP ${res.status}`,
        cart_total: 0,
        total_items: 0,
        items: [],
        details: {},
        trace_id: traceId || `tr_${Date.now()}`,
        action_id: "",
      };
    }
    return await res.json();
  } catch (err: any) {
    console.error("[Checkout API] Propose error:", err);
    return {
      allowed: false,
      decision_code: "NETWORK_ERROR",
      message: "Could not connect to merchant checkout engine",
      cart_total: 0,
      total_items: 0,
      items: [],
      details: {},
      trace_id: traceId || `tr_${Date.now()}`,
      action_id: "",
    };
  }
}

export async function confirmCheckout(
  items: Array<{ product_id: string; quantity: number }>,
  mandateId: string,
  traceId?: string
): Promise<CheckoutConfirmResponse> {
  try {
    const res = await fetch(`${API_BASE}/checkout/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        mandate_id: mandateId,
        trace_id: traceId,
      }),
    });
    if (!res.ok) {
      return {
        success: false,
        allowed: false,
        decision_code: "SERVER_ERROR",
        message: `Checkout confirmation failed with HTTP ${res.status}`,
        cart_total: 0,
        details: {},
        trace_id: traceId || `tr_${Date.now()}`,
      };
    }
    return await res.json();
  } catch (err: any) {
    console.error("[Checkout API] Confirm error:", err);
    return {
      success: false,
      allowed: false,
      decision_code: "NETWORK_ERROR",
      message: err?.message || "Connection failed during checkout confirmation",
      cart_total: 0,
      details: {},
      trace_id: traceId || `tr_${Date.now()}`,
    };
  }
}

export async function fetchAuditTrail(traceId?: string): Promise<AuditEvent[]> {
  const url = traceId ? `${API_BASE}/audit?trace_id=${traceId}` : `${API_BASE}/audit?limit=20`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn(`[Audit API] Could not fetch audit trail from ${url}:`, err);
    return [];
  }
}

export async function explainAction(actionId: string) {
  try {
    const res = await fetch(`${API_BASE}/explain/${actionId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[Explain API] Failed to explain ${actionId}:`, err);
    return null;
  }
}

export async function verifyPayment(payload: {
  order_id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  trace_id?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Payment verification failed");
    }
    return await res.json();
  } catch (err: any) {
    console.error("[Payment API] Verify error:", err);
    throw err;
  }
}
