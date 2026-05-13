'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';
import { differenceInDays } from 'date-fns';
import { BRANDS, CATEGORIES, SIZES, PLATFORMS, CONDITIONS, COLORS } from '@/lib/constants';

export default function PurchasesPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    status: '',
    size: '',
    color: '',
    platform: '',
    condition: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    daysMin: '',
    daysMax: '',
  });
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

  function startEdit(item: PurchaseItem) {
    setEditingId(item.id);
    setEditForm({ ...item });
  }

  async function saveEdit() {
    const { id, created_at, ...updates } = editForm;
    await supabase.from('items').update(updates).eq('id', id);
    setEditingId(null);
    fetchItems();
  }

  function resetFilters() {
    setFilters({ brand: '', category: '', status: '', size: '', color: '', platform: '', condition: '', dateFrom: '', dateTo: '', priceMin: '', priceMax: '', daysMin: '', daysMax: '' });
    setSearch('');
  }

  const today = new Date();

  const filteredItems = items.filter(item => {
    if (filters.brand && item.brand !== filters.brand) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.size && item.size !== filters.size) return false;
    if (filters.color && item.color !== filters.color) return false;
    if (filters.platform && item.platform !== filters.platform) return false;
    if (filters.condition && item.condition !== filters.condition) return false;
    if (filters.dateFrom && item.purchase_date < filters.dateFrom) return false;
    if (filters.dateTo && item.purchase_date > filters.dateTo) return false;
    if (filters.priceMin && item.purchase_price < parseFloat(filters.priceMin)) return false;
    if (filters.priceMax && item.purchase_price > parseFloat(filters.priceMax)) return false;
    if (filters.daysMin || filters.daysMax) {
      const days = item.status === 'In Stock' ? differenceInDays(today, new Date(item.purchase_date)) : 0;
      if (filters.daysMin && days < parseInt(filters.daysMin)) return false;
      if (filters.daysMax && days > parseInt(filters.daysMax)) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const match = item.brand.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s) ||
        item.color.toLowerCase().includes(s) ||
        item.size.toLowerCase().includes(s) ||
        item.platform.toLowerCase().includes(s) ||
        (item.notes && item.notes.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-brand-900">All Purchases</h2>
        <div className="flex gap-3">
          <a href="/import" className="px-4 py-2 bg-brand-100 text-brand-900 rounded-lg hover:bg-brand-200 text-sm font-medium">Import</a>
          <a href="/purchases/new" className="px-4 py-2 bg-brand-900 text-white rounded-lg hover:bg-brand-800 text-sm font-medium">+ Add Purchase</a>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by brand, category, color, size..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={'px-4 py-2 rounded-lg text-sm font-medium border ' + (showFilters || activeFilterCount > 0 ? 'bg-brand-900 text-white border-brand-900' : 'bg-white text-brand-700 border-brand-200')}
        >
          Filters {activeFilterCount > 0 ? '(' + activeFilterCount + ')' : ''}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={resetFilters} className="px-3 py-2 text-sm text-red-600 hover:text-red-800">Clear all</button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-brand-200 p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-brand-500 mb-1">Brand</label>
              <select value={filters.brand} onChange={e => setFilters(f => ({...f, brand: e.target.value}))} className="w-full text-xs">
                <option value="">All</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Category</label>
              <select value={filters.category} onChange={e => setFilters(f => ({...f, category: e.target.value}))} className="w-full text-xs">
                <option value="">All</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Size</label>
              <select value={filters.size} onChange={e => setFilters(f => ({...f, size: e.target.value}))} className="w-full text-xs">
                <option value="">All</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Color</label>
              <select value={filters.color} onChange={e => setFilters(f => ({...f, color: e.target.value}))} className="w-full text-xs">
                <option value="">All</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Platform</label>
              <select value={filters.platform} onChange={e => setFilters(f => ({...f, platform: e.target.value}))} className="w-full text-xs">
                <option value="">All</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Condition</label>
              <select value={filters.condition} onChange={e => setFilters(f => ({...f, condition: e.target.value}))} className="w-full text-xs">
                <option value="">All</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Status</label>
              <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="w-full text-xs">
                <option value="">All</option>
                <option value="In Stock">In Stock</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Date from</label>
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({...f, dateFrom: e.target.value}))} className="w-full text-xs" />
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Date to</label>
              <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({...f, dateTo: e.target.value}))} className="w-full text-xs" />
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Price min (EUR)</label>
              <input type="number" value={filters.priceMin} onChange={e => setFilters(f => ({...f, priceMin: e.target.value}))} placeholder="0" className="w-full text-xs" />
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Price max (EUR)</label>
              <input type="number" value={filters.priceMax} onChange={e => setFilters(f => ({...f, priceMax: e.target.value}))} placeholder="100" className="w-full text-xs" />
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Days in stock</label>
              <div className="flex gap-1">
                <input type="number" value={filters.daysMin} onChange={e => setFilters(f => ({...f, daysMin: e.target.value}))} placeholder="min" className="w-1/2 text-xs" />
                <input type="number" value={filters.daysMax} onChange={e => setFilters(f => ({...f, daysMax: e.target.value}))} placeholder="max" className="w-1/2 text-xs" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick filter presets */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => { setFilters(f => ({...f, status: 'In Stock', daysMin: '30', daysMax: ''})); setShowFilters(true); }} className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200">Dead stock (30d+)</button>
        <button onClick={() => { setFilters(f => ({...f, priceMin: '40', priceMax: '', status: ''})); setShowFilters(true); }} className="px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 hover:bg-brand-200">High value (40+ EUR)</button>
        <button onClick={() => { const weekAgo = new Date(Date.now() - 7*86400000).toISOString().split('T')[0]; setFilters(f => ({...f, dateFrom: weekAgo, dateTo: '', status: ''})); setShowFilters(true); }} className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">This week</button>
        <button onClick={() => { setFilters(f => ({...f, brand: 'Dior', status: ''})); setShowFilters(true); }} className="px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 hover:bg-brand-200">Dior only</button>
        <button onClick={() => { setFilters(f => ({...f, brand: 'Chanel', status: ''})); setShowFilters(true); }} className="px-3 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700 hover:bg-brand-200">Chanel only</button>
      </div>

      <p className="text-sm text-brand-500 mb-4">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 border-b border-brand-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Date</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Category</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Size</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Color</th>
              <th className="text-left px-4 py-3 font-medium text-brand-700">Platform</th>
              <th className="text-right px-4 py-3 font-medium text-brand-700">Price</th>
              <th className="text-center px-4 py-3 font-medium text-brand-700">Status</th>
              <th className="text-center px-4 py-3 font-medium text-brand-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {filteredItems.slice(0, 100).map(item => (
              <tr key={item.id} className="hover:bg-brand-50">
                {editingId === item.id ? (
                  <>
                    <td className="px-4 py-2"><input type="date" value={editForm.purchase_date} onChange={e => setEditForm({...editForm, purchase_date: e.target.value})} className="w-28 text-xs" /></td>
                    <td className="px-4 py-2"><select value={editForm.brand} onChange={e => setEditForm({...editForm, brand: e.target.value})} className="w-24 text-xs">{BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></td>
                    <td className="px-4 py-2"><select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-20 text-xs">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></td>
                    <td className="px-4 py-2"><select value={editForm.size} onChange={e => setEditForm({...editForm, size: e.target.value})} className="w-14 text-xs">{SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                    <td className="px-4 py-2"><select value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} className="w-20 text-xs">{COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select></td>
                    <td className="px-4 py-2"><select value={editForm.platform} onChange={e => setEditForm({...editForm, platform: e.target.value})} className="w-20 text-xs">{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></td>
                    <td className="px-4 py-2"><input type="number" value={editForm.purchase_price} onChange={e => setEditForm({...editForm, purchase_price: parseFloat(e.target.value)})} className="w-16 text-xs" /></td>
                    <td className="px-4 py-2 text-center"><span className="text-xs">{editForm.status}</span></td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={saveEdit} className="text-xs text-green-700 font-medium mr-2">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-brand-500">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-brand-600">{new Date(item.purchase_date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 font-medium text-brand-900">{item.brand}</td>
                    <td className="px-4 py-3 text-brand-700">{item.category}</td>
                    <td className="px-4 py-3 text-brand-700">{item.size}</td>
                    <td className="px-4 py-3 text-brand-700">{item.color}</td>
                    <td className="px-4 py-3 text-brand-600">{item.platform}</td>
                    <td className="px-4 py-3 text-right text-brand-900">{item.purchase_price.toLocaleString('fr-FR')} EUR</td>
                    <td className="px-4 py-3 text-center">
                      <span className={'inline-block px-2 py-0.5 rounded-full text-xs font-medium ' + (item.status === 'Sold' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => startEdit(item)} className="text-xs text-brand-600 hover:text-brand-900 mr-2">Edit</button>
                      <button onClick={() => deleteItem(item.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length > 100 && (
          <div className="text-center py-3 text-sm text-brand-500 border-t border-brand-100">
            Showing first 100 of {filteredItems.length} items
          </div>
        )}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-brand-400">
            No items match your filters. <button onClick={resetFilters} className="text-brand-700 underline">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}