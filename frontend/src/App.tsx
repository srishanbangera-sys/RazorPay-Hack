import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DemoControls } from './components/DemoControls';
import { MandateCard } from './components/MandateCard';
import { AgentChat } from './components/AgentChat';
import { CartDecisionCard } from './components/CartDecisionCard';
import { ProductCatalog } from './components/ProductCatalog';
import { AuditTimeline } from './components/AuditTimeline';
import { AuditDetailModal } from './components/AuditDetailModal';
import { RazorpayModal } from './components/RazorpayModal';

import {
  Product,
  Mandate,
  CartItemDetail,
  AuditEvent,
  ChatMessage,
  RazorpayOrderDetails
} from './types';

import {
  fetchProducts,
  fetchActiveMandate,
  updateMandate,
  fetchAuditEvents,
  sendAgentMessage
} from './services/api';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [proposedCart, setProposedCart] = useState<CartItemDetail[]>([]);
  const [cartTotal, setCartTotal] = useState<number | null>(null);
  const [decision, setDecision] = useState<{
    allowed: boolean;
    decision_code: string;
    message: string;
    details?: Record<string, any>;
  } | null>(null);
  const [orderId, setOrderId] = useState<string | undefined>();
  const [activeTraceId, setActiveTraceId] = useState<string | undefined>();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [inspectingEvent, setInspectingEvent] = useState<AuditEvent | null>(null);
  const [razorpayOrder, setRazorpayOrder] = useState<RazorpayOrderDetails | null>(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // Load initial data
  const loadInitialData = async () => {
    try {
      const [prods, mand, audits] = await Promise.all([
        fetchProducts(),
        fetchActiveMandate(),
        fetchAuditEvents()
      ]);
      setProducts(prods);
      setMandate(mand);
      setAuditEvents(audits);
      setIsBackendConnected(true);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'buyer',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const mandateId = mandate?.id || 'mandate_demo';
      const conversationId = 'conv_demo_session';
      const traceId = `trace_${Date.now().toString(36)}`;

      const response = await sendAgentMessage(text, mandateId, conversationId, traceId);

      setActiveTraceId(response.trace_id);
      setProposedCart(response.proposed_cart || []);
      setCartTotal(response.cart_total || null);

      if (response.mandate_decision) {
        setDecision(response.mandate_decision);
      } else {
        setDecision(null);
      }

      setOrderId(response.order_id);

      if (response.order_id && response.mandate_decision?.allowed) {
        setRazorpayOrder({
          order_id: `rzp_order_${response.order_id.replace('order_', '')}`,
          amount: (response.cart_total || 0) * 100,
          currency: 'INR',
          merchant_name: 'Apex Athletics & Gear',
          is_mock: true
        });
      } else {
        setRazorpayOrder(null);
      }

      const agentMessage: ChatMessage = {
        id: `msg_agent_${Date.now()}`,
        sender: 'agent',
        text: response.message,
        timestamp: new Date(),
        tools: response.tools_invoked,
        decision: response.mandate_decision ? {
          allowed: response.mandate_decision.allowed,
          code: response.mandate_decision.decision_code,
          details: response.mandate_decision.details
        } : undefined,
        orderId: response.order_id,
        alternativeProduct: response.alternative_product,
        traceId: response.trace_id
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Refresh audit events
      const updatedAudits = await fetchAuditEvents();
      setAuditEvents(updatedAudits);
    } catch (err: any) {
      console.error('Agent message error:', err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'agent',
        text: `⚠️ System Error: ${err.message || 'Failed to communicate with merchant backend.'}`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMandate = async (update: Partial<Mandate>) => {
    if (!mandate) return;
    setIsLoading(true);
    try {
      const updated = await updateMandate(mandate.id, update);
      setMandate(updated);
    } catch (err) {
      console.error('Failed to update mandate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = (result: { success: boolean; message: string }) => {
    setShowRazorpayModal(false);
    if (result.success) {
      const agentConfirm: ChatMessage = {
        id: `msg_pay_${Date.now()}`,
        sender: 'agent',
        text: `🎉 **Payment Verified & Captured!**\n\nYour transaction has been confirmed by the merchant. The payment reference and captured audit records have been appended to the immutable log.`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, agentConfirm]);
    }
    // Refresh audit trail
    fetchAuditEvents().then(setAuditEvents);
  };

  const handleReset = async () => {
    setMessages([]);
    setProposedCart([]);
    setCartTotal(null);
    setDecision(null);
    setOrderId(undefined);
    setRazorpayOrder(null);
    setActiveTraceId(undefined);
    await handleUpdateMandate({
      max_amount: 1500,
      allowed_categories: ['footwear'],
      max_items_per_order: 1,
      status: 'active'
    });
    loadInitialData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-merchant-dark selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        onReset={handleReset}
        isBackendConnected={isBackendConnected}
        activeMerchant={mandate?.merchant_id ? `Merchant: ${mandate.merchant_id}` : 'Merchant Demo'}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Preset Scenario Bar */}
        <DemoControls
          onRunScenario={handleSendMessage}
          isLoading={isLoading}
        />

        {/* Top Grid: Mandate (Left) & Cart Decision Gate (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MandateCard
            mandate={mandate}
            onUpdateMandate={handleUpdateMandate}
            isLoading={isLoading}
          />

          <CartDecisionCard
            proposedCart={proposedCart}
            cartTotal={cartTotal}
            mandate={mandate}
            decision={decision}
            orderId={orderId}
            onInitiatePayment={() => setShowRazorpayModal(true)}
            isLoading={isLoading}
          />
        </div>

        {/* Middle Grid: AI Agent Chat (Left) & Merchant Catalog (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <AgentChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onSelectProduct={(productId) => {
                const prod = products.find(p => p.id === productId);
                if (prod) handleSendMessage(`Buy the ${prod.name}`);
              }}
            />
          </div>

          <div className="lg:col-span-6">
            <ProductCatalog
              products={products}
              onSelectForAgent={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Bottom Section: Append-Only Audit Timeline */}
        <AuditTimeline
          events={activeTraceId ? auditEvents.filter(e => e.trace_id === activeTraceId) : auditEvents}
          selectedTraceId={activeTraceId}
          onSelectTraceId={setActiveTraceId}
          onInspectEvent={setInspectingEvent}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-merchant-border/60 py-6 px-6 bg-merchant-dark/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agent-Transactable Merchant • Razorpay Test Mode & Bounded AI Security Architecture</span>
          <span>Zero Client-Price Trust • Deterministic Backend Rules</span>
        </div>
      </footer>

      {/* Audit Detail Modal */}
      <AuditDetailModal
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
      />

      {/* Razorpay Test Checkout Modal */}
      {showRazorpayModal && razorpayOrder && (
        <RazorpayModal
          orderDetails={razorpayOrder}
          localOrderId={orderId}
          traceId={activeTraceId}
          onClose={() => setShowRazorpayModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};
