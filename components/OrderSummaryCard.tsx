'use client';

import React, { useState } from 'react';
import { ProcessedOrder } from '@/lib/types';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Receipt,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface OrderSummaryCardProps {
  order: ProcessedOrder | null;
  onAuthorizeWithPin: (pin: string) => void;
  onInitiatePayPal: () => void;
  onResetOrder: () => void;
  isCreatingPayPal: boolean;
}

export function OrderSummaryCard({
  order,
  onAuthorizeWithPin,
  onInitiatePayPal,
  onResetOrder,
  isCreatingPayPal,
}: OrderSummaryCardProps) {
  const [pinInput, setPinInput] = useState('');

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
        <Receipt className="mx-auto h-10 w-10 text-slate-400" />
        <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Active Order Processed
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Type a customer message on the left or select a preset to watch the AI parser, safety validation, deterministic pricing, and PayPal guardrail in action.
        </p>
      </div>
    );
  }

  const isOverLimitHold = order.status === 'needs_confirmation' || order.status === 'unauthorized';
  const isReadyToPay = order.status === 'valid' || order.status === 'owner_approved';
  const isCaptured = order.status === 'captured';
  const isRejected = order.status === 'rejected' || order.status === 'no_items' || order.status === 'ai_error';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Order Review & Guardrail Decision
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Deterministic Math</span>
            <span aria-hidden="true">·</span>
            <span>Limit: ${order.spendingLimit.toFixed(2)} USD</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">ID: {order.orderId}</span>
          </div>
        </div>

        <button
          onClick={onResetOrder}
          title="Reset and start new order"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 p-2 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Order</span>
        </button>
      </div>

      {/* Verified Items Table */}
      {order.validatedItems.length > 0 ? (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Priced Line Items ({order.validatedItems.length})
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-3.5 py-2 font-medium">Item</th>
                  <th className="px-3.5 py-2 font-medium text-right">Unit Price</th>
                  <th className="px-3.5 py-2 font-medium text-right">Qty</th>
                  <th className="px-3.5 py-2 font-medium text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {order.validatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                      {item.qty} {item.unit}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ${item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total & Limits Bar */}
          <div className="mt-3 flex items-baseline justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Calculated Total (USD)
              </div>
              <div className="text-[11px] text-slate-400">
                Merchant limit: ${order.spendingLimit.toFixed(2)} USD
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                ${order.totalFormatted}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
          No catalog items recognized from the customer input.
        </div>
      )}

      {/* Guardrail & Status Decision Banner */}
      <div className="mt-4">
        {isOverLimitHold && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Spending Guardrail Triggered · Approval Required
                </div>
                <div className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {order.statusMessage}
                </div>
              </div>
            </div>

            {/* Owner PIN Form */}
            <div className="mt-4 border-t border-amber-200/80 pt-3 dark:border-amber-900/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pinInput.trim()) onAuthorizeWithPin(pinInput);
                }}
                className="flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="relative w-full sm:w-44">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Owner PIN"
                    className="w-full rounded-lg border border-amber-300 bg-white py-2 pl-9 pr-3 text-xs font-mono font-bold tracking-widest text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!pinInput.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Verify PIN & Authorize</span>
                </button>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 ml-1">
                  (Default PIN: 1234)
                </span>
              </form>
            </div>
          </div>
        )}

        {order.status === 'owner_approved' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Owner PIN Approved
                </div>
                <div className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                  {order.statusMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {order.status === 'valid' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Guardrail Passed
                </div>
                <div className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                  {order.statusMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {isCaptured && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Payment Captured in PayPal Sandbox</span>
            </div>
            <div className="text-xs text-emerald-800 dark:text-emerald-300">
              Receipt Reference: <span className="font-mono font-bold">{order.paypalCaptureId}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              PayPal Order ID: {order.paypalOrderId} · Intent: CAPTURE
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                  Order Not Processable
                </div>
                <div className="mt-1 text-xs text-rose-800 dark:text-rose-300">
                  {order.statusMessage}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PayPal Action Button */}
      {isReadyToPay && (
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onInitiatePayPal}
            disabled={isCreatingPayPal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0070BA] py-3 text-xs font-bold text-white shadow-md hover:bg-[#005ea6] active:bg-[#004b87] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isCreatingPayPal ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating PayPal Orders v2 Session...</span>
              </>
            ) : (
              <>
                <span>Pay with PayPal Sandbox (${order.totalFormatted} USD)</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <div className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
            PayPal Orders v2 · Intent CAPTURE · Sandbox Safe Simulation
          </div>
        </div>
      )}
    </div>
  );
}
