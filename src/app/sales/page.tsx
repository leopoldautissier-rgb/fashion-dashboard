'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { formatCurrency } from '@/lib/format';
import { subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function SalesPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { fetchSoldItems(); }, []);

  async function fetchSoldItems() {
    const { data } = await supabase.from('items').select('*').eq('status', 'Sold').order('sale_date', { ascending: false });
    if (data) setItems(data as PurchaseItem[]);
  }

  function applyPeriod(p: string) {
    setPeriod(p);
    const today = new Date();
    switch (p) {
      case '7d': setDateFrom(subDays(today, 7).toISOString().split('T')[0]); setDateTo(today.toISOString().split('T')[0]); break;
      case '30d': setDateFrom(subDays(today, 30).toISOString().split('T')[0]); setDateTo(today.toISOString().split('T')[0]); break;
      case 'this-month': setDateFrom(startOfMonth(today).toISOString().split('T')[0]); setDateTo(endOfMonth(today).toISOString().split('T')[0]); break;
      case 'last-month': setDateFrom(startOfMonth(subMonths(today, 1)).toISOString().split('T')[0]); setDateTo(endOfMonth(subMonths(today, 1)).toISOString().split('T')[0]); break;
      case '3m': setDateFrom(subMonths(today, 3).toISOString().split('T')[0]); setDateTo(today.toISOString().split('T')[0]); break;
      case '6m': setDateFrom(subMonths(today, 6).toISOString().split('T')[0]); setDateTo(today.toISOString().split('T')[0]); break;
      case '12m': setDateFrom(subMonths(today, 12).toISOString().split('T')[0]); setDateTo(today.toISOString().split('T')[0]); break;
      default: setDateFrom(''); setDateTo('');
    }
  }

  const filteredItems = items.filter(item => {
    if (dateFrom && item.sale_date && item.sale_date < dateFrom) return false;
    if (dateTo && item.sale_date && item.sale_date > dateTo) return false;
    return true;
  });

  async function exportToExcel() {
    const XLSX = (await import('xlsx')).default;
    const exportData = filteredItems.map(item => ({
      'Sale Date': item.sale_date, 'Brand': item.brand, 'Category': item.category,
      'Size': item.size, 'Color': item.color, 'Purchase Price': item.purchase_price,
      'Sale Price': item.sale_price, 'Margin': (item.sale_price || 0) - item.purchase_price,
      'Platform': item.platform,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    XLSX.writeFile(wb, 'sales-export.xlsx');
  }

  const totalRevenue = filteredItems.reduce((sum, i) => sum + (i.sale_price || 0), 0);
  const totalCost = filteredItems.reduce((sum, i) => sum + i.purchase_price, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Sales</h1>
          <p className="text-[15px] text-gray-500 mt-1">{filteredItems.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200 transition-colors">Export</button>
          <a href="/sales/new" className="px-4 py-2 rounded-full bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 transition-colors">+ Record Sale</a>
        </div>
      </div>

      {/* Period selector */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: '7d', label: '7d' },
            { key: '30d', label: '30d' },
            { key: 'this-month', label: 'This month' },
            { key: 'last-month', label: 'Last month' },
            { key: '3m', label: '3 months' },
            { key: '6m', label: '6 months' },
            { key: '12m', label: '1 year' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => applyPeriod(p.key)}
              className={'px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ' + (period === p.key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')}
            >
              {p.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPeriod('custom'); }} className="text-[12px] py-1.5 px-3 rounded-lg" />
            <span className="text-[12px] text-gray-300">—</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPeriod('custom'); }} className="text-[12px] py-1.5 px-3 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-[13px] text-gray-400 mb-1">Revenue</p>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-[13px] text-gray-400 mb-1">Cost</p>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{formatCurrency(totalCost)}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-[13px] text-gray-400 mb-1">Profit</p>
          <p className={'text-2xl font-semibold tracking-tight ' + (totalProfit >= 0 ? 'text-green-600' : 'text-red-500')}>{formatCurrency(totalProfit)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3.5 font-medium text-gray-400">Date</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-400">Brand</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-400">Category</th>
              <th className="text-left px-5 py-3.5 font-medium text-gray-400">Size</th>
              <th className="text-right px-5 py-3.5 font-medium text-gray-400">Bought</th>
              <th className="text-right px-5 py-3.5 font-medium text-gray-400">Sold</th>
              <th className="text-right px-5 py-3.5 font-medium text-gray-400">Margin</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.slice(0, 50).map(item => {
              const margin = (item.sale_price || 0) - item.purchase_price;
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-400">{item.sale_date ? new Date(item.sale_date).toLocaleDateString('fr-FR') : '-'}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{item.brand}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.category}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.size}</td>
                  <td className="px-5 py-3.5 text-right text-gray-400">{item.purchase_price.toFixed(0)}€</td>
                  <td className="px-5 py-3.5 text-right text-gray-900 font-medium">{(item.sale_price || 0).toFixed(0)}€</td>
                  <td className={'px-5 py-3.5 text-right font-medium ' + (margin >= 0 ? 'text-green-600' : 'text-red-500')}>+{margin.toFixed(0)}€</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredItems.length > 50 && (
          <div className="text-center py-4 text-[13px] text-gray-400 border-t border-gray-50">Showing 50 of {filteredItems.length}</div>
        )}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-[15px]">No sales in this period</div>
        )}
      </div>
    </div>
  );
}