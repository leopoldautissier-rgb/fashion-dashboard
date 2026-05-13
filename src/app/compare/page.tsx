'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { format, subMonths, startOfMonth, endOfMonth, subYears } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ComparePage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [mode, setMode] = useState<'mom' | 'yoy'>('mom');

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('items').select('*');
      if (data) setItems(data as PurchaseItem[]);
    }
    fetch();
  }, []);

  const now = new Date();
  const currentMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subMonths(now, 1));
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;

  // MoM data
  const currentMonthItems = items.filter(i => {
    const d = new Date(i.purchase_date);
    return d >= currentMonth && d <= endOfMonth(currentMonth);
  });
  const lastMonthItems = items.filter(i => {
    const d = new Date(i.purchase_date);
    return d >= lastMonth && d <= endOfMonth(lastMonth);
  });

  const currentMonthSold = items.filter(i => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= currentMonth && new Date(i.sale_date) <= endOfMonth(currentMonth));
  const lastMonthSold = items.filter(i => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= lastMonth && new Date(i.sale_date) <= endOfMonth(lastMonth));

  // YoY data
  const currentYearItems = items.filter(i => new Date(i.purchase_date).getFullYear() === currentYear);
  const lastYearItems = items.filter(i => new Date(i.purchase_date).getFullYear() === lastYear);
  const currentYearSold = items.filter(i => i.status === 'Sold' && i.sale_date && new Date(i.sale_date).getFullYear() === currentYear);
  const lastYearSold = items.filter(i => i.status === 'Sold' && i.sale_date && new Date(i.sale_date).getFullYear() === lastYear);

  function calcStats(bought: PurchaseItem[], sold: PurchaseItem[]) {
    const totalBought = bought.length;
    const totalSold = sold.length;
    const totalSpent = bought.reduce((s, i) => s + i.purchase_price, 0);
    const totalRevenue = sold.reduce((s, i) => s + (i.sale_price || 0), 0);
    const totalProfit = totalRevenue - sold.reduce((s, i) => s + i.purchase_price, 0);
    const avgMargin = totalSold > 0 ? totalProfit / totalSold : 0;
    return { totalBought, totalSold, totalSpent, totalRevenue, totalProfit, avgMargin };
  }

  const current = mode === 'mom' ? calcStats(currentMonthItems, currentMonthSold) : calcStats(currentYearItems, currentYearSold);
  const previous = mode === 'mom' ? calcStats(lastMonthItems, lastMonthSold) : calcStats(lastYearItems, lastYearSold);

  function pctChange(curr: number, prev: number): string {
    if (prev === 0) return curr > 0 ? '+100%' : '0%';
    const pct = ((curr - prev) / prev) * 100;
    return (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';
  }

  function changeColor(curr: number, prev: number, inverse?: boolean): string {
    const better = inverse ? curr < prev : curr > prev;
    if (curr === prev) return 'text-brand-700';
    return better ? 'text-green-700' : 'text-red-600';
  }

  const currentLabel = mode === 'mom' ? format(currentMonth, 'MMMM yyyy', { locale: fr }) : currentYear.toString();
  const previousLabel = mode === 'mom' ? format(lastMonth, 'MMMM yyyy', { locale: fr }) : lastYear.toString();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-900 mb-2">Compare Performance</h2>
      <p className="text-sm text-brand-500 mb-6">Month-over-month and year-over-year comparisons.</p>

      {/* Toggle */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setMode('mom')}
          className={'px-4 py-2 rounded-lg text-sm font-medium ' + (mode === 'mom' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-700')}
        >
          Month vs Month
        </button>
        <button
          onClick={() => setMode('yoy')}
          className={'px-4 py-2 rounded-lg text-sm font-medium ' + (mode === 'yoy' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-700')}
        >
          Year vs Year
        </button>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items Bought */}
        <CompareCard
          label="Items Bought"
          current={current.totalBought}
          previous={previous.totalBought}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          format="number"
        />
        <CompareCard
          label="Items Sold"
          current={current.totalSold}
          previous={previous.totalSold}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          format="number"
        />
        <CompareCard
          label="Total Spent"
          current={current.totalSpent}
          previous={previous.totalSpent}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          format="currency"
          inverse
        />
        <CompareCard
          label="Revenue"
          current={current.totalRevenue}
          previous={previous.totalRevenue}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          format="currency"
        />
        <CompareCard
          label="Profit"
          current={current.totalProfit}
          previous={previous.totalProfit}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          format="currency"
        />
        <CompareCard
          label="Avg Margin / Item"
          current={current.avgMargin}
          previous={previous.avgMargin}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          format="currency"
        />
      </div>
    </div>
  );
}

function CompareCard({ label, current, previous, currentLabel, previousLabel, format: fmt, inverse }: {
  label: string;
  current: number;
  previous: number;
  currentLabel: string;
  previousLabel: string;
  format: 'number' | 'currency';
  inverse?: boolean;
}) {
  const better = inverse ? current < previous : current > previous;
  const same = current === previous;
  const pct = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  const pctStr = (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';

  const formatVal = (v: number) => fmt === 'currency' ? v.toLocaleString('fr-FR') + ' EUR' : v.toString();

  return (
    <div className="bg-white rounded-xl border border-brand-200 p-5">
      <p className="text-xs uppercase tracking-wide text-brand-500 mb-3">{label}</p>
      <div className="flex items-end justify-between mb-2">
        <p className="text-2xl font-bold text-brand-900">{formatVal(Math.round(current))}</p>
        <span className={'text-sm font-medium ' + (same ? 'text-brand-500' : better ? 'text-green-700' : 'text-red-600')}>
          {pctStr}
        </span>
      </div>
      <div className="flex justify-between text-xs text-brand-500">
        <span>{currentLabel}</span>
        <span>vs {formatVal(Math.round(previous))} ({previousLabel})</span>
      </div>
    </div>
  );
}