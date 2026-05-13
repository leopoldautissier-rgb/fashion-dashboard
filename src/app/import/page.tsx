'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImportPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<any[]>([]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setMessage('Reading file...');

    try {
      const XLSX = (await import('xlsx')).default;
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        setStatus('error');
        setMessage('File is empty');
        return;
      }

      // Normalize column names
      const items = rows.map(row => ({
        brand: row.brand || row.Brand || '',
        category: row.category || row.Category || '',
        size: row.size || row.Size || 'M',
        color: row.color || row.Color || '',
        purchase_price: parseFloat(row.purchase_price || row['Purchase Price'] || row.price || 0),
        purchase_date: normalizeDate(row.purchase_date || row['Purchase Date'] || row.date),
        platform: row.platform || row.Platform || 'Vinted',
        condition: row.condition || row.Condition || 'Like new',
        notes: row.notes || row.Notes || null,
        status: row.status || row.Status || 'In Stock',
        sale_price: row.sale_price || row['Sale Price'] ? parseFloat(row.sale_price || row['Sale Price']) : null,
        sale_date: row.sale_date || row['Sale Date'] ? normalizeDate(row.sale_date || row['Sale Date']) : null,
      }));

      setPreview(items.slice(0, 5));
      setMessage('Found ' + rows.length + ' items. Uploading...');

      // Upload in batches of 50
      for (let i = 0; i < items.length; i += 50) {
        const batch = items.slice(i, i + 50);
        const { error } = await supabase.from('items').insert(batch);
        if (error) {
          setStatus('error');
          setMessage('Error at row ' + (i + 1) + ': ' + error.message);
          return;
        }
      }

      setStatus('success');
      setMessage('Successfully imported ' + items.length + ' items!');
    } catch (err: any) {
      setStatus('error');
      setMessage('Error reading file: ' + err.message);
    }
  }

  function normalizeDate(val: any): string {
    if (!val) return new Date().toISOString().split('T')[0];
    if (typeof val === 'number') {
      // Excel serial date
      const date = new Date((val - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-brand-900 mb-6">Import Items</h2>

      <div className="bg-white rounded-xl border border-brand-200 p-6 mb-6">
        <h3 className="font-medium text-brand-900 mb-3">Upload CSV or Excel file</h3>
        <p className="text-sm text-brand-600 mb-4">
          Your file should have columns: brand, category, size, color, purchase_price, purchase_date, platform, condition.
          Optional: notes, status, sale_price, sale_date.
        </p>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFile}
          className="block w-full text-sm text-brand-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-100 file:text-brand-900 hover:file:bg-brand-200"
        />
      </div>

      {status !== 'idle' && (
        <div className={'rounded-lg p-4 mb-6 ' + (status === 'success' ? 'bg-green-50 text-green-800' : status === 'error' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800')}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <h3 className="font-medium text-brand-900 mb-3">Preview (first 5 rows)</h3>
          <div className="bg-white rounded-xl border border-brand-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-brand-50">
                <tr>
                  <th className="px-3 py-2 text-left">Brand</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-left">Color</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {preview.map((item, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{item.brand}</td>
                    <td className="px-3 py-2">{item.category}</td>
                    <td className="px-3 py-2">{item.size}</td>
                    <td className="px-3 py-2">{item.color}</td>
                    <td className="px-3 py-2 text-right">{item.purchase_price} EUR</td>
                    <td className="px-3 py-2">{item.purchase_date}</td>
                    <td className="px-3 py-2">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-brand-50 rounded-lg">
        <h3 className="font-medium text-brand-900 mb-2">Template</h3>
        <p className="text-sm text-brand-600 mb-2">Download a template to fill in:</p>
        <a href="/api/template" className="text-sm text-brand-700 underline">Download Excel template</a>
      </div>
    </div>
  );
}