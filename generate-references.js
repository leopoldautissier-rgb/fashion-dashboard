const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xejhtssmglptdimzyjuy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlamh0c3NtZ2xwdGRpbXp5anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODgyNjcsImV4cCI6MjA5NDE2NDI2N30.WVBVEU6bABwU6r6KvIU2uSLIa7vR-uoGRoI3gXR5nXo';
const supabase = createClient(supabaseUrl, supabaseKey);

// French reference codes
const CATEGORY_CODES = {
  'Dress': 'R', 'Top': 'H', 'Jacket': 'V', 'Coat': 'M',
  'Pants': 'P', 'Skirt': 'J', 'Shoes': 'C', 'Bag': 'S', 'Accessory': 'A',
};

const COLOR_CODES = {
  'Black': 'N', 'White': 'B', 'Navy': 'M', 'Beige': 'E', 'Grey': 'G',
  'Brown': 'R', 'Red': 'O', 'Pink': 'P', 'Blue': 'L', 'Green': 'V',
  'Yellow': 'J', 'Orange': 'A', 'Purple': 'U', 'Gold': 'D', 'Silver': 'I', 'Multicolor': 'X',
};

async function run() {
  // Test if reference column exists by trying to query it
  const { error: testError } = await supabase.from('items').select('reference').limit(1);
  
  if (testError && testError.message.includes('reference')) {
    console.log('ERROR: The "reference" column does not exist yet.');
    console.log('');
    console.log('Please go to your Supabase dashboard:');
    console.log('1. Open https://supabase.com/dashboard');
    console.log('2. Click on your project');
    console.log('3. Go to "SQL Editor" in the left sidebar');
    console.log('4. Paste this and click Run:');
    console.log('');
    console.log('   ALTER TABLE items ADD COLUMN reference TEXT UNIQUE;');
    console.log('   ALTER TABLE items ADD COLUMN image_url TEXT;');
    console.log('');
    console.log('Then run this script again.');
    return;
  }

  // Fetch all items ordered by purchase date
  console.log('Fetching all items...');
  const { data: items, error } = await supabase
    .from('items')
    .select('id, category, color, reference')
    .order('purchase_date', { ascending: true });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  // Filter items that need a reference
  const needsRef = items.filter(i => !i.reference);
  console.log('Items needing references: ' + needsRef.length + ' / ' + items.length);

  if (needsRef.length === 0) {
    console.log('All items already have references!');
    return;
  }

  // Track counters per prefix
  const counters = {};

  // First count existing references
  items.filter(i => i.reference).forEach(item => {
    const prefix = item.reference.substring(0, 2);
    const num = parseInt(item.reference.substring(2), 10);
    if (!counters[prefix] || num > counters[prefix]) {
      counters[prefix] = num;
    }
  });

  // Generate references
  console.log('Generating references...');
  for (let i = 0; i < needsRef.length; i++) {
    const item = needsRef[i];
    const catCode = CATEGORY_CODES[item.category] || 'X';
    const colCode = COLOR_CODES[item.color] || 'X';
    const prefix = catCode + colCode;

    if (!counters[prefix]) counters[prefix] = 0;
    counters[prefix]++;

    const reference = prefix + counters[prefix].toString().padStart(4, '0');

    const { error: updateError } = await supabase
      .from('items')
      .update({ reference })
      .eq('id', item.id);

    if (updateError) {
      console.error('Error on ' + item.id + ':', updateError.message);
    }

    if ((i + 1) % 100 === 0) {
      console.log('  ' + (i + 1) + '/' + needsRef.length + ' done');
    }
  }

  console.log('Done! Generated ' + needsRef.length + ' references.');
  console.log('');
  console.log('Examples:');
  console.log('  RN = Robe Noire (Black Dress)');
  console.log('  HB = Haut Blanc (White Top)');
  console.log('  SN = Sac Noir (Black Bag)');
  console.log('  CM = Chaussures Marine (Navy Shoes)');
}

run();