"use client";

import React from "react";
import { Check, ShieldCheck, Sparkles, CreditCard } from "lucide-react";
import { Product } from "@/types";

interface InterventionApprovedCardProps {
  total: number;
  currencySymbol?: string;
  orderId?: string | null;
  upsellItem?: Product | null;
  onViewAudit?: () => void;
  onAddUpsell?: (product: Product) => void;
  onPayWithRazorpay?: () => void;
}

export const InterventionApprovedCard: React.FC<InterventionApprovedCardProps> = ({
  total,
  currencySymbol = "$",
  orderId,
  upsellItem,
  onViewAudit,
  onAddUpsell,
  onPayWithRazorpay,
}) => {
  return (
    <div className="w-full mt-3 rounded-xl border-2 border-emerald-500/90 bg-white p-4 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
            SERVER DECISION
          </span>
          <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
            Payment authorized
          </h3>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Check className="w-3.5 h-3.5" />
          <span>Pre-approved</span>
        </div>
      </div>

      {/* Authoritative Total */}
      <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500 font-medium">Authoritative total</span>
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {currencySymbol}{total.toLocaleString()}
          {currencySymbol === "$" && ".00"}
        </span>
      </div>

      {/* Compliant Add-on Upsell */}
      {upsellItem && (
        <div className="mt-3 rounded-lg bg-emerald-50/80 border border-emerald-200/80 px-3 py-2 flex items-center justify-between text-xs transition-colors hover:bg-emerald-50">
          <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Compliant add-on: {upsellItem.name.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800 font-mono">
              +{currencySymbol}{upsellItem.price}
            </span>
            {onAddUpsell && (
              <button
                onClick={() => onAddUpsell(upsellItem)}
                className="text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer shadow-2xs"
              >
                Add
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {onPayWithRazorpay && (
          <button
            onClick={onPayWithRazorpay}
            className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay via Razorpay (Test Mode)</span>
          </button>
        )}

        {onViewAudit && (
          <button
            onClick={onViewAudit}
            className="px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
            title="Inspect 7 deterministic safety gates"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify 7 gates</span>
          </button>
        )}
      </div>

      {/* Order ID footer */}
      <div className="mt-2 text-right">
        <span className="font-mono text-[10px] text-slate-400">
          Order ID: {orderId || "ord_approved"}
        </span>
      </div>
    </div>
  );
};
