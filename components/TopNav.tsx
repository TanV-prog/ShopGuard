'use client';

import React from 'react';
import { ShieldCheck, Moon, Sun, PlayCircle } from 'lucide-react';

interface TopNavProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: 'assistant' | 'values' | 'catalog';
  onSelectTab: (tab: 'assistant' | 'values' | 'catalog') => void;
  onOpenTestRunner: () => void;
}

export function TopNav({
  darkMode,
  onToggleDarkMode,
  activeTab,
  onSelectTab,
  onOpenTestRunner,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('assistant')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#005b96] text-[#b3cde0] border border-[#b3cde0]/40 shadow-sm transition-all group-hover:scale-105">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            ShopGuard
          </span>
        </button>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('assistant')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'assistant'
                ? 'text-[#005b96] dark:text-[#b3cde0] font-bold border-b-2 border-[#005b96] dark:border-[#b3cde0] pb-0.5'
                : 'text-slate-600 hover:text-[#005b96] dark:text-slate-400 dark:hover:text-[#b3cde0]'
            }`}
          >
            Order Assistant
          </button>
          <button
            onClick={() => onSelectTab('values')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'values'
                ? 'text-[#005b96] dark:text-[#b3cde0] font-bold border-b-2 border-[#005b96] dark:border-[#b3cde0] pb-0.5'
                : 'text-slate-600 hover:text-[#005b96] dark:text-slate-400 dark:hover:text-[#b3cde0]'
            }`}
          >
            Create Your Value
          </button>
          <button
            onClick={() => onSelectTab('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-[#005b96] dark:text-[#b3cde0] font-bold border-b-2 border-[#005b96] dark:border-[#b3cde0] pb-0.5'
                : 'text-slate-600 hover:text-[#005b96] dark:text-slate-400 dark:hover:text-[#b3cde0]'
            }`}
          >
            Price Catalog
          </button>
        </nav>

        {/* Zone 3: 1 primary action + theme toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-[#b3cde0]/20 hover:border-[#b3cde0] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={onOpenTestRunner}
            className="flex items-center gap-2 rounded-xl bg-[#005b96] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#004775] active:bg-[#003860] border border-[#b3cde0]/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PlayCircle className="h-4 w-4 text-[#b3cde0]" />
            <span>Run 97 Tests</span>
          </button>
        </div>
      </div>
    </header>
  );
}
