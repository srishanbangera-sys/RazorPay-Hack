import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { RazorpayOrderDetails } from '../types';
import { verifyPayment } from '../services/api';

interface RazorpayModalProps {
  orderDetails: RazorpayOrderDetails | null;
  localOrderId?: string;
  traceId?: string;
  onClose: () => void;
  onPaymentComplete: (result: { success: boolean; message: string }) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  orderDetails,
  localOrderId,
  traceId,
  onClose,
  onPaymentComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  if (!orderDetails) return null;

  const handleSimulatePayment = async (success: boolean) => {
    if (!localOrderId) return;
    setIsProcessing(true);

    try {
      if (success) {
        const fakePaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 11)}`;
        const fakeSignature = `sig_${Math.random().toString(36).substring(2, 16)}`;

        const res = await verifyPayment(
          localOrderId,
          fakePaymentId,
          orderDetails.order_id,
          fakeSignature,
          traceId
        );

        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentComplete({ success: true, message: res.message || 'Payment completed successfully.' });
        }, 1200);
      } else {
        setPaymentStatus('failed');
        setTimeout(() => {
          onPaymentComplete({ success: false, message: 'Payment cancelled or rejected by card issuer.' });
        }, 1200);
      }
    } catch (err: any) {
      setPaymentStatus('failed');
      setTimeout(() => {
        onPaymentComplete({ success: false, message: err.message || 'Payment verification failed.' });
      }, 1200);
    } finally {
      setIsProcessing(false);
    }
  };

  const amountInRupees = orderDetails.amount / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0B101D] border border-blue-900/60 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="px-6 py-4 bg-[#0c2340] border-b border-blue-800/60 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white tracking-tighter">
              R
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">Razorpay <span className="text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded text-blue-200 uppercase font-mono">Test Mode</span></div>
              <div className="text-[11px] text-blue-200">{orderDetails.merchant_name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-4 text-xs">
          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-slate-400 text-xs">Amount Payable</div>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">₹{amountInRupees.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Order ID: {orderDetails.order_id}</div>
          </div>

          {/* Test Mode Banner */}
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/80 text-amber-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold">Razorpay Test Environment:</span> No actual card or bank charges will occur. Mandate engine approval was required prior to generating this order.
            </div>
          </div>

          {/* Status Feedback */}
          {paymentStatus === 'success' && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-center flex items-center justify-center space-x-2 font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Payment Captured & Verified!</span>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-center flex items-center justify-center space-x-2 font-bold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Payment Simulation Cancelled</span>
            </div>
          )}

          {/* Action Buttons */}
          {paymentStatus === 'idle' && (
            <div className="space-y-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>Simulate Successful Test Payment</span>
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleSimulatePayment(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors disabled:opacity-50"
              >
                Simulate Payment Failure
              </button>
            </div>
          )}
        </div>

        {/* Secure Footer */}
        <div className="px-6 py-3 bg-[#080d18] border-t border-slate-800/80 flex items-center justify-center space-x-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Server-Side Authorized • Zero Client Price Trust</span>
        </div>
      </div>
    </div>
  );
};
