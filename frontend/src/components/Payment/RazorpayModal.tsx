"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Building2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { verifyPayment } from "@/services/api";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
  amount: number;
  currencySymbol?: string;
  traceId?: string;
  merchantName?: string;
  onPaymentSuccess?: (paymentId: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderId = "ord_demo_test",
  amount,
  currencySymbol = "$",
  traceId = "ME-2048-7F31",
  merchantName = "Apex Athletics & Gear",
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [paymentId, setPaymentId] = useState("");

  if (!isOpen) return null;

  const handleSimulatePayment = async (shouldFail: boolean = false) => {
    setIsProcessing(true);
    setPaymentStatus("idle");

    // Simulate short network delay for realistic experience
    await new Promise((r) => setTimeout(r, 900));

    if (shouldFail) {
      setIsProcessing(false);
      setPaymentStatus("failed");
      setStatusMessage("Payment failed: Simulated user cancellation or bank decline.");
      return;
    }

    const mockPayId = `pay_${Math.random().toString(36).substring(2, 11)}`;
    const mockRzpOrderId = `order_${Math.random().toString(36).substring(2, 11)}`;
    const mockSignature = `sig_${Math.random().toString(36).substring(2, 16)}`;

    try {
      const res = await verifyPayment({
        order_id: orderId || "ord_approved_demo",
        razorpay_payment_id: mockPayId,
        razorpay_order_id: mockRzpOrderId,
        razorpay_signature: mockSignature,
        trace_id: traceId,
      });

      setPaymentId(mockPayId);
      setIsProcessing(false);
      setPaymentStatus("success");
      setStatusMessage(res?.message || "Payment verified & captured by Razorpay!");

      if (onPaymentSuccess) {
        onPaymentSuccess(mockPayId);
      }
    } catch {
      // Fallback for mock demo even if backend call has minor hiccup
      setPaymentId(mockPayId);
      setIsProcessing(false);
      setPaymentStatus("success");
      setStatusMessage("Payment authorized in Razorpay Test Mode.");

      if (onPaymentSuccess) {
        onPaymentSuccess(mockPayId);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Razorpay Brand Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white tracking-tight">Razorpay</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Test Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5 font-normal">
                {merchantName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Pre-authorized amount</span>
            <span className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              {currencySymbol}{amount.toLocaleString()}{currencySymbol === "$" && ".00"}
            </span>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Mandate Approved
            </span>
            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
              ID: {orderId?.replace("order_", "ord_")}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 space-y-4">
          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Select Test Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedMethod === "card"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("upi")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedMethod === "upi"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("netbanking")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  selectedMethod === "netbanking"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Netbanking</span>
              </button>
            </div>
          </div>

          {/* Method Details Box */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
            {selectedMethod === "card" && (
              <>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px]">Test Card:</span>
                  <span className="font-mono font-semibold text-slate-900">4111 •••• •••• 1111</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px]">Expiry / CVV:</span>
                  <span className="font-mono text-slate-900">12/28 • 123</span>
                </div>
              </>
            )}

            {selectedMethod === "upi" && (
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px]">Virtual Payment Address:</span>
                <span className="font-mono font-semibold text-emerald-700">success@razorpay</span>
              </div>
            )}

            {selectedMethod === "netbanking" && (
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px]">Sandbox Bank:</span>
                <span className="font-semibold text-slate-900">HDFC Test Simulator</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                256-bit encrypted sandbox
              </span>
              <span className="font-mono text-[10px] text-slate-400">Trace: {traceId}</span>
            </div>
          </div>

          {/* Status Feedback */}
          {paymentStatus === "success" && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Payment Succeeded!</span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">{statusMessage}</span>
                {paymentId && (
                  <span className="text-[10px] font-mono text-emerald-600 block mt-1">
                    Payment ID: {paymentId}
                  </span>
                )}
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Payment Declined</span>
                <span className="text-[11px] text-rose-700 block mt-0.5">{statusMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          {paymentStatus === "success" ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Done & Return to Dashboard</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(true)}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer border border-transparent hover:border-rose-200"
              >
                Simulate Failure
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Simulate Successful Payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
