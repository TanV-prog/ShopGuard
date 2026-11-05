'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TopNav } from '@/components/TopNav';
import { OrderChatSimulator } from '@/components/OrderChatSimulator';
import { OrderSummaryCard } from '@/components/OrderSummaryCard';
import { PayPalSandboxModal } from '@/components/PayPalSandboxModal';
import { CatalogModal } from '@/components/CatalogModal';
import { ScorecardModal } from '@/components/ScorecardModal';
import { DevpostDocsModal } from '@/components/DevpostDocsModal';
import { DEFAULT_PRODUCTS } from '@/lib/products';
import { Product, ProcessedOrder } from '@/lib/types';
import { DEFAULT_SPENDING_LIMIT, DEFAULT_OWNER_PIN } from '@/lib/guardrail';
import { processCustomerMessage, handleOwnerApproval } from '@/lib/agent';
import {
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  ArrowRight,
  Award,
  Play,
  Package,
} from 'lucide-react';

export default function ShopGuardHome() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shopguard_theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState<'assistant' | 'catalog' | 'guardrails' | 'docs' | 'tests'>('assistant');
  const [catalog, setCatalog] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [spendingLimit, setSpendingLimit] = useState<number>(DEFAULT_SPENDING_LIMIT);
  const [ownerPin, setOwnerPin] = useState<string>(DEFAULT_OWNER_PIN);

  // Order state
  const [message, setMessage] = useState('2 kg mangoes and a pickle jar for Ravi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<ProcessedOrder | null>(null);

  // PayPal Sandbox modal
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
  const [isCreatingPayPal, setIsCreatingPayPal] = useState(false);

  // Other modals
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Synchronize document class with darkMode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('shopguard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('shopguard_theme', 'light');
    }
  };

  const handleSelectNavTab = (tab: 'assistant' | 'catalog' | 'guardrails' | 'docs' | 'tests') => {
    setActiveTab(tab);
    if (tab === 'catalog' || tab === 'guardrails') {
      setIsCatalogModalOpen(true);
    } else if (tab === 'docs') {
      setIsDocsOpen(true);
    } else if (tab === 'tests') {
      setIsScorecardOpen(true);
    }
  };

  // Pipeline execution
  const handleProcessOrder = async () => {
    if (!message.trim()) return;
    setIsProcessing(true);
    try {
      const order = await processCustomerMessage({
        message,
        catalog,
        spendingLimit,
      });
      setCurrentOrder(order);
    } catch (err) {
      console.error('Order processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Owner PIN authorization
  const handleAuthorizeWithPin = (pin: string) => {
    if (!currentOrder) return;
    const updated = handleOwnerApproval({
      order: currentOrder,
      pin,
      expectedPin: ownerPin,
      catalog,
    });
    setCurrentOrder(updated);
  };

  // Create PayPal Sandbox Order
  const handleInitiatePayPal = async () => {
    if (!currentOrder) return;
    setIsCreatingPayPal(true);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentOrder.totalAmount,
          currency: 'USD',
          orderDescription: `ShopGuard Order (${currentOrder.validatedItems.length} items)`,
        }),
      });

      const data = await res.json();
      if (data.success && data.orderId) {
        const updatedAudit = [...currentOrder.auditTrail];
        updatedAudit.push({
          timestamp: new Date().toISOString(),
          step: '7. PayPal Orders v2 Session Created',
          status: 'pass',
          detail: `Created PayPal Sandbox Order ${data.orderId} (intent CAPTURE, USD $${data.amount}). Sandbox checkout opened.`,
        });

        setCurrentOrder({
          ...currentOrder,
          paypalOrderId: data.orderId,
          paypalApprovalLink: data.approvalUrl,
          status: 'paypal_created',
          auditTrail: updatedAudit,
        });

        setIsPayPalModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to create PayPal order:', err);
    } finally {
      setIsCreatingPayPal(false);
    }
  };

  // Capture PayPal Payment
  const handlePaymentApproved = async (paypalOrderId: string) => {
    if (!currentOrder) return;
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: paypalOrderId }),
      });

      const data = await res.json();
      if (data.success && data.captureId) {
        const updatedAudit = [...currentOrder.auditTrail];
        updatedAudit.push({
          timestamp: new Date().toISOString(),
          step: '8. PayPal Order Captured',
          status: 'pass',
          detail: `Payment successfully captured! Capture ID: ${data.captureId}. Receipt verified.`,
        });

        setCurrentOrder({
          ...currentOrder,
          status: 'captured',
          paypalCaptureId: data.captureId,
          auditTrail: updatedAudit,
        });
      }
    } catch (err) {
      console.error('Failed to capture PayPal order:', err);
      throw err;
    }
  };

  const handleResetOrder = () => {
    setCurrentOrder(null);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* 3-Zone Top Navigation Bar */}
      <TopNav
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        activeTab={activeTab}
        onSelectTab={handleSelectNavTab}
        onOpenTestRunner={() => setIsScorecardOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Copy Column */}
            <div className="p-8 sm:p-10 lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-semibold text-slate-900 dark:text-white">ShopGuard</span>
                <span aria-hidden="true">·</span>
                <span>PayPal AI Hackathon 2026</span>
                <span aria-hidden="true">·</span>
                <span>Agentic Commerce</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance">
                Safe AI Order Assistant for Local Merchants
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Autonomy inside limits, with a human in the loop. Google Gemini reads casual customer messages, deterministic code checks prices and enforces spending guardrails, and PayPal Sandbox collects the payment.
              </p>

              {/* 4 Feature Badges in quiet text */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Gemini 3.8</div>
                  <div className="text-[11px] text-slate-500">AI reads chat</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Code Pricing</div>
                  <div className="text-[11px] text-slate-500">Zero AI math</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">${spendingLimit.toFixed(0)} Guardrail</div>
                  <div className="text-[11px] text-slate-500">Stops high orders</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Owner PIN</div>
                  <div className="text-[11px] text-slate-500">Constant-time check</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setMessage('2 kg mangoes and a pickle jar for Ravi');
                    handleProcessOrder();
                  }}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  <span>Run Live Demo ($16.50)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsDocsOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <span>Devpost Docs & Script</span>
                </button>
                <button
                  onClick={() => setIsCatalogModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>Price Catalog</span>
                </button>
              </div>
            </div>

            {/* Right Media Column */}
            <div className="relative h-64 sm:h-80 lg:h-full lg:min-h-[380px] lg:col-span-5 overflow-hidden">
              <Image
                src="/shopguard_artisan_market.jpg"
                alt="ShopGuard Artisan Market display with fresh mangoes, homemade pickles, and spices"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent lg:bg-gradient-to-r lg:from-white/40 lg:via-transparent dark:lg:from-slate-900/60" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-xl bg-slate-950/70 backdrop-blur-md text-xs border border-white/10">
                <div className="font-semibold">ShopGuard Artisan Foods · Ratnagiri & Kashmir Harvest</div>
                <div className="text-[11px] text-white/80">Interactive PayPal Sandbox & Gemini API merchant assistant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Interactive Workspace: 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer Ingestion Simulator */}
          <div className="lg:col-span-7">
            <OrderChatSimulator
              message={message}
              onChangeMessage={setMessage}
              onProcessOrder={handleProcessOrder}
              isProcessing={isProcessing}
              currentOrder={currentOrder}
            />
          </div>

          {/* Right Column: Verified Order Summary & Guardrail Controller */}
          <div className="lg:col-span-5">
            <OrderSummaryCard
              order={currentOrder}
              onAuthorizeWithPin={handleAuthorizeWithPin}
              onInitiatePayPal={handleInitiatePayPal}
              onResetOrder={handleResetOrder}
              isCreatingPayPal={isCreatingPayPal}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            ShopGuard · Built for the PayPal AI Hackathon on Devpost (November 2026).
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsScorecardOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              97 Automated Tests
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Devpost Write-up
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Shop Catalog
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PayPalSandboxModal
        isOpen={isPayPalModalOpen}
        onClose={() => setIsPayPalModalOpen(false)}
        orderId={currentOrder?.paypalOrderId || 'ORDER-SANDBOX-101'}
        totalFormatted={currentOrder?.totalFormatted || '16.50'}
        lineItemsCount={currentOrder?.validatedItems.length || 0}
        onPaymentApproved={handlePaymentApproved}
      />

      <CatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        catalog={catalog}
        spendingLimit={spendingLimit}
        onUpdateSpendingLimit={setSpendingLimit}
        ownerPin={ownerPin}
        onUpdateOwnerPin={setOwnerPin}
      />

      <ScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
      />

      <DevpostDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
