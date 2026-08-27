import React, { useState } from 'react';
import { Shield, Lock, Sliders, Check, AlertCircle } from 'lucide-react';
import { Mandate } from '../types';

interface MandateCardProps {
  mandate: Mandate | null;
  onUpdateMandate: (update: Partial<Mandate>) => Promise<void>;
  isLoading: boolean;
}

export const MandateCard: React.FC<MandateCardProps> = ({
  mandate,
  onUpdateMandate,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(mandate?.max_amount || 1500);
  const [categories, setCategories] = useState<string[]>(mandate?.allowed_categories || ['footwear']);
  const [maxItems, setMaxItems] = useState(mandate?.max_items_per_order || 1);
  const [status, setStatus] = useState(mandate?.status || 'active');

  const availableCategories = ['footwear', 'electronics', 'fitness', 'accessories', 'clothing'];

  const handleSave = async () => {
    if (!mandate) return;
    await onUpdateMandate({
      max_amount: amount,
      allowed_categories: categories,
      max_items_per_order: maxItems,
      status: status as 'active' | 'inactive',
    });
    setIsEditing(false);
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter(c => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  if (!mandate) {
    return (
      <div className="glass-card rounded-xl p-5 border border-merchant-border">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-5 border border-merchant-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-brand-950 border border-brand-800/80 text-brand-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Mandate</h2>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                mandate.status === 'active'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800'
              }`}>
                {mandate.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">Mandate ID: <code className="font-mono text-slate-300">{mandate.id}</code></p>
          </div>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              setAmount(mandate.max_amount);
              setCategories(mandate.allowed_categories);
              setMaxItems(mandate.max_items_per_order);
              setStatus(mandate.status);
            }
            setIsEditing(!isEditing);
          }}
          className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 bg-brand-950/60 hover:bg-brand-900/60 px-2.5 py-1.5 rounded-lg border border-brand-800/60 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel' : 'Tune Limits'}</span>
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-merchant-dark/50 p-3.5 rounded-lg border border-merchant-border/80">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Max Spend</div>
            <div className="text-lg font-extrabold text-white font-mono mt-0.5">₹{mandate.max_amount.toLocaleString()}</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Allowed Categories</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {mandate.allowed_categories.map(cat => (
                <span key={cat} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-medium rounded">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Max Items</div>
            <div className="text-lg font-extrabold text-white font-mono mt-0.5">{mandate.max_items_per_order} item(s)</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Target Merchant</div>
            <div className="text-xs text-slate-300 font-mono mt-1 truncate">{mandate.merchant_id}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 bg-merchant-dark/80 p-4 rounded-lg border border-brand-900/60">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <label className="font-semibold">Spending Limit: ₹{amount.toLocaleString()}</label>
              <span className="text-slate-400 text-[11px]">Server Rule Gate #7</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-brand-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>₹500</span>
              <span>₹1,500 (Default)</span>
              <span>₹3,000</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Permitted Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {availableCategories.map((cat) => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-brand-600 border-brand-500 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Items</label>
              <input
                type="number"
                min="1"
                max="5"
                value={maxItems}
                onChange={(e) => setMaxItems(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-indigo transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Mandate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
