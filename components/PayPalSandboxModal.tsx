'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle, CreditCard, Lock, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PayPalSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalFormatted: string;
  lineItemsCount: number;
  onPaymentApproved: (orderId: string) => Promise<void>;
}

export function PayPalSandboxModal({
  isOpen,
  onClose,
  orderId,
  totalFormatted,
  lineItemsCount,
  onPaymentApproved,
}: PayPalSandboxModalProps) {
  const [step, setStep] = useState<'login' | 'review' | 'processing' | 'done'>('login');
  const [buyerEmail, setBuyerEmail] = useState('sb-buyer-us@shopguard.test');
  const [isCapturing, setIsCapturing] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsCapturing(true);
    setStep('processing');
    try {
      await onPaymentApproved(orderId);
      setStep('done');
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti failure if canvas not ready
      }
    } catch {
      setStep('review');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paypal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* PayPal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#003087] px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black italic tracking-wider">
              Pay<span className="text-[#0079C1]">Pal</span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-200 bg-sky-900/60 px-2 py-0.5 rounded">
              Sandbox
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close PayPal Sandbox checkout"
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="flex items-center gap-2 border-b border-amber-200/80 bg-amber-50 px-6 py-2.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>PayPal Sandbox Test Environment · No real money moves</span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 'login' && (
            <div className="space-y-4">
              <div>
                <h3 id="paypal-modal-title" className="text-base font-semibold text-slate-900 dark:text-white">
                  Log in with PayPal Sandbox
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Pre-configured US Personal Sandbox Buyer account for hackathon evaluation.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Sandbox Buyer Email
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Sandbox Password
                  </label>
                  <input
                    type="password"
                    value="••••••••••••"
                    readOnly
                    className="mt-1 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0079C1] py-2.5 text-sm font-semibold text-white shadow hover:bg-[#005ea6] active:bg-[#004b87] transition-colors cursor-pointer"
                >
                  <span>Log In to Sandbox</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Review and Pay
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Paying merchant: <span className="font-medium text-slate-700 dark:text-slate-300">ShopGuard Artisan Foods (US)</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>PayPal Order ID</span>
                  <span className="font-mono text-slate-900 dark:text-white">{orderId}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Items in Basket</span>
                  <span className="font-medium text-slate-900 dark:text-white">{lineItemsCount} items</span>
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                  <span>Total Amount (USD)</span>
                  <span className="font-mono text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ${totalFormatted}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <CreditCard className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    PayPal Sandbox Balance (USD)
                  </div>
                  <div>Ending in 4421 · Verified US Buyer Account</div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isCapturing}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#0079C1] py-2.5 text-xs font-semibold text-white shadow hover:bg-[#005ea6] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Approve & Complete (${totalFormatted})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0079C1]" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Contacting PayPal Orders v2 Sandbox...
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Executing intent CAPTURE for order {orderId}
              </p>
            </div>
          )}

          {step === 'done' && (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment Approved & Captured!
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PayPal sandbox payment of <span className="font-semibold text-slate-800 dark:text-slate-200">${totalFormatted} USD</span> was processed successfully.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
              >
                Return to ShopGuard Console
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
