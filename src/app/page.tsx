'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';
import { differenceInDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MONTHLY_PROFIT_GOAL = 3000; // EUR - configurable

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0, totalInStock: 0, totalSold: 0,
    totalSpent: 0, totalRevenue: 0, totalProfit: 0, averageMargin: 0,
  });
  const [deadStock, setDeadStock] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);
  const [lastMonthProfit, setLastMonthProfit] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { data: items } = await supabase.from('items').select('*');
    if (!items) return;

    const totalItems = items.length;
    const totalInStock = items.filter((i: any) => i.status === 'In Stock').length;
    const totalSold = items.filter((i: any) => i.status === 'Sold').length;
    const totalSpent = items.reduce((sum: number, i: any) => sum + i.purchase_price, 0);
    const totalRevenue = items.filter((i: any) => i.sale_price).reduce((sum: number, i: any) => sum + (i.sale_price || 0), 0);
    const totalProfit = totalRevenue - items.filter((i: any) => i.status === 'Sold').reduce((sum: number, i: any) => sum + i.purchase_price, 0);
    const averageMargin = totalSold > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    setStats({ totalItems, totalInStock, totalSold, totalSpent, totalRevenue, totalProfit, averageMargin });

    // Dead stock (in stock > 30 days)
    const today = new Date();
    const dead = items.filter((i: any) => i.status === 'In Stock' && differenceInDays(today, new Date(i.purchase_date)) > 30);
    setDeadStock(dead.length);

    // This month profit
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const thisMonthSold = items.filter((i: any) => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= monthStart && new Date(i.sale_date) <= monthEnd);
    const thisMonthProfit = thisMonthSold.reduce((s: number, i: any) => s + ((i.sale_price || 0) - i.purchase_price), 0);
    setMonthProfit(thisMonthProfit);

    // Last month profit
    const lastStart = startOfMonth(subMonths(now, 1));
    const lastEnd = endOfMonth(subMonths(now, 1));
    const lastSold = items.filter((i: any) => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= lastStart && new Date(i.sale_date) <= lastEnd);
    const lastProfit = lastSold.reduce((s: number, i: any) => s + ((i.sale_price || 0) - i.purchase_price), 0);
    setLastMonthProfit(lastProfit);
  }

  const goalPct = Math.min((monthProfit / MONTHLY_PROFIT_GOAL) * 100, 100);
  const momChange = lastMonthProfit > 0 ? ((monthProfit - lastMonthProfit) / lastMonthProfit) * 100 : 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-brand-900 mb-6">Overview</h2>

      {/* Dead stock alert */}
      {deadStock > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-orange-800">{deadStock} item{deadStock > 1 ? 's' : ''} unsold for more than 30 days</p>
            <p className="text-sm text-orange-600">Consider reducing prices or promoting these items</p>
          </div>
          <a href="/inventory" className="text-sm font-medium text-orange-700 underline">View inventory</a>
        </div>
      )}

      {/* Profit goal */}
      <div className="bg-white rounded-xl border border-brand-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-brand-700">Monthly Profit Goal</p>
          <p className="text-sm text-brand-500">{monthProfit.toLocaleString('fr-FR')} / {MONTHLY_PROFIT_GOAL.toLocaleString('fr-FR')} EUR</p>
        </div>
        <div className="w-full bg-brand-100 rounded-full h-3">
          <div
            className={'h-3 rounded-full transition-all ' + (goalPct >= 100 ? 'bg-green-500' : goalPct >= 50 ? 'bg-brand-500' : 'bg-orange-400')}
            style={{ width: goalPct + '%' }}
          />
        </div>
        <p className="text-xs text-brand-500 mt-2">{goalPct.toFixed(0)}% of goal reached this month</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Items" value={stats.totalItems.toString()} subtitle={stats.totalInStock + ' in stock'} />
        <StatCard label="Total Spent" value={stats.totalSpent.toLocaleString('fr-FR') + ' EUR'} subtitle="Purchase cost" />
        <StatCard label="Total Revenue" value={stats.totalRevenue.toLocaleString('fr-FR') + ' EUR'} subtitle={stats.totalSold + ' items sold'} />
        <StatCard label="Total Profit" value={stats.totalProfit.toLocaleString('fr-FR') + ' EUR'} subtitle={stats.averageMargin.toFixed(1) + '% avg margin'} highlight={stats.totalProfit > 0} />
      </div>

      {/* MoM indicator */}
      <div className="bg-white rounded-xl border border-brand-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase text-brand-500">vs Last Month</p>
            <p className={'text-lg font-bold ' + (momChange >= 0 ? 'text-green-700' : 'text-red-600')}>
              {momChange >= 0 ? '+' : ''}{momChange.toFixed(0)}% profit
            </p>
          </div>
          <div className="text-sm text-brand-500">
            This month: {monthProfit.toLocaleString('fr-FR')} EUR | Last month: {lastMonthProfit.toLocaleString('fr-FR')} EUR
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/purchases/new" className="block p-6 bg-white rounded-xl border border-brand-200 hover:border-brand-400 hover:shadow-md transition-all">
          <h3 className="font-semibold text-brand-900 mb-1">+ Add Purchase</h3>
          <p className="text-sm text-brand-600">Record a new item you bought</p>
        </a>
        <a href="/sales/new" className="block p-6 bg-white rounded-xl border border-brand-200 hover:border-brand-400 hover:shadow-md transition-all">
          <h3 className="font-semibold text-brand-900 mb-1">+ Record Sale</h3>
          <p className="text-sm text-brand-600">Mark an item as sold</p>
        </a>
        <a href="/import" className="block p-6 bg-white rounded-xl border border-brand-200 hover:border-brand-400 hover:shadow-md transition-all">
          <h3 className="font-semibold text-brand-900 mb-1">Import Items</h3>
          <p className="text-sm text-brand-600">Upload CSV or Excel file</p>
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, highlight = false }: { label: string; value: string; subtitle: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-brand-200 p-5">
      <p className="text-xs uppercase tracking-wide text-brand-500 mb-1">{label}</p>
      <p className={'text-2xl font-bold ' + (highlight ? 'text-green-700' : 'text-brand-900')}>{value}</p>
      <p className="text-sm text-brand-500 mt-1">{subtitle}</p>
    </div>
  );
}