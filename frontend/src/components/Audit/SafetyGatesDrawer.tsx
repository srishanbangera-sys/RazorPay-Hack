"use client";

import React, { useState } from "react";
import { X, Check, XCircle, ShieldCheck, FileText, ChevronRight } from "lucide-react";
import { AuditEvent } from "@/types";

interface SafetyGatesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  decisionState: "approved" | "rejected" | "idle";
  traceId?: string;
  auditEvents?: AuditEvent[];
  failureCode?: string;
  failureReason?: string;
  currencySymbol?: string;
}

export const SafetyGatesDrawer: React.FC<SafetyGatesDrawerProps> = ({
  isOpen,
  onClose,
  decisionState,
  traceId = "ME-2048-7F31",
  auditEvents = [],
  failureCode,
  failureReason,
  currencySymbol = "$",
}) => {
  const [showJsonModal, setShowJsonModal] = useState(false);

  if (!isOpen) return null;

  const isRejected = decisionState === "rejected";

  // The 7 Gates matching backend engine.py and rules.py
  const gates = [
    {
      id: "active",
      title: "Active status",
      desc: "Mandate is active",
      status: "passed",
    },
    {
      id: "expiry",
      title: "Expiry",
      desc: "2d 14h remaining",
      status: "passed",
    },
    {
      id: "merchant",
      title: "Merchant",
      desc: "Atlas Supply verified",
      status: "passed",
    },
    {
      id: "stock",
      title: "Stock",
      desc: "3 items available",
      status: "passed",
    },
    {
      id: "category",
      title: "Category",
      desc: "Travel gear allowed",
      status: "passed",
    },
    {
      id: "item_count",
      title: "Item count",
      desc: "3 of 4 items",
      status: "passed",
    },
    {
      id: "spending_limit",
      title: "Spending limit",
      desc: isRejected
        ? `${currencySymbol}1,099 exceeds ${currencySymbol}800`
        : `Within authorized ${currencySymbol}800 budget`,
      subtag: isRejected ? "BLOCKED HERE" : "PASSED",
      status: isRejected ? "blocked" : "passed",
    },
  ];

  return (
    <aside className="w-80 flex-shrink-0 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[calc(100vh-100px)] animate-in slide-in-from-right duration-200">
      <div>
        {/* Top Header matching Figma */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              Safety gates
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Deterministic evaluation • 7 gates
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Step Vertical Stepper matching Figma */}
        <div className="mt-5 relative space-y-4 pl-1">
          {/* Vertical continuous background line */}
          <div className="absolute left-[13px] top-2 bottom-4 w-0.5 bg-slate-200 -z-0" />

          {gates.map((gate, idx) => {
            const isPassed = gate.status === "passed";
            return (
              <div key={gate.id} className="relative flex items-start gap-3 z-10">
                {/* Checkpoint Icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isPassed
                      ? "bg-emerald-50 border border-emerald-400 text-emerald-600"
                      : "bg-rose-50 border border-rose-400 text-rose-600"
                  }`}
                >
                  {isPassed ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </div>

                {/* Gate Texts */}
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 leading-snug">
                      {gate.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {gate.desc}
                  </p>
                  {gate.subtag && (
                    <span
                      className={`inline-block mt-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                        isPassed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {gate.subtag}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary matching Figma */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          FINAL DECISION
        </span>
        <h4
          className={`text-sm font-bold tracking-tight mt-0.5 ${
            isRejected ? "text-rose-600" : "text-emerald-700"
          }`}
        >
          {isRejected ? "Rejected by server" : "Authorized by server"}
        </h4>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
          Audit ID • {traceId.replace("trace_", "ME-")}
        </p>

        <button
          onClick={() => setShowJsonModal(true)}
          className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Inspect raw audit trace</span>
          <ChevronRight className="w-3 h-3 text-slate-400 ml-auto" />
        </button>
      </div>

      {/* Raw Audit Log Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Correlated Audit Log
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  trace_id: {traceId}
                </p>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed scrollbar-thin">
              <pre>{JSON.stringify(auditEvents, null, 2)}</pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowJsonModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
