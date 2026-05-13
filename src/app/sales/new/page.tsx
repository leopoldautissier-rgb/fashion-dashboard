'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';

export default function NewSalePage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInStockItems();
  }, []);

  async function fetchInStockItems() {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'In Stock')
      .order('purchase_date', { ascending: false });
    if (data) setItems(data as PurchaseItem[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setLoading(true);

    const { error } = await supabase
      .from('items')
      .update({
        status: 'Sold',
        sale_price: parseFloat(salePrice),
        sale_date: saleDate,
      })
      .eq('id', selectedItem);

    setLoading(false);

    if (error) {
      alert('Error recording sale: ' + error.message);
      return;
    }

    setSelectedItem('');
    setSalePrice('');
    fetchInStockItems();
  }

  const selected = items.find(i => i.id === selectedItem);
  const margin = selected && salePrice
    ? parseFloat(salePrice) - selected.purchase_price
    : null;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-brand-900 mb-6">Record a Sale</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-700 mb-1">
            Select Item ({items.length} in stock)
          </label>
          <select
            value={selectedItem}
            onChange={e => setSelectedItem(e.target.value)}
            required
            className="w-full"
          >
            <option value="">-- Choose an item --</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.brand} - {item.category} - {item.size} - {item.color} ({item.purchase_price} EUR)
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="bg-brand-50 rounded-lg p-4 text-sm">
            <p><span className="font-medium">Brand:</span> {selected.brand}</p>
            <p><span className="font-medium">Category:</span> {selected.category}</p>
            <p><span className="font-medium">Size:</span> {selected.size} | <span className="font-medium">Color:</span> {selected.color}</p>
            <p><span className="font-medium">Bought for:</span> {selected.purchase_price} EUR on {selected.platform}</p>
            <p><span className="font-medium">Purchased:</span> {new Date(selected.purchase_date).toLocaleDateString('fr-FR')}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Sale Price (EUR)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Sale Date</label>
            <input
              type="date"
              value={saleDate}
              onChange={e => setSaleDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {margin !== null && (
          <div className={'rounded-lg p-4 text-sm ' + (margin >= 0 ? 'bg-green-50' : 'bg-red-50')}>
            <p className="font-medium">
              Margin: {margin >= 0 ? '+' : ''}{margin.toFixed(2)} EUR
              ({selected ? ((margin / parseFloat(salePrice)) * 100).toFixed(1) : 0}%)
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !selectedItem}
            className="px-5 py-2.5 bg-brand-900 text-white rounded-lg hover:bg-brand-800 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Saving...' : 'Record Sale'}
          </button>
          <a
            href="/sales"
            className="px-5 py-2.5 text-brand-600 hover:text-brand-900 text-sm font-medium flex items-center"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}