import React from 'react';
import { ShoppingCart, CheckCircle2, XCircle, ShieldAlert, CreditCard, ArrowRight, Ban, Info } from 'lucide-react';
import { CartItemDetail, Mandate } from '../types';

interface CartDecisionCardProps {
  proposedCart: CartItemDetail[];
  cartTotal: number | null;
  mandate: Mandate | null;
  decision: {
    allowed: boolean;
    decision_code: string;
    message: string;
    details?: Record<string, any>;
  } | null;
  orderId?: string;
  onInitiatePayment?: () => void;
  isLoading: boolean;
}

export const CartDecisionCard: React.FC<CartDecisionCardProps> = ({
  proposedCart,
  cartTotal,
  mandate,
  decision,
  orderId,
  onInitiatePayment,
  isLoading
}) => {
  const maxLimit = mandate?.max_amount || 1500;
  const isApproved = decision?.allowed === true;
  const isBlocked = decision?.allowed === false;
  const difference = (cartTotal && cartTotal > maxLimit) ? cartTotal - maxLimit : (decision?.details?.difference || 0);

  return (
    <div className={`glass-card rounded-xl p-5 border transition-all duration-300 ${
      isApproved ? 'glow-border-approved bg-emerald-950/10' :
      isBlocked ? 'glow-border-blocked bg-rose-950/10' :
      'border-merchant-border'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-merchant-border">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Proposed Cart & Mandate Gate</h3>
            <p className="text-[11px] text-slate-400">Server-Side Authoritative Verification</p>
          </div>
        </div>

        {decision && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 font-mono ${
            isApproved ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
            'bg-rose-950 text-rose-300 border border-rose-700'
          }`}>
            {isApproved ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />}
            {decision.decision_code}
          </span>
        )}
      </div>

      {/* Cart Content */}
      {proposedCart.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          No cart currently proposed. The AI agent will assemble a cart based on buyer prompts.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Itemized list */}
          <div className="space-y-2">
            {proposedCart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-merchant-dark/60 border border-merchant-border/60 text-xs">
                <div>
                  <div className="font-semibold text-white">{item.product.name}</div>
                  <div className="text-[10px] text-slate-400">Category: <span className="text-slate-300">{item.product.category}</span> • Qty: {item.quantity}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-white">₹{item.subtotal.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">₹{item.unit_price} each</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Comparison Bar */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Server Cart Total:</span>
              <span className="font-bold text-white font-mono text-sm">₹{cartTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Mandate Spending Limit:</span>
              <span className="font-semibold text-brand-400 font-mono">₹{maxLimit.toLocaleString()}</span>
            </div>

            {isBlocked && difference > 0 && (
              <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800">
                <span className="text-rose-400 font-medium">Excess Over Limit:</span>
                <span className="font-bold text-rose-400 font-mono bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/80">
                  + ₹{difference.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Decision Status Banner */}
          {isApproved && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs space-y-2">
              <div className="flex items-center text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400 flex-shrink-0" />
                <span>MANDATE APPROVED — ALL GATES SATISFIED</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Cart total is within spending limit (₹{cartTotal} ≤ ₹{maxLimit}) and product category is permitted.
              </p>

              {onInitiatePayment && (
                <button
                  onClick={onInitiatePayment}
                  disabled={isLoading}
                  className="w-full mt-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-glow-emerald transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Open Razorpay Test Checkout</span>
                </button>
              )}
            </div>
          )}

          {isBlocked && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs space-y-2">
              <div className="flex items-center text-rose-300 font-bold">
                <Ban className="w-4 h-4 mr-1.5 text-rose-400 flex-shrink-0" />
                <span>TRANSACTION BLOCKED BY MANDATE ENGINE</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {decision.message}
              </p>
              <div className="p-2 rounded bg-rose-950/80 border border-rose-900 text-[11px] text-rose-200 font-mono flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Security Rule Enforced: Payment order was NOT created.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
