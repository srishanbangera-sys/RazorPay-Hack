import React from 'react';
import { X, Shield, FileJson, Clock, Tag } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditDetailModalProps {
  event: AuditEvent | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-merchant-dark">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-brand-950 text-brand-400 border border-brand-800">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono">{event.event_type}</h3>
              <p className="text-xs text-slate-400 font-mono">Event ID: {event.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-merchant-dark border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Actor</div>
              <div className="font-bold text-slate-200 uppercase mt-0.5">{event.actor}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Decision</div>
              <div className="font-bold text-slate-200 uppercase mt-0.5">{event.decision}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Trace ID</div>
              <div className="font-mono text-slate-300 truncate mt-0.5">{event.trace_id}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Timestamp</div>
              <div className="font-mono text-slate-300 mt-0.5">{new Date(event.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Action & Reason */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Action Description</div>
            <div className="text-slate-200 font-medium">{event.action}</div>
            {event.reason_code && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-[10px] text-slate-400">Reason Code:</span>
                <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800 font-mono font-bold">
                  {event.reason_code}
                </span>
              </div>
            )}
          </div>

          {/* Input Data Payload */}
          {event.input_data && (
            <div>
              <div className="text-xs font-bold text-slate-300 mb-1.5">Input Payload (Sanitized)</div>
              <pre className="p-3.5 rounded-xl bg-merchant-dark border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(event.input_data, null, 2)}
              </pre>
            </div>
          )}

          {/* Output Data Payload */}
          {event.output_data && (
            <div>
              <div className="text-xs font-bold text-slate-300 mb-1.5">Output Payload / Decision Details</div>
              <pre className="p-3.5 rounded-xl bg-merchant-dark border border-slate-800 text-[11px] font-mono text-sky-400 overflow-x-auto">
                {JSON.stringify(event.output_data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-merchant-dark flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
