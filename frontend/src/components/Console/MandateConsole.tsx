"use client";

import React, { useState, useEffect } from "react";
import { MandateState } from "@/types";
import { Check, ShieldCheck, Store, Package, CreditCard, Lock, ArrowUpRight } from "lucide-react";

interface MandateConsoleProps {
  mandate: MandateState;
  onOpenAudit: () => void;
  onSelectCategory?: (category: string) => void;
}

export const MandateConsole: React.FC<MandateConsoleProps> = ({
  mandate,
  onOpenAudit,
  onSelectCategory,
}) => {
  // Live ticking countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(
    mandate.time_remaining_seconds || 224000
  );

  useEffect(() => {
    setSecondsRemaining(mandate.time_remaining_seconds || 224000);
  }, [mandate.time_remaining_seconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(secondsRemaining / 86400);
  const hours = Math.floor((secondsRemaining % 86400) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${String(days).padStart(2, "0")}d : ${String(
    hours
  ).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m`;

  const spentPercent = Math.min(
    100,
    Math.round((mandate.spent_amount / (mandate.max_amount || 1)) * 100)
  );

  return (
    <div className="w-80 flex-shrink-0 flex flex-col space-y-4">
      {/* 1. Active Mandate Card matching Figma */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            BACKEND AUTHORITY
          </span>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            <Check className="w-3 h-3" />
            <span>ACTIVE</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1.5 leading-none">
          Active mandate
        </h3>
        <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1">
          Rules are evaluated server-side before funds can move.
        </p>

        {/* Budget Progress */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-xs mb-2">
            <span className="text-slate-500 font-medium">Monthly budget</span>
            <span className="font-bold text-slate-900">
              {mandate.currency_symbol}{mandate.spent_amount} / {mandate.currency_symbol}
              {mandate.max_amount}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${spentPercent}%` }}
            />
          </div>

          <div className="mt-1.5 text-xs font-semibold text-emerald-600">
            {mandate.currency_symbol}{mandate.available_amount} available
          </div>
        </div>

        {/* Expiration Countdown Container matching Figma */}
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/70 p-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Expires in</span>
          <span className="font-mono font-bold text-xs text-slate-900 tracking-wider">
            {formattedCountdown}
          </span>
        </div>
      </div>

      {/* 2. Financial Rules Card matching Figma */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">
          Financial rules
        </h4>

        <div className="mt-3.5 space-y-3">
          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Merchants</p>
              <p className="text-slate-500 text-[11px]">Verified merchants only</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Maximum items</p>
              <p className="text-slate-500 text-[11px]">
                Up to {mandate.max_items_per_order} per transaction
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs">
            <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-medium text-slate-700">Payment source</p>
              <p className="text-slate-500 text-[11px]">{mandate.payment_source}</p>
            </div>
          </div>
        </div>

        {/* Allowed Categories Tags */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 block mb-2">
            Allowed categories (Click to explore)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {mandate.allowed_categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory?.(cat)}
                className="px-2.5 py-1 rounded-md bg-blue-50/70 hover:bg-blue-100 border border-blue-100 text-blue-700 text-[11px] font-medium transition-colors cursor-pointer"
                title={`Ask agent for products in ${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Deterministic Custody Card matching Figma */}
      <div className="rounded-2xl bg-slate-900 text-white p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1.5">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold tracking-tight text-white">
            Deterministic custody
          </h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
          The AI can propose. Only the Mandate Engine can authorize and settle.
        </p>

        <button
          onClick={onOpenAudit}
          className="mt-3.5 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-700/80"
        >
          <span>Inspect safety gates</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
