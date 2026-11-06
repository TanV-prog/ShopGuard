'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { DEFAULT_PRODUCTS } from '@/lib/products';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  ShieldAlert,
  KeyRound,
  Sparkles,
  Send,
  Tag,
  DollarSign,
  PackagePlus,
  Sliders,
  BookmarkPlus,
} from 'lucide-react';

interface CustomValueStudioProps {
  catalog: Product[];
  onUpdateCatalog: (newCatalog: Product[]) => void;
  spendingLimit: number;
  onUpdateSpendingLimit: (newLimit: number) => void;
  ownerPin: string;
  onUpdateOwnerPin: (newPin: string) => void;
  onSendCustomOrder: (customMessage: string) => void;
  customPresets: { label: string; tag: string; text: string }[];
  onAddCustomPreset: (preset: { label: string; tag: string; text: string }) => void;
}

export function CustomValueStudio({
  catalog,
  onUpdateCatalog,
  spendingLimit,
  onUpdateSpendingLimit,
  ownerPin,
  onUpdateOwnerPin,
  onSendCustomOrder,
  customPresets,
  onAddCustomPreset,
}: CustomValueStudioProps) {
  // New Product Form State
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('12.50');
  const [newUnit, setNewUnit] = useState('jar');
  const [newCategory, setNewCategory] = useState('Pantry');
  const [newDesc, setNewDesc] = useState('Artisan raw wildflower honey from high valley apiaries.');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Custom Order Builder State
  const [selectedProductId, setSelectedProductId] = useState(catalog[0]?.id || 'mangoes');
  const [selectedQty, setSelectedQty] = useState(2);
  const [recipientName, setRecipientName] = useState('Alex');
  const [customNote, setCustomNote] = useState('');

  // Editing existing product price inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFeedbackMsg('Please enter a valid price greater than $0.00');
      return;
    }

    const cleanId = (newId.trim() || newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')).slice(0, 24);

    // Check if ID already exists
    if (catalog.some((p) => p.id === cleanId)) {
      setFeedbackMsg(`A product with ID "${cleanId}" already exists. Please choose a different ID or name.`);
      return;
    }

    const newProduct: Product = {
      id: cleanId,
      name: newName.trim(),
      price: Math.round(priceNum * 100) / 100,
      unit: newUnit.trim() || 'unit',
      category: newCategory.trim() || 'Custom Artisan',
      description: newDesc.trim() || 'Custom merchant specialty product.',
      inStock: true,
    };

    const updated = [...catalog, newProduct];
    onUpdateCatalog(updated);
    setFeedbackMsg(`Successfully created product "${newProduct.name}" at $${newProduct.price.toFixed(2)} USD!`);

    // Reset form
    setNewId('');
    setNewName('');
    setNewPrice('9.50');
    setNewDesc('');

    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleDeleteProduct = (id: string) => {
    if (catalog.length <= 1) {
      alert('The shop must have at least one product in its catalog.');
      return;
    }
    const updated = catalog.filter((p) => p.id !== id);
    onUpdateCatalog(updated);
  };

  const handleStartEditPrice = (product: Product) => {
    setEditingId(product.id);
    setEditPriceValue(product.price.toFixed(2));
  };

  const handleSaveEditPrice = (id: string) => {
    const parsed = parseFloat(editPriceValue);
    if (!isNaN(parsed) && parsed > 0) {
      const updated = catalog.map((p) => (p.id === id ? { ...p, price: Math.round(parsed * 100) / 100 } : p));
      onUpdateCatalog(updated);
    }
    setEditingId(null);
  };

  const handleResetCatalog = () => {
    if (confirm('Reset catalog to the 7 original default products?')) {
      onUpdateCatalog(DEFAULT_PRODUCTS);
      setFeedbackMsg('Catalog reset to factory defaults.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  // Generate casual sentence from custom order builder
  const selectedProduct = catalog.find((p) => p.id === selectedProductId) || catalog[0];
  const generatedMessage = `${selectedQty} ${selectedProduct ? selectedProduct.unit : 'units'} of ${selectedProduct ? selectedProduct.name : 'items'}${recipientName ? ` for ${recipientName}` : ''}${customNote ? ` (${customNote})` : ''}`;

  const handleSendGeneratedOrder = () => {
    onSendCustomOrder(generatedMessage);
  };

  const handleSaveAsPreset = () => {
    const label = `${selectedQty} ${selectedProduct?.name.split(' ')[0]} for ${recipientName || 'friend'}`;
    const tag = `Custom ($${((selectedProduct?.price || 0) * selectedQty).toFixed(2)})`;
    onAddCustomPreset({
      label,
      tag,
      text: generatedMessage,
    });
    setFeedbackMsg(`Saved preset "${label}" to quick test buttons!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create Your Own Value Studio
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Define your own custom products, set custom spending thresholds, configure private PINs, and generate tailored test orders.
            </p>
          </div>

          <button
            onClick={handleResetCatalog}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>
        </div>

        {feedbackMsg && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Grid: Create Product Form & Guardrail Values */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form: Create Custom Product (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Create New Product in Catalog
            </h3>
          </div>

          <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newId) {
                      setNewId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }
                  }}
                  placeholder="e.g. Raw Forest Honey"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Product Identifier ID (Unique)
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. honey"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Price ($ USD) *
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0.50"
                    max="1000"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-xs font-mono font-bold text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Unit Sold
                </label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. jar, kg, box, bottle"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Pantry, Organics"
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Short Description
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Product origin, notes, packaging..."
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product to Catalog</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section: Custom Guardrail & Security Values (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Guardrail Values & Thresholds
            </h3>
          </div>

          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
              <span>Spending Guardrail Limit ($ USD)</span>
              <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                ${spendingLimit.toFixed(2)}
              </span>
            </label>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Orders with calculated totals strictly above this value will be halted for owner PIN approval.
            </p>

            {/* Slider */}
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={spendingLimit}
              onChange={(e) => onUpdateSpendingLimit(Number(e.target.value))}
              className="mt-3 w-full accent-slate-900 dark:accent-emerald-400 cursor-pointer"
            />

            {/* Quick Preset Buttons */}
            <div className="mt-2 flex gap-2">
              {[25, 50, 75, 100, 150].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateSpendingLimit(val)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    spendingLimit === val
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                <span>Shop Owner PIN Value</span>
              </span>
              <span className="font-mono tracking-widest text-xs text-slate-500">
                (constant-time verified)
              </span>
            </label>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Change the merchant authorization PIN to your own secret value.
            </p>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={ownerPin}
                onChange={(e) => onUpdateOwnerPin(e.target.value)}
                className="w-36 font-mono tracking-widest rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-xs text-slate-400">Current: {ownerPin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Custom Order Builder & Tester */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Custom Order Message Generator & Guardrail Tester
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price.toFixed(2)} / {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Quantity (1..50)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={selectedQty}
              onChange={(e) => setSelectedQty(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Recipient Name (Casual)
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Maya, Ravi, Dr. Patel"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button
              type="button"
              onClick={handleSendGeneratedOrder}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 px-3 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Test in Assistant</span>
            </button>
            <button
              type="button"
              onClick={handleSaveAsPreset}
              title="Save as custom preset"
              className="flex items-center justify-center rounded-xl border border-slate-300 p-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <BookmarkPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Generated Preview */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Generated Message:</span>
            <span className="font-medium italic">&ldquo;{generatedMessage}&rdquo;</span>
          </div>
          <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
            Estimated Total: ${((selectedProduct?.price || 0) * selectedQty).toFixed(2)} USD
            {((selectedProduct?.price || 0) * selectedQty) > spendingLimit ? ' (Over Limit Hold)' : ' (Passes)'}
          </div>
        </div>
      </div>

      {/* Product Catalog Management Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Current Live Price Catalog ({catalog.length} Products)
            </h3>
            <p className="text-xs text-slate-500">
              Prices and units are verified strictly by deterministic server code.
            </p>
          </div>
          <span className="text-xs text-slate-400">Click price to edit</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
              <tr>
                <th className="px-4 py-2.5 font-medium">ID</th>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Unit</th>
                <th className="px-4 py-2.5 font-medium text-right">Price (USD)</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {catalog.map((product) => {
                const isEditing = editingId === product.id;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {product.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{product.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">{product.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      per {product.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.25"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-20 rounded border border-slate-300 px-1.5 py-0.5 text-right font-mono text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditPrice(product.id)}
                            className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEditPrice(product)}
                          className="font-mono font-bold text-slate-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 tabular-nums cursor-pointer"
                        >
                          ${product.price.toFixed(2)}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditPrice(product)}
                          title="Edit Price"
                          className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete Product"
                          className="rounded p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
