'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { useParams } from 'next/navigation';

export default function ScanPage() {
  const params = useParams();
  const reference = params.reference as string;
  const [item, setItem] = useState<PurchaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [salePrice, setSalePrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [reference]);

  async function fetchItem() {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('reference', reference)
      .single();
    setItem(data);
    setLoading(false);
  }

  async function confirmSale() {
    if (!item || !salePrice) return;
    setSaving(true);

    await supabase
      .from('items')
      .update({
        status: 'Sold',
        sale_price: parseFloat(salePrice),
        sale_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', item.id);

    setSaving(false);
    setDone(true);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">❌</p>
          <p className="text-gray-900 font-medium">Item not found</p>
          <p className="text-sm text-gray-400 mt-1">Reference: {reference}</p>
        </div>
      </div>
    );
  }

  if (item.status === 'Sold' && !done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-gray-900 font-medium">Already sold</p>
          <p className="text-sm text-gray-400 mt-1">{reference} was sold on {item.sale_date ? new Date(item.sale_date).toLocaleDateString('fr-FR') : '-'} for {item.sale_price}€</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-xl font-semibold text-gray-900">Sale confirmed!</p>
          <p className="text-sm text-gray-500 mt-2">{item.brand} {item.category} — {reference}</p>
          <p className="text-2xl font-bold text-green-600 mt-3">{salePrice}€</p>
          <p className="text-sm text-gray-400 mt-1">Margin: +{(parseFloat(salePrice) - item.purchase_price).toFixed(0)}€</p>
          <a href="/" className="inline-block mt-6 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      {/* Item card */}
      <div className="glass-card rounded-2xl p-5 text-center">
        {item.image_url && (
          <img src={item.image_url} alt={item.brand + ' ' + item.category} className="w-32 h-32 object-cover rounded-xl mx-auto mb-4" />
        )}
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{reference}</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-1">{item.brand}</h2>
        <p className="text-[15px] text-gray-600">{item.category} — {item.size} — {item.color}</p>
        <p className="text-[13px] text-gray-400 mt-2">Bought for {item.purchase_price.toFixed(0)}€ on {new Date(item.purchase_date).toLocaleDateString('fr-FR')}</p>
      </div>

      {/* Sale form */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-[15px] font-medium text-gray-900 mb-4">Record Sale</h3>
        <div className="mb-4">
          <label className="block text-[13px] text-gray-500 mb-1.5">Sale Price (€)</label>
          <input
            type="number"
            step="1"
            min="0"
            value={salePrice}
            onChange={e => setSalePrice(e.target.value)}
            placeholder="0"
            className="w-full text-2xl font-semibold text-center py-3"
            autoFocus
          />
        </div>

        {salePrice && (
          <div className="text-center mb-4 py-2 rounded-xl bg-green-50">
            <p className="text-[13px] text-green-700 font-medium">
              Margin: +{(parseFloat(salePrice) - item.purchase_price).toFixed(0)}€
              ({((parseFloat(salePrice) - item.purchase_price) / parseFloat(salePrice) * 100).toFixed(0)}%)
            </p>
          </div>
        )}

        <button
          onClick={confirmSale}
          disabled={saving || !salePrice}
          className="w-full py-3.5 bg-green-500 text-white rounded-xl text-[15px] font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Confirm Sale'}
        </button>
      </div>
    </div>
  );
}