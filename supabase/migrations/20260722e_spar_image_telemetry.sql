-- 20260722e_spar_image_telemetry.sql
-- Telemetria padów generacji PODGLĄDÓW ekranów (spar-image, lejek /aplikacja).
-- Audyt 426 rozmów (22.07.2026): incydent 18.06 — od rana do ~20:00 ŻADNA generacja
-- obrazów nie przeszła (4 sesje z briefem i 0 obrazów), a system nie zostawił śladu
-- poza logami edge — gen_error_count liczył wyłącznie artefakty spar_reveals.
-- Od teraz: pad podglądu po wyczerpaniu retry bije licznik sesji (ten sam
-- gen_error_count — chip zdrowia w panelu tn-aplikacje zapala się bez zmian
-- w panelu) i z cooldownem 30 min/sesję wysyła alert Slack #sparing.

alter table public.spar_sessions
  add column if not exists gen_alert_at timestamptz;

comment on column public.spar_sessions.gen_error_count is
  'Ile generacji tej sesji definitywnie padło: artefakty spar_reveals (status failed) + pady podglądów spar-image (po retry).';
comment on column public.spar_sessions.gen_alert_at is
  'Stempel ostatniego alertu Slack o padzie generacji podglądu (cooldown w spar_bump_gen_error).';

-- Atomowy inkrement + claim alertu (4 widoki generują się równolegle — zwykły
-- read-modify-write się ściga; blokada wiersza serializuje, alert wygrywa jeden).
create or replace function public.spar_bump_gen_error(p_session uuid, p_cooldown_min int default 30)
returns table(new_count int, should_alert boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_count int;
  v_alert boolean;
begin
  update public.spar_sessions
     set gen_error_count = coalesce(gen_error_count, 0) + 1,
         gen_alert_at = case
           when gen_alert_at is null or gen_alert_at < v_now - make_interval(mins => p_cooldown_min)
             then v_now
           else gen_alert_at
         end
   where id = p_session
   returning gen_error_count, (gen_alert_at = v_now) into v_count, v_alert;
  if not found then
    return;
  end if;
  new_count := v_count;
  should_alert := coalesce(v_alert, false);
  return next;
end $$;

revoke all on function public.spar_bump_gen_error(uuid, int) from public;
revoke all on function public.spar_bump_gen_error(uuid, int) from anon;
revoke all on function public.spar_bump_gen_error(uuid, int) from authenticated;
grant execute on function public.spar_bump_gen_error(uuid, int) to service_role;
