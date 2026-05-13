'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { formatCurrency } from '@/lib/format';
import { differenceInDays } from 'date-fns';
import { BRANDS, CATEGORIES, SIZES, COLORS } from '@/lib/constants';

export default function PurchasesPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ brand: '', category: '', status: '', size: '', color: '', dateFrom: '', dateTo: '', priceMin: '', priceMax: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data } = await supabase.from('items').select('*').order('purchase_date', { ascending: false });
    if (data) setItems(data as PurchaseItem[]);
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this item?')) return;
    await supabase.from('items').delete().eq('id', id);
    fetchItems();
  }

  function startEdit(item: PurchaseItem) { setEditingId(item.id); setEditForm({ ...item }); }

  async function saveEdit() {
    const { id, created_at, ...updates } = editForm;
    await supabase.from('items').update(updates).eq('id', id);
    setEditingId(null);
    fetchItems();
  }

  function resetFilters() {
    setFilters({ brand: '', category: '', status: '', size: '', color: '', dateFrom: '', dateTo: '', priceMin: '', priceMax: '' });
    setSearch('');
  }

  const filteredItems = items.filter(item => {
    if (filters.brand && item.brand !== filters.brand) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.size && item.size !== filters.size) return false;
    if (filters.color && item.color !== filters.color) return false;
    if (filters.dateFrom && item.purchase_date < filters.dateFrom) return false;
    if (filters.dateTo && item.purchase_date > filters.dateTo) return false;
    if (filters.priceMin && item.purchase_price < parseFloat(filters.priceMin)) return false;
    if (filters.priceMax && item.purchase_price > parseFloat(filters.priceMax)) return false;
    if (search) {
      const s = search.toLowerCase();
      return item.brand.toLowerCase().includes(s) || item.category.toLowerCase().includes(s) || item.color.toLowerCase().includes(s) || item.size.toLowerCase().includes(s) || (item.reference && item.reference.toLowerCase().includes(s));
    }
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">Purchases</h1>
          <p className="text-[14px] text-gray-500 mt-1">{filteredItems.length} items</p>
        </div>
        <div className="flex gap-2">
          <a href="/import" className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200">Import</a>
          <a href="/purchases/new" className="px-4 py-2 rounded-full bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600">+ Add</a>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2">
        <input type="text" placeholder="Search brand, category, color, ref..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
        <button onClick={() => setShowFilters(!showFilters)} className={'px-4 py-2 rounded-xl text-[13px] font-medium border transition-colors ' + (showFilters || activeFilterCount > 0 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200')}>
          Filters{activeFilterCount > 0 ? ' (' + activeFilterCount + ')' : ''}
        </button>
        {activeFilterCount > 0 && <button onClick={resetFilters} className="text-[13px] text-red-500">Clear</button>}
      </div>

      {showFilters && (
        <div className="glass-card rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div><label className="block text-[11px] text-gray-400 mb-1">Brand</label><select value={filters.brand} onChange={e => setFilters(f => ({...f, brand: e.target.value}))} className="w-full text-[12px]"><option value="">All</option>{BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Category</label><select value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))} className="w-full text-[12px]"><option value="">All</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Size</label><select value={filters.size} onChange={e => setFilters(f => ({...f, size: e.target.value}))} className="w-full text-[12px]"><option value="">All</option>{SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Color</label><select value={filters.color} onChange={e => setFilters(f => ({...f, color: e.target.value}))} className="w-full text-[12px]"><option value="">All</option>{COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Status</label><select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="w-full text-[12px]"><option value="">All</option><option value="In Stock">In Stock</option><option value="Sold">Sold</option></select></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Date from</label><input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({...f, dateFrom: e.target.value}))} className="w-full text-[12px]" /></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Date to</label><input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({...f, dateTo: e.target.value}))} className="w-full text-[12px]" /></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Price min</label><input type="number" value={filters.priceMin} onChange={e => setFilters(f => ({...f, priceMin: e.target.value}))} placeholder="0" className="w-full text-[12px]" /></div>
          <div><label className="block text-[11px] text-gray-400 mb-1">Price max</label><input type="number" value={filters.priceMax} onChange={e => setFilters(f => ({...f, priceMax: e.target.value}))} placeholder="100" className="w-full text-[12px]" /></div>
        </div>
      )}

      {/* Items list */}
      <div className="space-y-2">
        {filteredItems.slice(0, 50).map(item => (
          <div key={item.id} className="glass-card rounded-2xl p-3 flex items-center gap-3 hover-lift">
            {/* Image */}
            <img src={item.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop'} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-gray-900">{item.brand}</span>
                <span className="text-[12px] text-gray-400">{item.category}</span>
                <span className="text-[11px] font-mono text-gray-300">{item.reference}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] text-gray-500">{item.size} · {item.color}</span>
                <span className="text-[12px] text-gray-400">{new Date(item.purchase_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Price + Status */}
            <div className="text-right shrink-0">
              <p className="text-[14px] font-semibold text-gray-900">{item.purchase_price.toFixed(0)}€</p>
              <span className={'text-[11px] font-medium ' + (item.status === 'Sold' ? 'text-green-600' : 'text-blue-500')}>{item.status === 'Sold' ? 'Sold ' + (item.sale_price || 0).toFixed(0) + '€' : 'In Stock'}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
              <button onClick={() => startEdit(item)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[11px] hover:bg-gray-200">✏️</button>
              <button onClick={() => deleteItem(item.id)} className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[11px] hover:bg-red-100">🗑️</button>
            </div>
          </div>
        ))}
        {filteredItems.length > 50 && <p className="text-center text-[13px] text-gray-400 py-4">Showing 50 of {filteredItems.length}</p>}
        {filteredItems.length === 0 && <p className="text-center text-[14px] text-gray-400 py-12">No items match your search.</p>}
      </div>
    </div>
  );
}