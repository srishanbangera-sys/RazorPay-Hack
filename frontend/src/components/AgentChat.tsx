import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Wrench, Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { ChatMessage } from '../types';

interface AgentChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectProduct?: (productId: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectProduct
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="glass-card rounded-xl border border-merchant-border flex flex-col h-[560px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-merchant-border bg-merchant-dark/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Shopping Agent</h3>
            <p className="text-[11px] text-slate-400">Tool Calling & Bounded Authority Orchestration</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/40 font-mono">
          <Sparkles className="w-3 h-3" />
          <span>Autonomous Buyer</span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-950/50 border border-brand-800/60 flex items-center justify-center text-brand-400 mb-3">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Ready for Buyer Instruction</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Ask the shopping agent to find products or select one of the live demo presets above.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'buyer' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 px-1">
              {msg.sender === 'buyer' ? (
                <>
                  <span className="text-[10px] font-semibold text-slate-400">Buyer</span>
                  <User className="w-3 h-3 text-slate-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-brand-400" />
                  <span className="text-[10px] font-semibold text-brand-400">Agent</span>
                </>
              )}
              <span className="text-[10px] text-slate-500 font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === 'buyer'
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-merchant-surface border border-merchant-border text-slate-200 rounded-tl-none'
              }`}
            >
              {/* Render Tool Invocation Badges */}
              {msg.tools && msg.tools.length > 0 && (
                <div className="mb-2 pb-2 border-b border-slate-700/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 flex items-center font-mono">
                    <Wrench className="w-2.5 h-2.5 mr-1 text-brand-400" /> Tools:
                  </span>
                  {msg.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-brand-300"
                    >
                      {t.tool}()
                    </span>
                  ))}
                </div>
              )}

              {/* Message text with basic markdown styling */}
              <div className="whitespace-pre-line">
                {msg.text}
              </div>

              {/* Alternative Product Suggestion Card */}
              {msg.alternativeProduct && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Mandate-Compliant Alternative</div>
                    <div className="text-xs font-semibold text-white mt-0.5">{msg.alternativeProduct.name}</div>
                    <div className="text-xs text-emerald-300 font-mono">₹{msg.alternativeProduct.price.toLocaleString()} • In Stock</div>
                  </div>
                  {onSelectProduct && (
                    <button
                      onClick={() => onSelectProduct(msg.alternativeProduct!.id)}
                      className="flex items-center space-x-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded font-semibold transition-colors"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1.5 mb-1 px-1">
              <Bot className="w-3 h-3 text-brand-400" />
              <span className="text-[10px] font-semibold text-brand-400">Agent</span>
            </div>
            <div className="bg-merchant-surface border border-merchant-border rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></span>
              <span>Evaluating catalog & mandate boundary...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-merchant-border bg-merchant-dark/90">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type shopping request (e.g. 'Find running shoes under ₹1500')..."
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 disabled:hover:bg-brand-600 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
