'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateReference } from '@/lib/reference';
import { BRANDS, CATEGORIES, SIZES, CONDITIONS, COLORS } from '@/lib/constants';

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
    condition: 'Like new',
    image_url: '',
    notes: '',
  });

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent, addAnother: boolean) {
    e.preventDefault();
    setLoading(true);

    const reference = await generateReference(form.category, form.color);

    const { error } = await supabase.from('items').insert({
      brand: form.brand,
      category: form.category,
      size: form.size,
      color: form.color,
      purchase_price: parseFloat(form.purchase_price),
      purchase_date: form.purchase_date,
      platform: 'Vinted',
      condition: form.condition,
      image_url: form.image_url || null,
      notes: form.notes || null,
      status: 'In Stock',
      reference: reference,
    });

    setLoading(false);

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    if (addAnother) {
      setForm(prev => ({ ...prev, purchase_price: '', image_url: '', notes: '' }));
    } else {
      router.push('/purchases');
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">Add Purchase</h1>
        <p className="text-[14px] text-gray-500 mt-1">A reference will be auto-generated.</p>
      </div>

      <form onSubmit={e => handleSubmit(e, false)} className="space-y-4">
        <div className="glass-card rounded-2xl p-5 space-y-4">
          {/* Brand */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Brand</label>
            <select value={form.brand} onChange={e => updateField('brand', e.target.value)} className="w-full">
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Category + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Category</label>
              <select value={form.category} onChange={e => updateField('category', e.target.value)} className="w-full">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Size</label>
              <select value={form.size} onChange={e => updateField('size', e.target.value)} className="w-full">
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Color + Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Color</label>
              <select value={form.color} onChange={e => updateField('color', e.target.value)} className="w-full">
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Condition</label>
              <select value={form.condition} onChange={e => updateField('condition', e.target.value)} className="w-full">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Price (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.purchase_price}
                onChange={e => updateField('purchase_price', e.target.value)}
                placeholder="0"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Date</label>
              <input type="date" value={form.purchase_date} onChange={e => updateField('purchase_date', e.target.value)} className="w-full" />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Image URL (optional)</label>
            <input
              type="url"
              value={form.image_url}
              onChange={e => updateField('image_url', e.target.value)}
              placeholder="https://..."
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => updateField('notes', e.target.value)}
              placeholder="Any details..."
              className="w-full"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-[14px] font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={e => handleSubmit(e, true)}
            disabled={loading}
            className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl text-[14px] font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Save & Next
          </button>
        </div>
      </form>
    </div>
  );
}