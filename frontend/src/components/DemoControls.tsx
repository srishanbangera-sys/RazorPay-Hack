import React from 'react';
import { Play, CheckCircle2, XCircle, AlertTriangle, PackageX } from 'lucide-react';

interface DemoControlsProps {
  onRunScenario: (prompt: string) => void;
  isLoading: boolean;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  onRunScenario,
  isLoading
}) => {
  return (
    <div className="glass-card rounded-xl p-4 mb-6 border border-merchant-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Live Demo Scenarios</span>
          <h2 className="text-sm font-semibold text-white">Deterministic Evaluation Scenarios</h2>
        </div>
        <div className="text-xs text-slate-400">
          Click any preset to execute an end-to-end agent & mandate cycle.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Scenario 1: Success */}
        <button
          disabled={isLoading}
          onClick={() => onRunScenario("Find me running shoes under ₹1500")}
          className="flex items-start p-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 transition-all text-left group disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 mr-2.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-emerald-300">Scenario 1 — Approved</div>
            <div className="text-xs text-slate-300 mt-0.5">Sprint Runner (₹1,299) under ₹1,500 limit</div>
            <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">→ MANDATE_APPROVED</div>
          </div>
        </button>

        {/* Scenario 2: Amount Exceeded */}
        <button
          disabled={isLoading}
          onClick={() => onRunScenario("Buy the premium running shoes")}
          className="flex items-start p-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 transition-all text-left group disabled:opacity-50"
        >
          <XCircle className="w-5 h-5 text-rose-400 mt-0.5 mr-2.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-rose-300">Scenario 2 — Blocked (Amount)</div>
            <div className="text-xs text-slate-300 mt-0.5">Premium Runner (₹1,799) &gt; ₹1,500 limit</div>
            <div className="text-[10px] text-rose-400/80 mt-1 font-mono">→ MANDATE_EXCEEDED (+Alt)</div>
          </div>
        </button>

        {/* Scenario 3: Category Blocked */}
        <button
          disabled={isLoading}
          onClick={() => onRunScenario("Buy SonicPulse Wireless Earbuds")}
          className="flex items-start p-3 rounded-lg bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/60 transition-all text-left group disabled:opacity-50"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 mr-2.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-amber-300">Scenario 3 — Category Blocked</div>
            <div className="text-xs text-slate-300 mt-0.5">Earbuds (electronics) not in footwear</div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-mono">→ CATEGORY_NOT_ALLOWED</div>
          </div>
        </button>

        {/* Scenario 4: Out of Stock */}
        <button
          disabled={isLoading}
          onClick={() => onRunScenario("Buy the Phantom Sprint Elite")}
          className="flex items-start p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700 transition-all text-left group disabled:opacity-50"
        >
          <PackageX className="w-5 h-5 text-slate-400 mt-0.5 mr-2.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-slate-300">Scenario 4 — Stock Boundary</div>
            <div className="text-xs text-slate-400 mt-0.5">Sold out racing shoe (0 stock)</div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">→ OUT_OF_STOCK</div>
          </div>
        </button>
      </div>
    </div>
  );
};
