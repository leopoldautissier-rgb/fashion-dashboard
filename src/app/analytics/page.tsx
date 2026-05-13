'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { differenceInDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AnalyticsPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('items').select('*');
      if (data) setItems(data as PurchaseItem[]);
    }
    fetch();
  }, []);

  const soldItems = items.filter(i => i.status === 'Sold' && i.sale_price && i.sale_date);
  const inStockItems = items.filter(i => i.status === 'In Stock');

  // Key metrics
  const avgMargin = soldItems.length > 0
    ? soldItems.reduce((sum, i) => sum + ((i.sale_price || 0) - i.purchase_price), 0) / soldItems.length
    : 0;
  const avgTimeToSell = soldItems.length > 0
    ? soldItems.reduce((sum, i) => sum + differenceInDays(new Date(i.sale_date!), new Date(i.purchase_date)), 0) / soldItems.length
    : 0;

  // Inventory turnover: items sold / average inventory
  // Average inventory = (current stock + estimated start stock) / 2
  // Simplified: sold items / current stock
  const inventoryTurnover = inStockItems.length > 0 ? (soldItems.length / inStockItems.length).toFixed(1) : '0';

  // Sell-through rate: % sold within 30 days
  const soldWithin30 = soldItems.filter(i => differenceInDays(new Date(i.sale_date!), new Date(i.purchase_date)) <= 30).length;
  const sellThroughRate = soldItems.length > 0 ? ((soldWithin30 / soldItems.length) * 100).toFixed(0) : '0';

  // Fastest selling combos (brand + category + size)
  const fastestCombos = getFastestCombos(soldItems);

  // Brand performance
  const brandStats = getBrandPerformance(soldItems);
  const categoryStats = getCategoryPerformance(soldItems);
  const monthlyStats = getMonthlyStats(items);

  const bestBrand = brandStats.length > 0 ? brandStats[0] : null;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-900 mb-6">Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <MetricCard label="Avg Margin / Item" value={'+' + avgMargin.toFixed(0) + ' EUR'} color="green" />
        <MetricCard label="Avg Time to Sell" value={avgTimeToSell.toFixed(0) + ' days'} />
        <MetricCard label="Inventory Turnover" value={inventoryTurnover + 'x'} subtitle="sold / in stock" />
        <MetricCard label="Sell-through (30d)" value={sellThroughRate + '%'} subtitle={soldWithin30 + ' / ' + soldItems.length} color={parseInt(sellThroughRate) > 60 ? 'green' : 'orange'} />
        <MetricCard label="Best Brand" value={bestBrand ? bestBrand.brand : '-'} />
        <MetricCard label="Items Sold" value={soldItems.length.toString()} />
      </div>

      {/* Fastest Selling Combos */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Fastest Selling Combos</h3>
        <p className="text-xs text-brand-500 mb-3">Brand + Category + Size combinations that sell quickest</p>
        <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 border-b border-brand-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-brand-700">#</th>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Brand</th>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Category</th>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Size</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Days</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Sold</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {fastestCombos.slice(0, 10).map((c, i) => (
                <tr key={c.key} className="hover:bg-brand-50">
                  <td className="px-4 py-3 text-brand-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-brand-900">{c.brand}</td>
                  <td className="px-4 py-3 text-brand-700">{c.category}</td>
                  <td className="px-4 py-3 text-brand-700">{c.size}</td>
                  <td className="px-4 py-3 text-right font-medium text-brand-900">{c.avgDays.toFixed(0)}d</td>
                  <td className="px-4 py-3 text-right text-brand-700">{c.count}</td>
                  <td className="px-4 py-3 text-right text-green-700">+{c.avgMargin.toFixed(0)} EUR</td>
                </tr>
              ))}
            </tbody>
          </table>
          {fastestCombos.length === 0 && <p className="text-center py-8 text-brand-400">Need more sales data</p>}
        </div>
      </div>

      {/* Brand Performance */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Performance by Brand</h3>
        <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 border-b border-brand-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Brand</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Sold</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Margin</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Total Profit</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Days</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {brandStats.map(stat => (
                <tr key={stat.brand} className="hover:bg-brand-50">
                  <td className="px-4 py-3 font-medium text-brand-900">{stat.brand}</td>
                  <td className="px-4 py-3 text-right text-brand-700">{stat.count}</td>
                  <td className="px-4 py-3 text-right text-green-700">+{stat.avgMargin.toFixed(0)} EUR</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">+{stat.totalProfit.toFixed(0)} EUR</td>
                  <td className="px-4 py-3 text-right text-brand-700">{stat.avgDays.toFixed(0)}d</td>
                  <td className="px-4 py-3 text-right font-medium text-brand-900">{stat.roi.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {brandStats.length === 0 && <p className="text-center py-8 text-brand-400">No sales data yet</p>}
        </div>
      </div>

      {/* Category Performance */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Performance by Category</h3>
        <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 border-b border-brand-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Category</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Sold</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Margin</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Total Profit</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Avg Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {categoryStats.map(stat => (
                <tr key={stat.category} className="hover:bg-brand-50">
                  <td className="px-4 py-3 font-medium text-brand-900">{stat.category}</td>
                  <td className="px-4 py-3 text-right text-brand-700">{stat.count}</td>
                  <td className="px-4 py-3 text-right text-green-700">+{stat.avgMargin.toFixed(0)} EUR</td>
                  <td className="px-4 py-3 text-right font-medium text-green-700">+{stat.totalProfit.toFixed(0)} EUR</td>
                  <td className="px-4 py-3 text-right text-brand-700">{stat.avgDays.toFixed(0)}d</td>
                </tr>
              ))}
            </tbody>
          </table>
          {categoryStats.length === 0 && <p className="text-center py-8 text-brand-400">No sales data yet</p>}
        </div>
      </div>

      {/* Monthly P&L */}
      <div>
        <h3 className="text-lg font-semibold text-brand-900 mb-4">Monthly P&L</h3>
        <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 border-b border-brand-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-brand-700">Month</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Bought</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Sold</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Spent</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Revenue</th>
                <th className="text-right px-4 py-3 font-medium text-brand-700">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {monthlyStats.map(stat => (
                <tr key={stat.month} className="hover:bg-brand-50">
                  <td className="px-4 py-3 font-medium text-brand-900">{stat.month}</td>
                  <td className="px-4 py-3 text-right text-brand-700">{stat.bought}</td>
                  <td className="px-4 py-3 text-right text-brand-700">{stat.sold}</td>
                  <td className="px-4 py-3 text-right text-red-600">-{stat.spent.toLocaleString('fr-FR')} EUR</td>
                  <td className="px-4 py-3 text-right text-brand-900">{stat.revenue.toLocaleString('fr-FR')} EUR</td>
                  <td className={'px-4 py-3 text-right font-medium ' + (stat.profit >= 0 ? 'text-green-700' : 'text-red-600')}>
                    {stat.profit >= 0 ? '+' : ''}{stat.profit.toLocaleString('fr-FR')} EUR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {monthlyStats.length === 0 && <p className="text-center py-8 text-brand-400">No data yet</p>}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle, color }: { label: string; value: string; subtitle?: string; color?: string }) {
  const textColor = color === 'green' ? 'text-green-700' : color === 'orange' ? 'text-orange-600' : 'text-brand-900';
  return (
    <div className="bg-white rounded-xl border border-brand-200 p-4">
      <p className="text-xs uppercase text-brand-500 mb-1">{label}</p>
      <p className={'text-xl font-bold ' + textColor}>{value}</p>
      {subtitle && <p className="text-xs text-brand-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function getFastestCombos(soldItems: PurchaseItem[]) {
  const map: Record<string, { count: number; totalDays: number; totalMargin: number; brand: string; category: string; size: string }> = {};

  soldItems.forEach(item => {
    const key = item.brand + '|' + item.category + '|' + item.size;
    if (!map[key]) map[key] = { count: 0, totalDays: 0, totalMargin: 0, brand: item.brand, category: item.category, size: item.size };
    map[key].count++;
    map[key].totalDays += differenceInDays(new Date(item.sale_date!), new Date(item.purchase_date));
    map[key].totalMargin += (item.sale_price || 0) - item.purchase_price;
  });

  return Object.entries(map)
    .filter(([_, d]) => d.count >= 3) // minimum 3 sales to be meaningful
    .map(([key, data]) => ({
      key,
      brand: data.brand,
      category: data.category,
      size: data.size,
      avgDays: data.totalDays / data.count,
      count: data.count,
      avgMargin: data.totalMargin / data.count,
    }))
    .sort((a, b) => a.avgDays - b.avgDays);
}

function getBrandPerformance(soldItems: PurchaseItem[]) {
  const brands: Record<string, { count: number; totalMargin: number; totalDays: number; totalCost: number }> = {};

  soldItems.forEach(item => {
    if (!brands[item.brand]) brands[item.brand] = { count: 0, totalMargin: 0, totalDays: 0, totalCost: 0 };
    const margin = (item.sale_price || 0) - item.purchase_price;
    const days = differenceInDays(new Date(item.sale_date!), new Date(item.purchase_date));
    brands[item.brand].count++;
    brands[item.brand].totalMargin += margin;
    brands[item.brand].totalDays += days;
    brands[item.brand].totalCost += item.purchase_price;
  });

  return Object.entries(brands)
    .map(([brand, data]) => ({
      brand,
      count: data.count,
      avgMargin: data.totalMargin / data.count,
      avgDays: data.totalDays / data.count,
      totalProfit: data.totalMargin,
      roi: (data.totalMargin / data.totalCost) * 100,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);
}

function getCategoryPerformance(soldItems: PurchaseItem[]) {
  const categories: Record<string, { count: number; totalMargin: number; totalDays: number }> = {};

  soldItems.forEach(item => {
    if (!categories[item.category]) categories[item.category] = { count: 0, totalMargin: 0, totalDays: 0 };
    categories[item.category].count++;
    categories[item.category].totalMargin += (item.sale_price || 0) - item.purchase_price;
    categories[item.category].totalDays += differenceInDays(new Date(item.sale_date!), new Date(item.purchase_date));
  });

  return Object.entries(categories)
    .map(([category, data]) => ({
      category,
      count: data.count,
      avgMargin: data.totalMargin / data.count,
      avgDays: data.totalDays / data.count,
      totalProfit: data.totalMargin,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);
}

function getMonthlyStats(items: PurchaseItem[]) {
  const months: Record<string, { bought: number; sold: number; spent: number; revenue: number }> = {};

  items.forEach(item => {
    const purchaseMonth = format(new Date(item.purchase_date), 'yyyy-MM');
    if (!months[purchaseMonth]) months[purchaseMonth] = { bought: 0, sold: 0, spent: 0, revenue: 0 };
    months[purchaseMonth].bought++;
    months[purchaseMonth].spent += item.purchase_price;

    if (item.status === 'Sold' && item.sale_date) {
      const saleMonth = format(new Date(item.sale_date), 'yyyy-MM');
      if (!months[saleMonth]) months[saleMonth] = { bought: 0, sold: 0, spent: 0, revenue: 0 };
      months[saleMonth].sold++;
      months[saleMonth].revenue += item.sale_price || 0;
    }
  });

  return Object.entries(months)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, data]) => ({
      month: format(new Date(month + '-01'), 'MMMM yyyy', { locale: fr }),
      bought: data.bought,
      sold: data.sold,
      spent: data.spent,
      revenue: data.revenue,
      profit: data.revenue - data.spent,
    }));
}