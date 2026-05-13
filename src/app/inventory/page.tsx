'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { formatCurrency } from '@/lib/format';
import { differenceInDays } from 'date-fns';

const TARGET_MARGIN = 3;

export default function InventoryPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'age' | 'price'>('date');

  useEffect(() => { fetchInventory(); }, []);

  async function fetchInventory() {
    const { data } = await supabase.from('items').select('*').eq('status', 'In Stock').order('purchase_date', { ascending: false });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">Inventory</h1>
        <p className="text-[14px] text-gray-500 mt-1">{items.length} items in stock</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[12px] text-gray-400">Stock Value</p>
          <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[12px] text-gray-400">Target Revenue</p>
          <p className="text-xl font-semibold text-blue-600">{formatCurrency(totalValue * TARGET_MARGIN)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-[12px] text-gray-400">30+ days unsold</p>
          <p className={'text-xl font-semibold ' + (oldItems.length > 0 ? 'text-orange-500' : 'text-green-600')}>{oldItems.length}</p>
        </div>
      </div>

      <div className="flex gap-1.5">
        {(['date', 'age', 'price'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)} className={'px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ' + (sortBy === s ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100')}>
            {s === 'date' ? 'Newest' : s === 'age' ? 'Oldest' : 'Price'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedItems.slice(0, 60).map(item => {
          const days = differenceInDays(today, new Date(item.purchase_date));
          const isOld = days > 30;
          return (
            <div key={item.id} className={'glass-card rounded-2xl overflow-hidden hover-lift ' + (isOld ? 'ring-1 ring-orange-200' : '')}>
              <img src={item.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop'} alt="" className="w-full h-32 object-cover" />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-gray-900">{item.brand}</p>
                  <span className={'text-[10px] px-1.5 py-0.5 rounded-full font-medium ' + (isOld ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500')}>{days}d</span>
                </div>
                <p className="text-[12px] text-gray-500 mt-0.5">{item.category} · {item.size} · {item.color}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[14px] font-bold text-gray-900">{item.purchase_price.toFixed(0)}€</p>
                  <p className="text-[11px] font-mono text-gray-300">{item.reference}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {sortedItems.length > 60 && <p className="text-center text-[13px] text-gray-400">Showing 60 of {sortedItems.length}</p>}
      {items.length === 0 && <p className="text-center text-[14px] text-gray-400 py-12">No items in stock.</p>}
    </div>
  );
}