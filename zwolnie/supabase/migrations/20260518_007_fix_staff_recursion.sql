-- ============================================================================
-- Fix infinite recursion w ze_staff_admin_all policy.
-- Policy z `exists (select from ze_staff ...)` re-triggeruje RLS na ze_staff,
-- co powoduje recursion. Fix: użyj SECURITY DEFINER helpera.
-- ============================================================================

create or replace function ze_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from ze_staff
        where user_id = auth.uid() and role = 'admin' and is_active = true
    );
$$;

revoke execute on function ze_is_admin() from public;
grant execute on function ze_is_admin() to authenticated, anon;

drop policy if exists ze_staff_admin_all on ze_staff;

create policy ze_staff_admin_all on ze_staff
    for all to authenticated
    using (ze_is_admin())
    with check (ze_is_admin());
