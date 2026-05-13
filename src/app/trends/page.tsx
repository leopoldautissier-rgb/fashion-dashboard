'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { differenceInDays } from 'date-fns';

interface ProductProfile {
  brand: string;
  category: string;
  count: number;
  avgMargin: number;
  avgDaysToSell: number;
  totalProfit: number;
  score: number;
}

export default function TrendsPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('items').select('*');
      if (data) setItems(data as PurchaseItem[]);
    }
    fetch();
  }, []);

  const soldItems = items.filter(i => i.status === 'Sold' && i.sale_price && i.sale_date);

  // Best-selling brand + category combos
  const profiles = getProductProfiles(soldItems);

  // Best colors
  const colorStats = getColorStats(soldItems);

  // Best size
  const sizeStats = getSizeStats(soldItems);

  // Top individual items by margin
  const topByMargin = [...soldItems]
    .map(i => ({ ...i, margin: (i.sale_price || 0) - i.purchase_price }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-900 mb-2">Best Sellers & Trends</h2>
      <p className="text-sm text-brand-500 mb-6">Identify your winning product profiles to buy more of what sells.</p>

      {/* Product Profile Scoring */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-brand-900 mb-2">Top Product Profiles</h3>
        <p className="text-xs text-brand-500 mb-4">Score = margin x speed. Higher is better.</p>
        <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 border-b border-brand-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-brand-700">#</th>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Brand</th>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Category</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Sold</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Margin</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Days</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Total Profit</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {profiles.slice(0, 10).map((p, i) => (
                <tr key={p.brand + p.category} className="hover:bg-brand-50">
                  <td className="px-4 py-3 text-brand-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-brand-900">{p.brand}</td>
                  <td className="px-4 py-3 text-brand-700">{p.category}</td>
                  <td className="px-4 py-3 text-right text-brand-700">{p.count}</td>
                  <td className="px-4 py-3 text-right text-green-700">+{p.avgMargin.toFixed(0)} EUR</td>
                  <td className="px-4 py-3 text-right text-brand-700">{p.avgDaysToSell.toFixed(0)}d</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">+{p.totalProfit.toFixed(0)} EUR</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-900">{p.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <p className="text-center py-8 text-brand-400">Need more sales data to show trends</p>
          )}
        </div>
      </div>

      {/* Best colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-brand-900 mb-4">Best Colors</h3>
          <div className="bg-white rounded-xl border border-brand-200 p-4 space-y-3">
            {colorStats.slice(0, 8).map(c => (
              <div key={c.color} className="flex items-center justify-between">
                <span className="text-sm text-brand-700">{c.color}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-500">{c.count} sold</span>
                  <span className="text-sm font-medium text-green-700">+{c.avgMargin.toFixed(0)} EUR avg</span>
                </div>
              </div>
            ))}
            {colorStats.length === 0 && <p className="text-sm text-brand-400">No data yet</p>}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-brand-900 mb-4">Best Sizes</h3>
          <div className="bg-white rounded-xl border border-brand-200 p-4 space-y-3">
            {sizeStats.map(s => (
              <div key={s.size} className="flex items-center justify-between">
                <span className="text-sm text-brand-700">{s.size}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-500">{s.count} sold</span>
                  <span className="text-sm font-medium text-green-700">+{s.avgMargin.toFixed(0)} EUR avg</span>
                </div>
              </div>
            ))}
            {sizeStats.length === 0 && <p className="text-sm text-brand-400">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Top items by margin */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Top 10 Items by Margin</h3>
        <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 border-b border-brand-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Brand</th>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Category</th>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Size/Color</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Bought</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Sold</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {topByMargin.map(item => (
                <tr key={item.id} className="hover:bg-brand-50">
                  <td className="px-4 py-3 font-medium text-brand-900">{item.brand}</td>
                  <td className="px-4 py-3 text-brand-700">{item.category}</td>
                  <td className="px-4 py-3 text-brand-600">{item.size} / {item.color}</td>
                  <td className="px-4 py-3 text-right text-brand-600">{item.purchase_price} EUR</td>
                  <td className="px-4 py-3 text-right text-brand-900">{item.sale_price} EUR</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">+{item.margin.toFixed(0)} EUR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getProductProfiles(soldItems: PurchaseItem[]): ProductProfile[] {
  const map: Record<string, { count: number; totalMargin: number; totalDays: number }> = {};

  soldItems.forEach(item => {
    const key = item.brand + '|' + item.category;
    if (!map[key]) map[key] = { count: 0, totalMargin: 0, totalDays: 0 };
    const margin = (item.sale_price || 0) - item.purchase_price;
    const days = differenceInDays(new Date(item.sale_date!), new Date(item.purchase_date));
    map[key].count++;
    map[key].totalMargin += margin;
    map[key].totalDays += days;
  });

  return Object.entries(map).map(([key, data]) => {
    const [brand, category] = key.split('|');
    const avgMargin = data.totalMargin / data.count;
    const avgDaysToSell = data.totalDays / data.count;
    // Score: margin per day (higher margin + faster sell = better)
    const score = avgDaysToSell > 0 ? (avgMargin / avgDaysToSell) * 10 : avgMargin;
    return { brand, category, count: data.count, avgMargin, avgDaysToSell, totalProfit: data.totalMargin, score };
  }).sort((a, b) => b.score - a.score);
}

function getColorStats(soldItems: PurchaseItem[]) {
  const map: Record<string, { count: number; totalMargin: number }> = {};
  soldItems.forEach(item => {
    if (!map[item.color]) map[item.color] = { count: 0, totalMargin: 0 };
    map[item.color].count++;
    map[item.color].totalMargin += (item.sale_price || 0) - item.purchase_price;
  });
  return Object.entries(map)
    .map(([color, data]) => ({ color, count: data.count, avgMargin: data.totalMargin / data.count }))
    .sort((a, b) => b.count - a.count);
}

function getSizeStats(soldItems: PurchaseItem[]) {
  const map: Record<string, { count: number; totalMargin: number }> = {};
  soldItems.forEach(item => {
    if (!map[item.size]) map[item.size] = { count: 0, totalMargin: 0 };
    map[item.size].count++;
    map[item.size].totalMargin += (item.sale_price || 0) - item.purchase_price;
  });
  return Object.entries(map)
    .map(([size, data]) => ({ size, count: data.count, avgMargin: data.totalMargin / data.count }))
    .sort((a, b) => b.count - a.count);
}