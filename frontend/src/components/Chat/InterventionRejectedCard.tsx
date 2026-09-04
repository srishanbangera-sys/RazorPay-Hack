"use client";

import React from "react";
import { XCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { Product } from "@/types";

interface InterventionRejectedCardProps {
  failureDetails?: {
    cart_total: number;
    max_amount: number;
    difference: number;
    items_count: number;
    reason: string;
    code: string;
    alternative_price?: number;
  } | null;
  alternativeProduct?: Product | null;
  currencySymbol?: string;
  onAcceptAlternative?: (product?: Product | null) => void;
  onViewAudit?: () => void;
}

export const InterventionRejectedCard: React.FC<InterventionRejectedCardProps> = ({
  failureDetails,
  alternativeProduct,
  currencySymbol = "$",
  onAcceptAlternative,
  onViewAudit,
}) => {
  const proposedTotal = failureDetails?.cart_total ?? 1099;
  const itemsCount = failureDetails?.items_count ?? 3;
  const excess = failureDetails?.difference ?? 299;
  const altPrice = failureDetails?.alternative_price ?? alternativeProduct?.price ?? 764;

  return (
    <div className="w-full mt-3 rounded-xl border-2 border-rose-400/90 bg-white p-4 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase">
            MANDATE ENGINE INTERVENTION
          </span>
          <h3 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
            Transaction blocked
          </h3>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected</span>
        </div>
      </div>

      {/* AI Proposed Cart Row */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500 font-medium">
          AI proposed cart • {itemsCount} items
        </span>
        <span className="text-base font-bold text-slate-900 font-mono">
          {currencySymbol}{proposedTotal.toLocaleString()}
        </span>
      </div>

      {/* Failure diagnostic in red */}
      <div className="mt-2 text-xs font-medium text-rose-600 leading-relaxed">
        {failureDetails?.reason || `Spending limit failed — budget exceeded by ${currencySymbol}${excess}.`}
      </div>

      {/* Compliant alternative row with button */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 gap-3">
        <div className="text-xs text-slate-600 font-medium leading-tight">
          AI found a compliant alternative at{" "}
          <span className="font-bold text-slate-900">
            {currencySymbol}{altPrice.toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => onAcceptAlternative?.(alternativeProduct)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <span>View alternative</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Footer trigger to open safety gates drawer */}
      {onViewAudit && (
        <div className="mt-3 text-right">
          <button
            onClick={onViewAudit}
            className="text-[11px] text-rose-700 hover:text-rose-800 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            <span>See why gate 7 blocked this purchase</span>
          </button>
        </div>
      )}
    </div>
  );
};
