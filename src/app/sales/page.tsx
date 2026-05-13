'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import { PurchaseItem } from '@/types';
import { subDays, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

export default function SalesPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [period, setPeriod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { fetchSoldItems(); }, []);

  async function fetchSoldItems() {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'Sold')
      .order('sale_date', { ascending: false });
    if (data) setItems(data as PurchaseItem[]);
  }

  function applyPeriod(p: string) {
    setPeriod(p);
    const today = new Date();
    switch (p) {
      case '7d':
        setDateFrom(subDays(today, 7).toISOString().split('T')[0]);
        setDateTo(today.toISOString().split('T')[0]);
        break;
      case '30d':
        setDateFrom(subDays(today, 30).toISOString().split('T')[0]);
        setDateTo(today.toISOString().split('T')[0]);
        break;
      case 'this-month':
        setDateFrom(startOfMonth(today).toISOString().split('T')[0]);
        setDateTo(endOfMonth(today).toISOString().split('T')[0]);
        break;
      case 'last-month':
        setDateFrom(startOfMonth(subMonths(today, 1)).toISOString().split('T')[0]);
        setDateTo(endOfMonth(subMonths(today, 1)).toISOString().split('T')[0]);
        break;
      case '3m':
        setDateFrom(subMonths(today, 3).toISOString().split('T')[0]);
        setDateTo(today.toISOString().split('T')[0]);
        break;
      case '6m':
        setDateFrom(subMonths(today, 6).toISOString().split('T')[0]);
        setDateTo(today.toISOString().split('T')[0]);
        break;
      case '12m':
        setDateFrom(subMonths(today, 12).toISOString().split('T')[0]);
        setDateTo(today.toISOString().split('T')[0]);
        break;
      default:
        setDateFrom('');
        setDateTo('');
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

  const totalRevenue = filteredItems.reduce((sum, i) => sum + (i.sale_price || 0), 0);
  const totalCost = filteredItems.reduce((sum, i) => sum + i.purchase_price, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = filteredItems.length > 0 ? (totalProfit / filteredItems.length) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Export Excel</button>
          <a href="/sales/new" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">+ Record Sale</a>
        </div>
      </div>

      {/* Period filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-sm font-medium text-gray-600">Period:</span>
          {[
            { key: 'all', label: 'All time' },
            { key: '7d', label: '7 days' },
            { key: '30d', label: '30 days' },
            { key: 'this-month', label: 'This month' },
            { key: 'last-month', label: 'Last month' },
            { key: '3m', label: '3 months' },
            { key: '6m', label: '6 months' },
            { key: '12m', label: '12 months' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => applyPeriod(p.key)}
              className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' + (period === p.key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Custom:</span>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPeriod('custom'); }} className="text-xs" />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPeriod('custom'); }} className="text-xs" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Items Sold</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredItems.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}â‚¬</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Cost</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCost)}â‚¬</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Profit</p>
          <p className={'text-2xl font-bold mt-1 ' + (totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString('fr-FR')} â‚¬
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Sale Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Size</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Bought</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Sold</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.slice(0, 100).map(item => {
              const margin = (item.sale_price || 0) - item.purchase_price;
              const marginPct = item.sale_price ? (margin / item.sale_price) * 100 : 0;
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{item.sale_date ? new Date(item.sale_date).toLocaleDateString('fr-FR') : '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.brand}</td>
                  <td className="px-4 py-3 text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-gray-600">{item.size}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{item.purchase_price.toLocaleString('fr-FR')} â‚¬</td>
                  <td className="px-4 py-3 text-right text-gray-900">{(item.sale_price || 0).toLocaleString('fr-FR')} â‚¬</td>
                  <td className={'px-4 py-3 text-right font-medium ' + (margin >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                    +{margin.toLocaleString('fr-FR')} â‚¬ ({marginPct.toFixed(0)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredItems.length > 100 && (
          <div className="text-center py-3 text-sm text-gray-400 border-t border-gray-50">Showing first 100 of {filteredItems.length}</div>
        )}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-400">No sales in this period.</div>
        )}
      </div>
    </div>
  );
}