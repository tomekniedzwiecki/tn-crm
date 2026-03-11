import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  'https://yxmavwkwnfuphjqbelws.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bWF2d2t3bmZ1cGhqcWJlbHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjQyNTUsImV4cCI6MjA4NDM0MDI1NX0.XeR0Fc7OFn6YbNJrOKTBEj36JtmLISZTM87y4ai9340'
);

const { data, error } = await supabase
  .from('orders')
  .select('id, customer_email, customer_name, status, paid_at, amount, created_at, description')
  .ilike('customer_email', '%piotrkaczy%');

console.log('Results:', JSON.stringify(data, null, 2));
if (error) console.log('Error:', error);
