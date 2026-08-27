import React from 'react';
import { ShieldCheck, Cpu, RefreshCw, Zap, Store } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isBackendConnected: boolean;
  activeMerchant: string;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  isBackendConnected,
  activeMerchant
}) => {
  return (
    <header className="border-b border-merchant-border bg-merchant-dark/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-glow-indigo">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Agent-Transactable Merchant</h1>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-brand-950 text-brand-400 border border-brand-800/60 rounded-full">
                Hackathon MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bounded Autonomous AI Commerce with Deterministic Server-Side Mandate Enforcement
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-merchant-card px-3 py-1.5 rounded-lg border border-merchant-border">
            <Store className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">{activeMerchant}</span>
          </div>

          <div className="flex items-center space-x-2 bg-merchant-card px-3 py-1.5 rounded-lg border border-merchant-border">
            <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-xs text-slate-300">
              {isBackendConnected ? 'Engine: ACTIVE' : 'Disconnected'}
            </span>
          </div>

          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition-colors"
            title="Reset Demo State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
