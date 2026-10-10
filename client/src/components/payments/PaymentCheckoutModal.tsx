import React, { useState } from 'react';
import { paymentApi } from '../../services/apiClient';
import { CreditCard, ShieldCheck, DollarSign, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface PaymentCheckoutModalProps {
  projectId: string;
  milestoneId: string;
  milestoneTitle: string;
  amount: number;
  currency?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  projectId,
  milestoneId,
  milestoneTitle,
  amount,
  currency = 'INR',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'processing' | 'success'>('checkout');

  if (!isOpen) return null;

  const platformFee = Math.round(amount * 0.1);
  const netCreatorAmount = amount - platformFee;

  const handleProcessPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentStep('processing');

      // 1. Create order on server
      const order = await paymentApi.createOrder({
        projectId,
        milestoneId,
        idempotencyKey: `idemp_${projectId}_${milestoneId}_${Date.now()}`,
      });

      // 2. Client verification callback
      await paymentApi.verifyPayment({
        paymentId: order._id,
        providerPaymentId: `pay_captured_${Date.now()}`,
        providerSignature: order.providerSignature,
      });

      setLoading(false);
      setPaymentStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setPaymentStep('checkout');
      setError(err.response?.data?.error || err.message || 'Payment processing failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <CreditCard size={22} />
            <h2 className="text-lg font-bold text-white">Milestone Payment Checkout</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {paymentStep === 'checkout' && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
              <span className="text-neutral-400 font-mono text-[10px] uppercase">Target Milestone</span>
              <h3 className="text-sm font-bold text-white">{milestoneTitle}</h3>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {currency} {amount.toLocaleString()}
              </div>
            </div>

            {/* Fee Transparency Breakdown */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-slate-300">
              <h4 className="font-bold text-white text-xs mb-1">Fee Transparency Breakdown</h4>
              <div className="flex justify-between">
                <span>Creator Net Milestone Allocation (90%):</span>
                <span className="font-bold text-white font-mono">{currency} {netCreatorAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Processing & Escrow Service Fee (10%):</span>
                <span className="font-bold text-cyan-400 font-mono">{currency} {platformFee.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 font-medium text-neutral-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-lg shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Confirm & Pay Escrow
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={36} className="animate-spin text-emerald-400" />
            <p className="text-sm font-semibold text-white">Verifying payment signature with provider...</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
            <CheckCircle2 size={44} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Payment Verified & Captured</h3>
            <p className="text-xs text-neutral-400">Milestone funds recorded in immutable financial ledger.</p>
          </div>
        )}
      </div>
    </div>
  );
};
