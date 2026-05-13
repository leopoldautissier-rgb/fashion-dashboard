'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseItem } from '@/types';

export default function PrintPage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'In Stock')
      .not('reference', 'is', null)
      .order('created_at', { ascending: false });
    if (data) setItems(data as PurchaseItem[]);
  }

  function toggleAll() {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(items.map(i => i.id));
    }
    setSelectAll(!selectAll);
  }

  function toggleItem(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const selectedItems = items.filter(i => selected.includes(i.id));
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  function printQRCodes() {
    window.print();
  }

  return (
    <div>
      {/* Controls - hidden when printing */}
      <div className="print:hidden space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">Print QR Codes</h1>
          <p className="text-[14px] text-gray-500 mt-1">Select items to generate printable QR stickers (2x2 cm)</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-[13px] font-medium hover:bg-gray-200">
            {selectAll ? 'Deselect all' : 'Select all'}
          </button>
          <button
            onClick={printQRCodes}
            disabled={selected.length === 0}
            className="px-4 py-2 rounded-full bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            Print {selected.length} QR code{selected.length !== 1 ? 's' : ''}
          </button>
        </div>

        {/* Item selection list */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-50">
            {items.map(item => (
              <label key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-[12px] font-mono text-gray-400 w-16">{item.reference}</span>
                <span className="text-[13px] font-medium text-gray-900">{item.brand}</span>
                <span className="text-[13px] text-gray-500">{item.category} — {item.size} — {item.color}</span>
              </label>
            ))}
          </div>
          {items.length === 0 && (
            <p className="text-center py-12 text-gray-400 text-[14px]">No items with references. Add purchases first.</p>
          )}
        </div>
      </div>

      {/* Print layout - only visible when printing */}
      <div className="hidden print:block">
        <div className="grid grid-cols-5 gap-0" style={{ gridTemplateColumns: 'repeat(5, 2cm)', gridAutoRows: '2cm' }}>
          {selectedItems.map(item => (
            <div key={item.id} className="w-[2cm] h-[2cm] border border-gray-200 flex flex-col items-center justify-center p-0.5">
              <img
                src={'https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=' + encodeURIComponent(baseUrl + '/scan/' + item.reference)}
                alt={item.reference || ''}
                className="w-[1.4cm] h-[1.4cm]"
              />
              <p className="text-[6px] font-mono mt-0.5">{item.reference}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}