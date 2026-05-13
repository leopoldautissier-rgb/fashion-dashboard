'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { differenceInDays } from 'date-fns';

const TARGET_MARGIN = 3; // 3x multiplier as default target

export default function InventoryPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'age' | 'price'>('date');

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'In Stock')
      .order('purchase_date', { ascending: false });
    if (data) setItems(data as PurchaseItem[]);
  }

  const today = new Date();

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'age') return new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime();
    if (sortBy === 'price') return b.purchase_price - a.purchase_price;
    return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
  });

  const totalValue = items.reduce((sum, i) => sum + i.purchase_price, 0);
  const oldItems = items.filter(i => differenceInDays(today, new Date(i.purchase_date)) > 30);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-900 mb-6">Inventory</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-brand-200 p-4">
          <p className="text-xs uppercase text-brand-500">Items in Stock</p>
          <p className="text-xl font-bold text-brand-900">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-200 p-4">
          <p className="text-xs uppercase text-brand-500">Total Value (cost)</p>
          <p className="text-xl font-bold text-brand-900">{totalValue.toLocaleString('fr-FR')} EUR</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-200 p-4">
          <p className="text-xs uppercase text-brand-500">Target Revenue</p>
          <p className="text-xl font-bold text-brand-700">{(totalValue * TARGET_MARGIN).toLocaleString('fr-FR')} EUR</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-200 p-4">
          <p className="text-xs uppercase text-brand-500">Older than 30 days</p>
          <p className={'text-xl font-bold ' + (oldItems.length > 0 ? 'text-orange-600' : 'text-green-700')}>
            {oldItems.length}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <span className="text-sm text-brand-500 py-1">Sort by:</span>
        <button onClick={() => setSortBy('date')} className={'px-3 py-1 rounded-full text-xs font-medium ' + (sortBy === 'date' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-700')}>Newest</button>
        <button onClick={() => setSortBy('age')} className={'px-3 py-1 rounded-full text-xs font-medium ' + (sortBy === 'age' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-700')}>Oldest first</button>
        <button onClick={() => setSortBy('price')} className={'px-3 py-1 rounded-full text-xs font-medium ' + (sortBy === 'price' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-700')}>Most expensive</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map(item => {
          const daysInStock = differenceInDays(today, new Date(item.purchase_date));
          const isOld = daysInStock > 30;
          const targetPrice = item.purchase_price * TARGET_MARGIN;
          return (
            <div key={item.id} className={'bg-white rounded-xl border p-4 ' + (isOld ? 'border-orange-200' : 'border-brand-200')}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-brand-900">{item.brand}</h3>
                <span className={'text-xs px-2 py-0.5 rounded-full ' + (isOld ? 'bg-orange-100 text-orange-700' : 'bg-brand-100 text-brand-600')}>
                  {daysInStock}d
                </span>
              </div>
              <p className="text-sm text-brand-700">{item.category} - {item.size} - {item.color}</p>
              <p className="text-sm text-brand-500 mt-1">{item.platform} | {item.condition}</p>
              <div className="flex justify-between items-end mt-3">
                <div>
                  <p className="text-xs text-brand-400">Paid</p>
                  <p className="text-lg font-bold text-brand-900">{item.purchase_price.toLocaleString('fr-FR')} EUR</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-400">Target ({TARGET_MARGIN}x)</p>
                  <p className="text-lg font-bold text-green-700">{targetPrice.toLocaleString('fr-FR')} EUR</p>
                </div>
              </div>
              <p className="text-xs text-brand-400 mt-2">
                Bought {new Date(item.purchase_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-brand-400">
          No items in stock. <a href="/purchases/new" className="text-brand-700 underline">Add a purchase</a>
        </div>
      )}
    </div>
  );
}