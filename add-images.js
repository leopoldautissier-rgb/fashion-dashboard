const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xejhtssmglptdimzyjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlamh0c3NtZ2xwdGRpbXp5anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODgyNjcsImV4cCI6MjA5NDE2NDI2N30.WVBVEU6bABwU6r6KvIU2uSLIa7vR-uoGRoI3gXR5nXo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Placeholder images by category (using picsum for realistic fashion-like placeholders)
const IMAGES = {
  'Dress': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=200&h=200&fit=crop',
  ],
  'Top': [
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=200&fit=crop',
  ],
  'Jacket': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&h=200&fit=crop',
  ],
  'Shoes': [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=200&h=200&fit=crop',
  ],
  'Bag': [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop',
  ],
  'Accessory': [
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop',
  ],
  'default': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop',
  ],
};

async function run() {
  const { data: items } = await supabase.from('items').select('id, category, image_url').is('image_url', null);
  
  if (!items || items.length === 0) {
    console.log('All items already have images!');
    return;
  }

  console.log('Adding images to ' + items.length + ' items...');

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const categoryImages = IMAGES[item.category] || IMAGES['default'];
    const imageUrl = categoryImages[Math.floor(Math.random() * categoryImages.length)];

    await supabase.from('items').update({ image_url: imageUrl }).eq('id', item.id);

    if ((i + 1) % 200 === 0) console.log('  ' + (i + 1) + '/' + items.length);
  }

  console.log('Done! Added images to ' + items.length + ' items.');
}

run();