'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';

export default function SalesPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    fetchSoldItems();
  }, []);

  async function fetchSoldItems() {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'Sold')
      .order('sale_date', { ascending: false });
    if (data) setItems(data as PurchaseItem[]);
  }

  async function exportToExcel() {
    const XLSX = (await import('xlsx')).default;
    const exportData = items.map(item => ({
      'Sale Date': item.sale_date,
      'Brand': item.brand,
      'Category': item.category,
      'Size': item.size,
      'Color': item.color,
      'Purchase Price': item.purchase_price,
      'Sale Price': item.sale_price,
      'Margin': (item.sale_price || 0) - item.purchase_price,
      'Margin %': item.sale_price ? (((item.sale_price - item.purchase_price) / item.sale_price) * 100).toFixed(1) + '%' : '',
      'Platform': item.platform,
      'Purchase Date': item.purchase_date,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    XLSX.writeFile(wb, 'sales-export.xlsx');
  }

  const totalRevenue = items.reduce((sum, i) => sum + (i.sale_price || 0), 0);
  const totalCost = items.reduce((sum, i) => sum + i.purchase_price, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-brand-900">Sales History</h2>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-brand-100 text-brand-900 rounded-lg hover:bg-brand-200 text-sm font-medium"
          >
            Export Excel
          </button>
          <a href="/sales/new" className="px-4 py-2 bg-brand-900 text-white rounded-lg hover:bg-brand-800 text-sm font-medium">
            + Record Sale
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-brand-200 p-4">
          <p className="text-xs uppercase text-brand-500">Revenue</p>
          <p className="text-xl font-bold text-brand-900">{totalRevenue.toLocaleString('fr-FR')} EUR</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-200 p-4">
          <p className="text-xs uppercase text-brand-500">Cost</p>
          <p className="text-xl font-bold text-brand-900">{totalCost.toLocaleString('fr-FR')} EUR</p>
        </div>
        <div className="bg-white rounded-xl border border-brand-200 p-4">
          <p className="text-xs uppercase text-brand-500">Profit</p>
          <p className={'text-xl font-bold ' + (totalProfit >= 0 ? 'text-green-700' : 'text-red-600')}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('fr-FR')} EUR
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 border-b border-brand-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Sale Date</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Category</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Size</th>
              <th className="text-right px-4 py-3 font-medium text-brand-700">Bought</th>
              <th className="text-right px-4 py-3 font-medium text-brand-700">Sold</th>
              <th className="text-right px-4 py-3 font-medium text-brand-700">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {items.map(item => {
              const margin = (item.sale_price || 0) - item.purchase_price;
              const marginPct = item.sale_price ? (margin / item.sale_price) * 100 : 0;
              return (
                <tr key={item.id} className="hover:bg-brand-50">
                  <td className="px-4 py-3 text-brand-600">
                    {item.sale_date ? new Date(item.sale_date).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-900">{item.brand}</td>
                  <td className="px-4 py-3 text-brand-700">{item.category}</td>
                  <td className="px-4 py-3 text-brand-700">{item.size}</td>
                  <td className="px-4 py-3 text-right text-brand-600">
                    {item.purchase_price.toLocaleString('fr-FR')} EUR
                  </td>
                  <td className="px-4 py-3 text-right text-brand-900">
                    {(item.sale_price || 0).toLocaleString('fr-FR')} EUR
                  </td>
                  <td className={'px-4 py-3 text-right font-medium ' + (margin >= 0 ? 'text-green-700' : 'text-red-600')}>
                    {margin >= 0 ? '+' : ''}{margin.toLocaleString('fr-FR')} EUR ({marginPct.toFixed(0)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="text-center py-12 text-brand-400">
            No sales recorded yet. <a href="/sales/new" className="text-brand-700 underline">Record your first sale</a>
          </div>
        )}
      </div>
    </div>
  );
}