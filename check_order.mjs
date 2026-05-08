import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://yxmavwkwnfuphjqbelws.supabase.co',
  'sb_publishable_vT94u2GI4gzYl8gCV5sHbQ_Q94YidaI'
);

const { data, error } = await supabase
  .from('orders')
  .select('id, customer_email, customer_name, status, paid_at, amount, created_at, description')
  .ilike('customer_email', '%piotrkaczy%');

console.log('Results:', JSON.stringify(data, null, 2));
if (error) console.log('Error:', error);
