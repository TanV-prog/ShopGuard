'use client';

import React, { useState } from 'react';
import { DEVPOST_WRITEUP, DEMO_SCRIPT, JUDGE_FAQ } from '@/lib/docs-content';
import { X, Copy, Check, FileText, Video, HelpCircle, CheckSquare } from 'lucide-react';

interface DevpostDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevpostDocsModal({ isOpen, onClose }: DevpostDocsModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'writeup' | 'script' | 'faq' | 'checklist'>('writeup');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="devpost-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            <h2 id="devpost-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Devpost Submission Hub & Documentation
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close documentation modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 dark:border-slate-800 dark:bg-slate-950">
          <button
            onClick={() => setActiveSubTab('writeup')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'writeup'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Devpost Write-up</span>
          </button>
          <button
            onClick={() => setActiveSubTab('script')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'script'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>3-Min Video Script</span>
          </button>
          <button
            onClick={() => setActiveSubTab('faq')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'faq'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Judge Q&A (FAQ)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('checklist')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'checklist'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Submission Blocks</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          {activeSubTab === 'writeup' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to copy and paste into the Devpost submission form.
                </div>
                <button
                  onClick={() => handleCopy(DEVPOST_WRITEUP, 'writeup')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {copiedSection === 'writeup' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 leading-relaxed max-h-[60vh] overflow-y-auto">
                {DEVPOST_WRITEUP}
              </pre>
            </div>
          )}

          {activeSubTab === 'script' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Scene-by-scene timing for your YouTube video submission (under 3 minutes).
                </div>
                <button
                  onClick={() => handleCopy(DEMO_SCRIPT, 'script')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {copiedSection === 'script' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 leading-relaxed max-h-[60vh] overflow-y-auto">
                {DEMO_SCRIPT}
              </pre>
            </div>
          )}

          {activeSubTab === 'faq' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Key architectural decisions and anticipated questions for hackathon judges:
              </div>
              <div className="space-y-3">
                {JUDGE_FAQ.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      Q: {item.q}
                    </div>
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'checklist' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Execution roadmap & submission blocks:
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Block A: Live Verification Check</span>
                    <span className="text-emerald-600 font-mono">COMPLETE</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Verify standard order ($16.50), over-limit trigger ($125.00), owner PIN approval, and PayPal capture.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Block B: Public GitHub Repository Push</span>
                    <span className="text-slate-500 font-mono">READY</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Push to GitHub with MIT license visible in About. Ensure .env is omitted via .gitignore.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Block C: 3-Minute Demo Video Recording</span>
                    <span className="text-slate-500 font-mono">SCRIPT READY</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Record walkthrough following DEMO_SCRIPT.md without background copyrighted audio.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Block D: Devpost Form Submission</span>
                    <span className="text-slate-500 font-mono">DEADLINE: 12 NOV</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Paste write-up, insert GitHub and YouTube links, target submission by Nov 10 or 11.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                    <span>Block E: Fresh Clone Test</span>
                    <span className="text-slate-500 font-mono">STANDBY</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Clone into clean test directory and confirm clean build from README instructions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
