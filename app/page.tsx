'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TopNav } from '@/components/TopNav';
import { OrderChatSimulator } from '@/components/OrderChatSimulator';
import { OrderSummaryCard } from '@/components/OrderSummaryCard';
import { PayPalSandboxModal } from '@/components/PayPalSandboxModal';
import { CatalogModal } from '@/components/CatalogModal';
import { ScorecardModal } from '@/components/ScorecardModal';
import { CustomValueStudio } from '@/components/CustomValueStudio';
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
  Sliders,
  PlusCircle,
} from 'lucide-react';

export default function ShopGuardHome() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'assistant' | 'values' | 'catalog'>('assistant');

  // Custom Value State with Deterministic Initial Values for Clean SSR Hydration
  const [catalog, setCatalog] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [spendingLimit, setSpendingLimit] = useState<number>(DEFAULT_SPENDING_LIMIT);
  const [ownerPin, setOwnerPin] = useState<string>(DEFAULT_OWNER_PIN);
  const [customPresets, setCustomPresets] = useState<{ label: string; tag: string; text: string }[]>([
    {
      label: 'Custom Honey ($25.00)',
      tag: 'User Value',
      text: '2 jars of raw forest honey for Alex',
    },
  ]);

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

  // Safe client-side mount hydration for saved user settings
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('shopguard_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

      const savedCatalog = localStorage.getItem('shopguard_custom_catalog');
      const savedLimit = localStorage.getItem('shopguard_spending_limit');
      const savedPin = localStorage.getItem('shopguard_owner_pin');
      const savedPresets = localStorage.getItem('shopguard_custom_presets');

      // Defer to next frame to prevent cascading render in effect body
      requestAnimationFrame(() => {
        if (shouldDark) {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
        }
        if (savedCatalog) {
          try {
            const parsed = JSON.parse(savedCatalog);
            if (Array.isArray(parsed) && parsed.length > 0) setCatalog(parsed);
          } catch {}
        }
        if (savedLimit) {
          const parsed = parseFloat(savedLimit);
          if (!isNaN(parsed) && parsed > 0) setSpendingLimit(parsed);
        }
        if (savedPin && savedPin.trim()) setOwnerPin(savedPin.trim());
        if (savedPresets) {
          try {
            const parsed = JSON.parse(savedPresets);
            if (Array.isArray(parsed)) setCustomPresets(parsed);
          } catch {}
        }
      });
    } catch (e) {
      console.warn('LocalStorage hydration load warning:', e);
    }
  }, []);

  // Synchronize document class whenever darkMode changes
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

  const handleUpdateCatalog = (newCatalog: Product[]) => {
    setCatalog(newCatalog);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopguard_custom_catalog', JSON.stringify(newCatalog));
    }
  };

  const handleUpdateSpendingLimit = (newLimit: number) => {
    const clamped = Math.max(1, Math.min(1000, newLimit));
    setSpendingLimit(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopguard_spending_limit', String(clamped));
    }
  };

  const handleUpdateOwnerPin = (newPin: string) => {
    const cleanPin = newPin.trim();
    setOwnerPin(cleanPin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopguard_owner_pin', cleanPin);
    }
  };

  const handleAddCustomPreset = (preset: { label: string; tag: string; text: string }) => {
    const updated = [preset, ...customPresets.filter((p) => p.label !== preset.label)];
    setCustomPresets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopguard_custom_presets', JSON.stringify(updated));
    }
  };

  const handleSelectNavTab = (tab: 'assistant' | 'values' | 'catalog') => {
    setActiveTab(tab);
    if (tab === 'catalog') {
      setIsCatalogModalOpen(true);
    }
  };

  // Pipeline execution
  const handleProcessOrder = async (overrideMessage?: string) => {
    const msgToProcess = overrideMessage || message;
    if (!msgToProcess.trim()) return;
    setIsProcessing(true);
    try {
      const order = await processCustomerMessage({
        message: msgToProcess,
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

  const handleSendCustomOrderFromStudio = (customMsg: string) => {
    setMessage(customMsg);
    setActiveTab('assistant');
    handleProcessOrder(customMsg);
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
                  <div className="font-bold text-slate-900 dark:text-white">{catalog.length} Products</div>
                  <div className="text-[11px] text-slate-500">Code pricing</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">${spendingLimit.toFixed(0)} Guardrail</div>
                  <div className="text-[11px] text-slate-500">Custom threshold</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">PIN {ownerPin}</div>
                  <div className="text-[11px] text-slate-500">Constant-time check</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveTab('assistant');
                    setMessage('2 kg mangoes and a pickle jar for Ravi');
                    handleProcessOrder('2 kg mangoes and a pickle jar for Ravi');
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[#005b96] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#004775] active:bg-[#003860] border border-[#b3cde0]/40 transition-all cursor-pointer"
                >
                  <span>Run Live Demo ($16.50)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab('values')}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'values'
                      ? 'border-[#005b96] bg-[#005b96] text-white shadow-sm ring-2 ring-[#b3cde0]/50'
                      : 'border-[#b3cde0] bg-[#b3cde0]/25 text-[#005b96] hover:bg-[#b3cde0]/45 dark:border-[#005b96] dark:bg-[#005b96]/20 dark:text-[#b3cde0]'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5 text-[#005b96] dark:text-[#b3cde0]" />
                  <span>Create Your Own Value</span>
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
                <div className="font-semibold">ShopGuard Artisan Foods · Custom Merchant Values Enabled</div>
                <div className="text-[11px] text-white/80">Interactive PayPal Sandbox & Gemini API merchant assistant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mode Switcher Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-[#005b96] text-white shadow-sm ring-2 ring-[#b3cde0]/50'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              Order Assistant View
            </button>
            <button
              onClick={() => setActiveTab('values')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'values'
                  ? 'bg-[#005b96] text-white shadow-sm ring-2 ring-[#b3cde0]/50'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Create Your Own Value Studio</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>Current Limit: <strong className="text-slate-900 dark:text-white font-mono">${spendingLimit.toFixed(2)}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Products: <strong className="text-slate-900 dark:text-white font-mono">{catalog.length}</strong></span>
          </div>
        </div>

        {/* View Switch: Values Studio OR Order Assistant Workspace */}
        {activeTab === 'values' ? (
          <CustomValueStudio
            catalog={catalog}
            onUpdateCatalog={handleUpdateCatalog}
            spendingLimit={spendingLimit}
            onUpdateSpendingLimit={handleUpdateSpendingLimit}
            ownerPin={ownerPin}
            onUpdateOwnerPin={handleUpdateOwnerPin}
            onSendCustomOrder={handleSendCustomOrderFromStudio}
            customPresets={customPresets}
            onAddCustomPreset={handleAddCustomPreset}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Customer Ingestion Simulator */}
            <div className="lg:col-span-7">
              <OrderChatSimulator
                message={message}
                onChangeMessage={setMessage}
                onProcessOrder={() => handleProcessOrder()}
                isProcessing={isProcessing}
                currentOrder={currentOrder}
                customPresets={customPresets}
                onOpenCustomValueStudio={() => setActiveTab('values')}
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
        )}
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
              onClick={() => setActiveTab('values')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Create Your Value
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
        onUpdateSpendingLimit={handleUpdateSpendingLimit}
        ownerPin={ownerPin}
        onUpdateOwnerPin={handleUpdateOwnerPin}
        onOpenCustomValueStudio={() => setActiveTab('values')}
      />

      <ScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
      />
    </div>
  );
}
