import React from 'react';
import { History, Eye, CheckCircle, XCircle, Info, Shield, CreditCard, Bot, User, Server } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditTimelineProps {
  events: AuditEvent[];
  selectedTraceId?: string;
  onSelectTraceId?: (traceId: string) => void;
  onInspectEvent: (event: AuditEvent) => void;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  events,
  selectedTraceId,
  onSelectTraceId,
  onInspectEvent
}) => {
  const getActorBadge = (actor: string) => {
    switch (actor.toLowerCase()) {
      case 'buyer':
        return { label: 'BUYER', icon: User, color: 'bg-sky-950 text-sky-400 border-sky-800' };
      case 'agent':
        return { label: 'AGENT', icon: Bot, color: 'bg-indigo-950 text-indigo-400 border-indigo-800' };
      case 'mandate_engine':
        return { label: 'MANDATE ENGINE', icon: Shield, color: 'bg-purple-950 text-purple-400 border-purple-800' };
      case 'backend':
        return { label: 'BACKEND', icon: Server, color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'payment':
        return { label: 'PAYMENT', icon: CreditCard, color: 'bg-emerald-950 text-emerald-400 border-emerald-800' };
      default:
        return { label: actor.toUpperCase(), icon: Info, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-merchant-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-merchant-border">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Append-Only Audit Timeline</h3>
            <p className="text-[11px] text-slate-400">Verifiable trace record of all agent & backend decisions</p>
          </div>
        </div>

        {selectedTraceId && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Active Trace:</span>
            <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800 text-xs font-mono">
              {selectedTraceId}
            </span>
          </div>
        )}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-4 max-h-[420px] overflow-y-auto pr-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No audit events recorded yet. Execute a scenario to generate a trace timeline.
          </div>
        ) : (
          events.map((event) => {
            const actorInfo = getActorBadge(event.actor);
            const ActorIcon = actorInfo.icon;
            const isRejection = event.decision === 'rejected';
            const isApproval = event.event_type === 'MANDATE_APPROVED' || event.event_type === 'PAYMENT_SUCCEEDED';

            return (
              <div
                key={event.id}
                className={`relative group p-3 rounded-xl border text-xs transition-all ${
                  isRejection ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-700' :
                  isApproval ? 'bg-emerald-950/20 border-emerald-800/60 hover:border-emerald-700' :
                  'bg-merchant-dark/70 border-merchant-border hover:border-slate-600'
                }`}
              >
                {/* Timeline node dot */}
                <div className={`absolute -left-6 top-3.5 w-3 h-3 rounded-full border-2 border-merchant-dark ${
                  isRejection ? 'bg-rose-500' : isApproval ? 'bg-emerald-500' : 'bg-brand-500'
                }`} />

                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1 ${actorInfo.color}`}>
                      <ActorIcon className="w-3 h-3 mr-1" />
                      {actorInfo.label}
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">{event.event_type}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2 } as any)}
                    </span>
                    <button
                      onClick={() => onInspectEvent(event)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Inspect Event JSON"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-slate-300 font-medium">{event.action}</div>

                {event.reason_code && (
                  <div className="mt-1.5 flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400">Reason Code:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isRejection ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {event.reason_code}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
