import { supabase } from './supabase';
import { CATEGORY_CODES, COLOR_CODES } from './constants';

// Generate a reference like DB0001 (Dress + Black + sequential number)
export async function generateReference(category: string, color: string): Promise<string> {
  const catCode = CATEGORY_CODES[category] || 'X';
  const colCode = COLOR_CODES[color] || 'X';
  const prefix = catCode + colCode;

  // Find the highest existing number for this prefix
  const { data } = await supabase
    .from('items')
    .select('reference')
    .like('reference', prefix + '%')
    .order('reference', { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (data && data.length > 0 && data[0].reference) {
    const existing = data[0].reference;
    const numPart = existing.substring(2);
    nextNum = parseInt(numPart, 10) + 1;
  }

  return prefix + nextNum.toString().padStart(4, '0');
}

// Get the scan URL for a reference
export function getScanUrl(reference: string): string {
  return '/scan/' + reference;
}