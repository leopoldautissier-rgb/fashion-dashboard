'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { BRANDS, CATEGORIES, SIZES, PLATFORMS, CONDITIONS, COLORS } from '@/lib/constants';

export default function NewPurchasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    brand: 'Dior',
    category: 'Dress',
    size: 'S',
    color: 'Black',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    platform: 'Vinted',
    condition: 'Like new',
    notes: '',
  });

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('items').insert({
      brand: form.brand,
      category: form.category,
      size: form.size,
      color: form.color,
      purchase_price: parseFloat(form.purchase_price),
      purchase_date: form.purchase_date,
      platform: form.platform,
      condition: form.condition,
      notes: form.notes || null,
      status: 'In Stock',
    });

    setLoading(false);

    if (error) {
      alert('Error saving item: ' + error.message);
      return;
    }

    router.push('/purchases');
  }

  async function handleSubmitAndNew(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('items').insert({
      brand: form.brand,
      category: form.category,
      size: form.size,
      color: form.color,
      purchase_price: parseFloat(form.purchase_price),
      purchase_date: form.purchase_date,
      platform: form.platform,
      condition: form.condition,
      notes: form.notes || null,
      status: 'In Stock',
    });

    setLoading(false);

    if (error) {
      alert('Error saving item: ' + error.message);
      return;
    }

    // Reset price and notes, keep other fields for batch entry
    setForm(prev => ({ ...prev, purchase_price: '', notes: '' }));
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-brand-900 mb-6">Add Purchase</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">Brand</label>
          <select
            value={form.brand}
            onChange={e => updateField('brand', e.target.value)}
            className="w-full"
          >
            {BRANDS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={e => updateField('category', e.target.value)}
            className="w-full"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Size and Color - side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Size</label>
            <select
              value={form.size}
              onChange={e => updateField('size', e.target.value)}
              className="w-full"
            >
              {SIZES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Color</label>
            <select
              value={form.color}
              onChange={e => updateField('color', e.target.value)}
              className="w-full"
            >
              {COLORS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price and Date - side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">
              Purchase Price (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.purchase_price}
              onChange={e => updateField('purchase_price', e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Purchase Date</label>
            <input
              type="date"
              value={form.purchase_date}
              onChange={e => updateField('purchase_date', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Platform and Condition - side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Platform</label>
            <select
              value={form.platform}
              onChange={e => updateField('platform', e.target.value)}
              className="w-full"
            >
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Condition</label>
            <select
              value={form.condition}
              onChange={e => updateField('condition', e.target.value)}
              className="w-full"
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={e => updateField('notes', e.target.value)}
            rows={2}
            placeholder="Any details about this item..."
            className="w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-brand-900 text-white rounded-lg hover:bg-brand-800 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleSubmitAndNew}
            disabled={loading}
            className="px-5 py-2.5 bg-brand-100 text-brand-900 rounded-lg hover:bg-brand-200 disabled:opacity-50 text-sm font-medium"
          >
            Save & Add Another
          </button>
          <a
            href="/purchases"
            className="px-5 py-2.5 text-brand-600 hover:text-brand-900 text-sm font-medium flex items-center"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
