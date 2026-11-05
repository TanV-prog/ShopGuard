'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { X, ShieldAlert, KeyRound, DollarSign, Package } from 'lucide-react';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Product[];
  spendingLimit: number;
  onUpdateSpendingLimit: (newLimit: number) => void;
  ownerPin: string;
  onUpdateOwnerPin: (newPin: string) => void;
}

export function CatalogModal({
  isOpen,
  onClose,
  catalog,
  spendingLimit,
  onUpdateSpendingLimit,
  ownerPin,
  onUpdateOwnerPin,
}: CatalogModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h2 id="catalog-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Shop Price List & Guardrail Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close catalog modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Merchant Guardrail Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Spending Guardrail Limit ($ USD)</span>
              </label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Orders with totals strictly exceeding this threshold will be stopped for Owner PIN approval.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">$</span>
                <input
                  type="number"
                  step="5.00"
                  min="5"
                  max="500"
                  value={spendingLimit}
                  onChange={(e) => onUpdateSpendingLimit(Math.max(1, Number(e.target.value) || 50))}
                  className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-xs text-slate-500">Default: $50.00</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Shop Owner Authorization PIN</span>
              </label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Constant-time verified PIN required to approve and unlock over-limit orders.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={ownerPin}
                  onChange={(e) => onUpdateOwnerPin(e.target.value)}
                  className="w-32 font-mono tracking-widest rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-xs text-slate-500">Default: 1234</span>
              </div>
            </div>
          </div>

          {/* Product Catalog Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Official Price Catalog ({catalog.length} Verified Products)
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Deterministic Code Pricing · AI Never Sets Prices
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Product ID</th>
                    <th className="px-4 py-2.5 font-medium">Item Name</th>
                    <th className="px-4 py-2.5 font-medium">Category</th>
                    <th className="px-4 py-2.5 font-medium">Unit</th>
                    <th className="px-4 py-2.5 font-medium text-right">Price (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {catalog.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {product.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {product.category}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        per {product.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        ${product.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
