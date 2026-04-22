const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://zahdxekcwdlcbzfsnaej.supabase.co',
  'sb_publishable_aEXMv40CXz5PvUutImI7LA_8HJm1xY_'
);

async function main() {
  // First try inserting directly — if table exists it'll work
  // Try creating the initial promo codes
  const initialCodes = [
    { code: 'SL-SUMMERGLOW1', discount_type: 'fixed', discount_value: 100, min_order_amount: 699, description: 'Every Day Protection Combo' },
    { code: 'SL-GLOWTRIO',    discount_type: 'fixed', discount_value: 150, min_order_amount: 899, description: 'Complete Skincare Trio - Small' },
    { code: 'SL-TRIOLUXE',    discount_type: 'fixed', discount_value: 200, min_order_amount: 1099,description: 'Complete Skincare Trio - Large' },
    { code: 'SL-PMROUTINE',   discount_type: 'fixed', discount_value: 100, min_order_amount: 999, description: 'Sunset Skincare Routine' },
  ];

  const { error } = await sb.from('promo_codes').insert(initialCodes);
  if (error) {
    console.error('Insert error (table may not exist):', error.message);
  } else {
    console.log('Promo codes inserted successfully');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
