"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AgentChat } from "@/components/Chat/AgentChat";
import { MandateConsole } from "@/components/Console/MandateConsole";
import { SafetyGatesDrawer } from "@/components/Audit/SafetyGatesDrawer";
import { RazorpayModal } from "@/components/Payment/RazorpayModal";
import { ChatMessage, MandateState, AuditEvent, Product } from "@/types";
import { fetchMandateState, sendAgentMessage, fetchAuditTrail } from "@/services/api";

export default function DashboardPage() {
  const [isAuditOpen, setIsAuditOpen] = useState(true);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState<{
    orderId?: string | null;
    amount: number;
    traceId?: string;
  }>({
    orderId: "ord_travel_auth",
    amount: 189,
    traceId: "ME-2048-7F31",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTraceId, setActiveTraceId] = useState<string>("ME-2048-7F31");
  const [decisionState, setDecisionState] = useState<"approved" | "rejected" | "idle">("rejected");
  const [failureReason, setFailureReason] = useState<string | undefined>(
    "Spending limit failed — budget exceeded by $299."
  );
  const [failureCode, setFailureCode] = useState<string | undefined>("MANDATE_EXCEEDED");
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Default active mandate state matching Figma UI
  const [mandate, setMandate] = useState<MandateState>({
    id: "mandate_travel",
    merchant_id: "merchant_demo",
    max_amount: 800,
    spent_amount: 389,
    available_amount: 411,
    allowed_categories: ["Travel gear", "Footwear", "Office", "Electronics"],
    max_items_per_order: 4,
    expires_at: new Date(Date.now() + 2.6 * 86400000).toISOString(),
    time_remaining_formatted: "02d : 14h : 08m",
    time_remaining_seconds: 224000,
    status: "active",
    is_active: true,
    payment_source: "Operations wallet • 8042",
    currency_symbol: "$",
  });

  // Initial messages representing the exact Figma mock scenario
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_user_init",
      sender: "buyer",
      text: "Find a reliable travel setup under my approved budget. Prioritize carry-on size.",
      timestamp: "10:14 AM",
    },
    {
      id: "msg_agent_init",
      sender: "agent",
      text: "I found three compliant options from approved merchants. The first balances durability and total cost.",
      timestamp: "10:14 AM",
      trace_id: "ME-2048-7F31",
      carousel_products: [
        {
          id: "travel_001",
          name: "Transit Carry-on",
          brand: "Aero Goods",
          category: "Travel gear",
          price: 189,
          stock: 12,
          specification: "38L • 2.9kg",
          sizes_or_capacity: "38L",
        },
        {
          id: "travel_002",
          name: "Daylight Pack",
          brand: "Northline",
          category: "Travel gear",
          price: 128,
          stock: 18,
          specification: "32L • 0.9kg",
          sizes_or_capacity: "32L",
        },
        {
          id: "travel_003",
          name: "Cabin Roller",
          brand: "Atlas Supply",
          category: "Travel gear",
          price: 214,
          stock: 9,
          specification: "40L • 3.4kg",
          sizes_or_capacity: "40L",
        },
      ],
      component_type: "approved_card",
      cart_total: 189,
      order_id: "ord_travel_auth",
      upsell_item: {
        id: "travel_004",
        name: "recycled packing cubes",
        category: "Travel gear",
        price: 22,
        stock: 50,
      },
    },
    {
      id: "msg_agent_rejected",
      sender: "agent",
      text: "",
      timestamp: "10:15 AM",
      trace_id: "ME-2048-7F31",
      component_type: "rejected_card",
      failure_details: {
        cart_total: 1099,
        max_amount: 800,
        difference: 299,
        items_count: 3,
        reason: "Spending limit failed — budget exceeded by $299.",
        code: "MANDATE_EXCEEDED",
        alternative_price: 764,
      },
      alternative_product: {
        id: "travel_alt_bundle",
        name: "Compliant Travel Setup Bundle",
        brand: "Atlas & Aero",
        category: "Travel gear",
        price: 764,
        stock: 5,
      },
    },
  ]);

  // Load live mandate state from backend on mount
  useEffect(() => {
    fetchMandateState(mandate.id).then((state) => {
      if (state) setMandate(state);
    });
    fetchAuditTrail().then((events) => {
      if (events && events.length > 0) setAuditEvents(events);
    });
  }, [mandate.id]);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "buyer",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await sendAgentMessage(text, mandate.id);

      const isApproved = res.mandate_decision?.allowed ?? (res.component_type === "approved_card");
      setDecisionState(isApproved ? "approved" : "rejected");
      if (res.failure_details) {
        setFailureReason(res.failure_details.reason);
        setFailureCode(res.failure_details.code);
      } else {
        setFailureReason(undefined);
        setFailureCode(undefined);
      }

      if (res.trace_id) {
        setActiveTraceId(res.trace_id);
        fetchAuditTrail(res.trace_id).then(setAuditEvents);
      }

      const agentMsg: ChatMessage = {
        id: `msg_agent_${Date.now()}`,
        sender: "agent",
        text: res.message || "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        trace_id: res.trace_id,
        action_id: res.action_id,
        component_type: res.component_type,
        carousel_products: res.carousel_products?.length ? res.carousel_products : res.products_considered,
        cart_total: res.cart_total,
        order_id: res.order_id,
        upsell_item: res.upsell_item,
        failure_details: res.failure_details,
        alternative_product: res.alternative_product,
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Refresh mandate state
      fetchMandateState().then(setMandate);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: "agent",
          text: "⚠️ Connection error contacting the Mandate Engine backend. Please check that uvicorn is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    handleSendMessage(`I want to purchase the ${product.name} for ${mandate.currency_symbol}${product.price}.`);
  };

  const handleSelectCategory = (category: string) => {
    handleSendMessage(`Show me available products in category ${category}.`);
  };

  const handleViewAudit = (
    decision: "approved" | "rejected" | "idle",
    traceId?: string,
    reason?: string,
    code?: string
  ) => {
    setDecisionState(decision);
    if (traceId) {
      setActiveTraceId(traceId);
      fetchAuditTrail(traceId).then(setAuditEvents);
    }
    if (reason) setFailureReason(reason);
    if (code) setFailureCode(code);
    setIsAuditOpen(true);
  };

  const handleOpenRazorpay = (order: {
    orderId?: string | null;
    amount: number;
    traceId?: string;
  }) => {
    setRazorpayOrder(order);
    setIsRazorpayOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    fetchMandateState().then(setMandate);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_pay_success_${Date.now()}`,
        sender: "agent",
        text: `🎉 **Payment Captured!** Razorpay payment verification succeeded (Payment ID: \`${paymentId}\`). The transaction is now permanently finalized and recorded in the audit trail.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-900">
      {/* Top Header matching Figma */}
      <Header
        onToggleAudit={() => setIsAuditOpen((prev) => !prev)}
        isAuditOpen={isAuditOpen}
      />

      {/* Main Dashboard Body: Left Pane, Right Console, and Safety Gates Drawer */}
      <main className="flex-1 p-5 max-w-[1700px] w-full mx-auto flex gap-4 overflow-hidden">
        {/* Left Pane: Shopping Agent Chat */}
        <AgentChat
          messages={messages}
          isLoading={isLoading}
          currencySymbol={mandate.currency_symbol}
          onSendMessage={handleSendMessage}
          onSelectProduct={handleSelectProduct}
          onViewAudit={handleViewAudit}
          onOpenRazorpay={handleOpenRazorpay}
        />

        {/* Right Pane: Persistent Mandate Console */}
        <MandateConsole
          mandate={mandate}
          onOpenAudit={() => handleViewAudit(decisionState, activeTraceId)}
          onSelectCategory={handleSelectCategory}
        />

        {/* Slide-out Safety Gates 7-Step Stepper Drawer */}
        <SafetyGatesDrawer
          isOpen={isAuditOpen}
          onClose={() => setIsAuditOpen(false)}
          decisionState={decisionState}
          traceId={activeTraceId}
          auditEvents={auditEvents}
          failureCode={failureCode}
          failureReason={failureReason}
          currencySymbol={mandate.currency_symbol}
        />
      </main>

      {/* Razorpay Test Mode Checkout Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        orderId={razorpayOrder.orderId}
        amount={razorpayOrder.amount}
        currencySymbol={mandate.currency_symbol}
        traceId={razorpayOrder.traceId || activeTraceId}
        merchantName="Apex Athletics & Gear"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
