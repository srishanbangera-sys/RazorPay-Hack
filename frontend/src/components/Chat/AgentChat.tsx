"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Product } from "@/types";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import { ProductCarousel } from "./ProductCarousel";
import { InterventionApprovedCard } from "./InterventionApprovedCard";
import { InterventionRejectedCard } from "./InterventionRejectedCard";

interface AgentChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currencySymbol?: string;
  onSendMessage: (text: string) => void;
  onSelectProduct?: (product: Product) => void;
  onViewAudit?: () => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  isLoading,
  currencySymbol = "$",
  onSendMessage,
  onSelectProduct,
  onViewAudit,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden h-[calc(100vh-100px)]">
      {/* Top Pane Header matching Figma */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none">
            Shopping agent
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Planning within mandate • Live session
          </p>
        </div>
        <div className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-600 text-[11px] font-medium shadow-2xs">
          AI proposes
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">
        {messages.map((msg) => {
          if (msg.sender === "buyer") {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-md md:max-w-lg rounded-2xl bg-slate-900 text-white px-4 py-3 text-xs leading-relaxed shadow-sm font-normal">
                  {msg.text}
                </div>
              </div>
            );
          }

          // Agent Message
          return (
            <div key={msg.id} className="flex flex-col space-y-2 max-w-2xl">
              {/* Agent Title & Avatar */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span>Mandate AI</span>
              </div>

              {/* Agent Text */}
              <div className="text-xs text-slate-700 leading-relaxed font-normal pl-7 whitespace-pre-line">
                {msg.text}
              </div>

              {/* Custom Component: Horizontal Product Carousel */}
              {msg.carousel_products && msg.carousel_products.length > 0 && (
                <div className="pl-7 w-full">
                  <ProductCarousel
                    products={msg.carousel_products}
                    currencySymbol={currencySymbol}
                    onSelectProduct={onSelectProduct}
                  />
                </div>
              )}

              {/* Custom Component: Approved Intervention Card */}
              {msg.component_type === "approved_card" && (
                <div className="pl-7 w-full">
                  <InterventionApprovedCard
                    total={msg.cart_total ?? 189}
                    currencySymbol={currencySymbol}
                    orderId={msg.order_id}
                    upsellItem={msg.upsell_item}
                    onViewAudit={onViewAudit}
                    onAddUpsell={(item) => onSendMessage(`Add ${item.name} to my cart and confirm checkout`)}
                  />
                </div>
              )}

              {/* Custom Component: Rejected Intervention Card */}
              {msg.component_type === "rejected_card" && (
                <div className="pl-7 w-full">
                  <InterventionRejectedCard
                    failureDetails={msg.failure_details}
                    alternativeProduct={msg.alternative_product}
                    currencySymbol={currencySymbol}
                    onAcceptAlternative={(alt) => {
                      const altName = alt?.name || "the compliant alternative";
                      onSendMessage(`Let's purchase ${altName} within my mandate budget.`);
                    }}
                    onViewAudit={onViewAudit}
                  />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pl-7 py-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span>Mandate AI is searching catalog & evaluating server rules...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-6 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-medium whitespace-nowrap">Try scenario:</span>
        <button
          onClick={() =>
            handleQuickPrompt(
              "Find a reliable travel setup under my approved budget. Prioritize carry-on size."
            )
          }
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors font-medium shadow-2xs"
        >
          ✈️ Carry-on setup ($189)
        </button>
        <button
          onClick={() =>
            handleQuickPrompt(
              "Buy the luxury luggage $1099"
            )
          }
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition-colors font-medium shadow-2xs"
        >
          🚫 Luxury trunk $1099 (Test Block)
        </button>
        <button
          onClick={() =>
            handleQuickPrompt("Find me running shoes under ₹1500")
          }
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors font-medium shadow-2xs"
        >
          👟 Running shoes under ₹1500
        </button>
        <button
          onClick={() =>
            handleQuickPrompt("Buy the premium running shoes")
          }
          className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition-colors font-medium shadow-2xs"
        >
          ❌ Premium runner (Test Block)
        </button>
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask the shopping agent (e.g., 'Find carry-on setup under budget')..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-900 placeholder-slate-400 font-normal transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
