'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';
import { differenceInDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const MONTHLY_PROFIT_GOAL = 3000;

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0, totalInStock: 0, totalSold: 0,
    totalSpent: 0, totalRevenue: 0, totalProfit: 0, averageMargin: 0,
  });
  const [deadStock, setDeadStock] = useState(0);
  const [monthProfit, setMonthProfit] = useState(0);
  const [lastMonthProfit, setLastMonthProfit] = useState(0);

  useEffect(() => { fetchStats(); }, []);

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

    const today = new Date();
    const dead = items.filter((i: any) => i.status === 'In Stock' && differenceInDays(today, new Date(i.purchase_date)) > 30);
    setDeadStock(dead.length);

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const thisMonthSold = items.filter((i: any) => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= monthStart && new Date(i.sale_date) <= monthEnd);
    setMonthProfit(thisMonthSold.reduce((s: number, i: any) => s + ((i.sale_price || 0) - i.purchase_price), 0));

    const lastStart = startOfMonth(subMonths(now, 1));
    const lastEnd = endOfMonth(subMonths(now, 1));
    const lastSold = items.filter((i: any) => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= lastStart && new Date(i.sale_date) <= lastEnd);
    setLastMonthProfit(lastSold.reduce((s: number, i: any) => s + ((i.sale_price || 0) - i.purchase_price), 0));
  }

  const goalPct = Math.min((monthProfit / MONTHLY_PROFIT_GOAL) * 100, 100);
  const momChange = lastMonthProfit > 0 ? ((monthProfit - lastMonthProfit) / lastMonthProfit) * 100 : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {deadStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-800">{deadStock} item{deadStock > 1 ? 's' : ''} unsold for 30+ days</p>
            <p className="text-sm text-amber-600">Consider reducing prices or promoting these items</p>
          </div>
          <a href="/inventory" className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200">View</a>
        </div>
      )}

      {/* Profit goal */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Monthly Profit Goal</p>
          <p className="text-sm text-gray-500">{monthProfit.toLocaleString('fr-FR')} / {MONTHLY_PROFIT_GOAL.toLocaleString('fr-FR')} EUR</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={'h-3 rounded-full transition-all ' + (goalPct >= 100 ? 'bg-emerald-500' : goalPct >= 50 ? 'bg-brand-500' : 'bg-amber-400')}
            style={{ width: goalPct + '%' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{goalPct.toFixed(0)}% reached this month</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Items" value={stats.totalItems.toString()} subtitle={stats.totalInStock + ' in stock'} icon="📦" />
        <StatCard label="Total Spent" value={stats.totalSpent.toLocaleString('fr-FR') + ' €'} subtitle="Purchase cost" icon="💸" />
        <StatCard label="Revenue" value={stats.totalRevenue.toLocaleString('fr-FR') + ' €'} subtitle={stats.totalSold + ' items sold'} icon="💰" />
        <StatCard label="Profit" value={stats.totalProfit.toLocaleString('fr-FR') + ' €'} subtitle={stats.averageMargin.toFixed(1) + '% margin'} icon="📈" highlight />
      </div>

      {/* MoM */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={'text-2xl font-bold ' + (momChange >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {momChange >= 0 ? '↑' : '↓'} {Math.abs(momChange).toFixed(0)}%
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">vs last month</p>
            <p className="text-xs text-gray-400">This month: {monthProfit.toLocaleString('fr-FR')} € | Last: {lastMonthProfit.toLocaleString('fr-FR')} €</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction href="/purchases/new" icon="+" title="Add Purchase" desc="Record a new item" color="brand" />
        <QuickAction href="/sales/new" icon="✓" title="Record Sale" desc="Mark an item as sold" color="emerald" />
        <QuickAction href="/import" icon="↑" title="Import Items" desc="Upload CSV or Excel" color="violet" />
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, icon, highlight }: { label: string; value: string; subtitle: string; icon: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={'text-2xl font-bold ' + (highlight ? 'text-emerald-600' : 'text-gray-900')}>{value}</p>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function QuickAction({ href, icon, title, desc, color }: { href: string; icon: string; title: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 border-brand-100 hover:border-brand-300',
    emerald: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300',
    violet: 'bg-violet-50 border-violet-100 hover:border-violet-300',
  };
  const iconColors: Record<string, string> = {
    brand: 'bg-brand-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    violet: 'bg-violet-500 text-white',
  };
  return (
    <a href={href} className={'block p-5 rounded-xl border transition-all hover:shadow-md ' + colors[color]}>
      <div className="flex items-center gap-3">
        <span className={'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ' + iconColors[color]}>{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
    </a>
  );
}