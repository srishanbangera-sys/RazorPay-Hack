"use client";

import React from "react";
import { Shield, Lock, Activity } from "lucide-react";

interface HeaderProps {
  onToggleAudit: () => void;
  isAuditOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleAudit, isAuditOpen }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-2 ring-slate-900/10">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">
              Mandate
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
            Autonomous commerce, governed
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Figma green status badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Wallet held by Mandate Engine</span>
        </div>

        {/* Audit Drawer Toggle Button */}
        <button
          onClick={onToggleAudit}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs ${
            isAuditOpen
              ? "bg-slate-900 text-white"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
          }`}
          title="Toggle 7-Gate Safety Verification Panel"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Safety gates (7)</span>
        </button>
      </div>
    </header>
  );
};
