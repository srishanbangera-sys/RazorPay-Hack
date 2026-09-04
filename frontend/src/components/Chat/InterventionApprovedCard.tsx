"use client";

import React from "react";
import { Check, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { Product } from "@/types";

interface InterventionApprovedCardProps {
  total: number;
  currencySymbol?: string;
  orderId?: string | null;
  upsellItem?: Product | null;
  onViewAudit?: () => void;
  onAddUpsell?: (product: Product) => void;
}

export const InterventionApprovedCard: React.FC<InterventionApprovedCardProps> = ({
  total,
  currencySymbol = "$",
  orderId,
  upsellItem,
  onViewAudit,
  onAddUpsell,
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
          <span>Paid</span>
        </div>
      </div>

      {/* Authoritative Total */}
      <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500 font-medium">Authoritative total</span>
        <span className="text-2xl font-bold tracking-tight text-slate-900">
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
            <span className="font-bold text-emerald-800">
              +{currencySymbol}{upsellItem.price}
            </span>
            {onAddUpsell && (
              <button
                onClick={() => onAddUpsell(upsellItem)}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded font-medium transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer link to Audit */}
      <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
        <span className="font-mono text-[10px] text-slate-400">
          Order: {orderId || "ord_approved"}
        </span>
        {onViewAudit && (
          <button
            onClick={onViewAudit}
            className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify 7 safety gates</span>
          </button>
        )}
      </div>
    </div>
  );
};
