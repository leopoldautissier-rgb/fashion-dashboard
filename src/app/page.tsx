'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/format';
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
    setDeadStock(items.filter((i: any) => i.status === 'In Stock' && differenceInDays(today, new Date(i.purchase_date)) > 30).length);

    const now = new Date();
    const thisMonthSold = items.filter((i: any) => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= startOfMonth(now) && new Date(i.sale_date) <= endOfMonth(now));
    setMonthProfit(thisMonthSold.reduce((s: number, i: any) => s + ((i.sale_price || 0) - i.purchase_price), 0));

    const lastSold = items.filter((i: any) => i.status === 'Sold' && i.sale_date && new Date(i.sale_date) >= startOfMonth(subMonths(now, 1)) && new Date(i.sale_date) <= endOfMonth(subMonths(now, 1)));
    setLastMonthProfit(lastSold.reduce((s: number, i: any) => s + ((i.sale_price || 0) - i.purchase_price), 0));
  }

  const goalPct = Math.min((monthProfit / MONTHLY_PROFIT_GOAL) * 100, 100);
  const momChange = lastMonthProfit > 0 ? ((monthProfit - lastMonthProfit) / lastMonthProfit) * 100 : 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-[14px] lg:text-[15px] text-gray-500 mt-1">Your business at a glance.</p>
      </div>

      {/* Alert */}
      {deadStock > 0 && (
        <div className="flex items-center gap-3 p-3.5 lg:p-4 rounded-2xl bg-orange-50/80 border border-orange-100">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-orange-100 flex items-center justify-center text-base lg:text-lg shrink-0">⚠️</div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-orange-900">{deadStock} item{deadStock > 1 ? 's' : ''} unsold 30+ days</p>
            <p className="text-[12px] text-orange-700/70 hidden sm:block">Consider reducing prices</p>
          </div>
          <a href="/inventory" className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-900 text-[12px] font-medium hover:bg-orange-200 transition-colors shrink-0">View</a>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        <StatCard label="Items" value={stats.totalItems.toString()} detail={stats.totalInStock + ' in stock'} />
        <StatCard label="Spent" value={formatCurrency(stats.totalSpent)} detail="Total purchases" />
        <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} detail={stats.totalSold + ' sold'} />
        <StatCard label="Profit" value={formatCurrency(stats.totalProfit)} detail={stats.averageMargin.toFixed(0) + '% margin'} accent />
      </div>

      {/* Progress + MoM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <div className="glass-card rounded-2xl p-5 lg:p-6">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h3 className="text-[14px] lg:text-[15px] font-medium text-gray-900">Monthly Goal</h3>
            <span className="text-[12px] lg:text-[13px] text-gray-500">{formatCurrency(monthProfit)} / {formatCurrency(MONTHLY_PROFIT_GOAL)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 lg:h-2.5 overflow-hidden">
            <div
              className={'h-full rounded-full transition-all duration-700 ease-out ' + (goalPct >= 100 ? 'bg-green-500' : 'bg-blue-500')}
              style={{ width: goalPct + '%' }}
            />
          </div>
          <p className="text-[12px] lg:text-[13px] text-gray-400 mt-2 lg:mt-3">{goalPct.toFixed(0)}% of target reached</p>
        </div>

        <div className="glass-card rounded-2xl p-5 lg:p-6">
          <h3 className="text-[14px] lg:text-[15px] font-medium text-gray-900 mb-2 lg:mb-3">vs Last Month</h3>
          <div className="flex items-baseline gap-2 lg:gap-3">
            <span className={'text-3xl lg:text-4xl font-semibold tracking-tight ' + (momChange >= 0 ? 'text-green-600' : 'text-red-500')}>
              {momChange >= 0 ? '+' : ''}{momChange.toFixed(0)}%
            </span>
            <span className="text-[12px] lg:text-[13px] text-gray-400">profit</span>
          </div>
          <p className="text-[12px] lg:text-[13px] text-gray-400 mt-2 lg:mt-3">
            {formatCurrency(monthProfit)} vs {formatCurrency(lastMonthProfit)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[12px] lg:text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3 lg:mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          <ActionCard href="/purchases/new" icon="+" title="Add Purchase" color="blue" />
          <ActionCard href="/sales/new" icon="✓" title="Record Sale" color="green" />
          <ActionCard href="/import" icon="↑" title="Import File" color="purple" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail, accent }: { label: string; value: string; detail: string; accent?: boolean }) {
  return (
    <div className="glass-card rounded-2xl p-4 lg:p-5 hover-lift">
      <p className="text-[11px] lg:text-[13px] font-medium text-gray-400 mb-0.5 lg:mb-1">{label}</p>
      <p className={'text-xl lg:text-2xl font-semibold tracking-tight ' + (accent ? 'text-green-600' : 'text-gray-900')}>{value}</p>
      <p className="text-[11px] lg:text-[13px] text-gray-400 mt-0.5 lg:mt-1">{detail}</p>
    </div>
  );
}

function ActionCard({ href, icon, title, color }: { href: string; icon: string; title: string; color: string }) {
  const colors: Record<string, string> = { blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500' };
  return (
    <a href={href} className="glass-card rounded-2xl p-4 lg:p-5 hover-lift flex items-center gap-3 lg:gap-4 group">
      <div className={'w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-white text-base lg:text-lg font-medium ' + colors[color]}>{icon}</div>
      <span className="text-[14px] lg:text-[15px] font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{title}</span>
    </a>
  );
}