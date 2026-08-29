-- PorsiPas V1 Phase 4 retention, privacy-safe watch zones, and alert baseline.
-- Apply after the Phase 2 foundation migrations.

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  collection_id uuid not null unique references public.collections(id) on delete restrict,
  points integer not null check (points > 0),
  reason text not null check (reason = 'verified_rescue_daily'),
  created_at timestamptz not null default now()
);

create index if not exists points_ledger_user_created_idx
  on public.points_ledger (user_id, created_at desc);

create table if not exists public.watch_zones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  center_latitude double precision not null check (center_latitude between -90 and 90),
  center_longitude double precision not null check (center_longitude between -180 and 180),
  radius_meters integer not null default 250 check (radius_meters between 50 and 2000),
  label text null check (label is null or char_length(btrim(label)) between 2 and 80),
  expires_at timestamptz null,
  enabled boolean not null default true,
  refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists watch_zones_enabled_idx
  on public.watch_zones (enabled)
  where enabled;

create table if not exists public.alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  food_drop_id uuid not null references public.food_drops(id) on delete cascade,
  delivery_kind text not null default 'in_app' check (delivery_kind = 'in_app'),
  approximate_distance_meters integer not null check (approximate_distance_meters >= 0),
  title_snapshot text not null,
  venue_name_snapshot text not null,
  remaining_stock_snapshot integer not null check (remaining_stock_snapshot > 0),
  pickup_deadline_snapshot timestamptz not null,
  created_at timestamptz not null default now(),
  presented_at timestamptz null,
  opened_at timestamptz null,
  unique (user_id, food_drop_id, delivery_kind)
);

create index if not exists alert_deliveries_user_created_idx
  on public.alert_deliveries (user_id, created_at desc);
create index if not exists alert_deliveries_user_pending_idx
  on public.alert_deliveries (user_id, created_at)
  where presented_at is null;

drop trigger if exists watch_zones_set_updated_at on public.watch_zones;
create trigger watch_zones_set_updated_at
before update on public.watch_zones
for each row execute function public.set_updated_at();

alter table public.points_ledger enable row level security;
alter table public.watch_zones enable row level security;
alter table public.alert_deliveries enable row level security;

drop policy if exists points_ledger_select_self on public.points_ledger;
create policy points_ledger_select_self on public.points_ledger
for select to authenticated
using (user_id = auth.uid());

drop policy if exists watch_zones_select_self on public.watch_zones;
create policy watch_zones_select_self on public.watch_zones
for select to authenticated
using (user_id = auth.uid());

drop policy if exists alert_deliveries_select_self on public.alert_deliveries;
create policy alert_deliveries_select_self on public.alert_deliveries
for select to authenticated
using (user_id = auth.uid());

revoke all on public.points_ledger, public.watch_zones, public.alert_deliveries
  from public, anon, authenticated;
grant select on public.points_ledger, public.watch_zones, public.alert_deliveries
  to authenticated;

create or replace function private.next_weekly_streak(
  p_current_streak integer,
  p_last_qualified_at timestamptz,
  p_qualifying_at timestamptz
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_last_qualified_at is null then 1
    when date_trunc('week', p_last_qualified_at at time zone 'Asia/Singapore')::date
       = date_trunc('week', p_qualifying_at at time zone 'Asia/Singapore')::date
      then greatest(p_current_streak, 1)
    when date_trunc('week', p_last_qualified_at at time zone 'Asia/Singapore')::date + 7
       = date_trunc('week', p_qualifying_at at time zone 'Asia/Singapore')::date
      then greatest(p_current_streak, 1) + 1
    else 1
  end;
$$;

revoke all on function private.next_weekly_streak(integer, timestamptz, timestamptz)
  from public, anon, authenticated;

-- Migration-time deterministic checks for the weekly Singapore-calendar rule.
do $$
begin
  if private.next_weekly_streak(0, null, '2026-08-25 04:00:00+00') <> 1 then
    raise exception 'weekly streak check failed: first rescue';
  end if;
  if private.next_weekly_streak(3, '2026-08-25 04:00:00+00', '2026-08-28 04:00:00+00') <> 3 then
    raise exception 'weekly streak check failed: same week';
  end if;
  if private.next_weekly_streak(3, '2026-08-25 04:00:00+00', '2026-09-01 04:00:00+00') <> 4 then
    raise exception 'weekly streak check failed: following week';
  end if;
  if private.next_weekly_streak(3, '2026-08-25 04:00:00+00', '2026-09-08 04:00:00+00') <> 1 then
    raise exception 'weekly streak check failed: missed week';
  end if;
  if private.next_weekly_streak(2, '2026-08-30 15:59:00+00', '2026-08-30 16:01:00+00') <> 3 then
    raise exception 'weekly streak check failed: Singapore Monday boundary';
  end if;
end;
$$;

create or replace function public.save_my_watch_zone(
  p_center_latitude double precision,
  p_center_longitude double precision,
  p_radius_meters integer,
  p_label text,
  p_enabled boolean default true
)
returns public.watch_zones
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_zone public.watch_zones;
  v_label text := nullif(btrim(p_label), '');
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if p_center_latitude not between -90 and 90 then raise exception 'invalid_latitude'; end if;
  if p_center_longitude not between -180 and 180 then raise exception 'invalid_longitude'; end if;
  if p_radius_meters not between 50 and 2000 then raise exception 'invalid_radius'; end if;
  if v_label is not null and char_length(v_label) not between 2 and 80 then
    raise exception 'invalid_label';
  end if;

  insert into public.watch_zones (
    user_id, center_latitude, center_longitude, radius_meters, label, enabled, refreshed_at
  ) values (
    auth.uid(), p_center_latitude, p_center_longitude, p_radius_meters, v_label, p_enabled, now()
  )
  on conflict (user_id) do update set
    center_latitude = excluded.center_latitude,
    center_longitude = excluded.center_longitude,
    radius_meters = excluded.radius_meters,
    label = excluded.label,
    enabled = excluded.enabled,
    refreshed_at = now()
  returning * into v_zone;
  return v_zone;
end;
$$;

create or replace function public.disable_my_watch_zone()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  update public.watch_zones set enabled = false where user_id = auth.uid();
end;
$$;

create or replace function public.delete_my_watch_zone()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  delete from public.watch_zones where user_id = auth.uid();
end;
$$;

create or replace function public.list_my_collection_history(p_limit integer default 50)
returns table (
  id uuid,
  food_drop_id uuid,
  user_id uuid,
  title text,
  venue_name text,
  verified_at timestamptz,
  quantity integer,
  points_awarded integer
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  return query
  select c.id, c.food_drop_id, c.user_id, d.title, d.venue_name,
         c.verified_at, c.quantity, c.points_awarded
  from public.collections c
  join public.food_drops d on d.id = c.food_drop_id
  where c.user_id = auth.uid()
  order by c.verified_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
end;
$$;

create or replace function public.get_verified_impact()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_count integer;
  v_total_count integer;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  select count(*)::integer into v_user_count
  from public.collections where user_id = auth.uid();
  select count(*)::integer into v_total_count from public.collections;
  return jsonb_build_object(
    'user_meals_rescued', v_user_count,
    'total_meals_rescued', v_total_count
  );
end;
$$;

create or replace function public.match_food_drop_alerts(p_food_drop_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_drop public.food_drops;
  v_inserted integer := 0;
begin
  select * into v_drop from public.food_drops where id = p_food_drop_id;
  if v_drop.id is null
     or v_drop.status <> 'active'
     or v_drop.remaining_stock <= 0
     or v_drop.pickup_deadline <= now() then
    return 0;
  end if;

  insert into public.alert_deliveries (
    user_id,
    food_drop_id,
    delivery_kind,
    approximate_distance_meters,
    title_snapshot,
    venue_name_snapshot,
    remaining_stock_snapshot,
    pickup_deadline_snapshot
  )
  select matched.user_id,
         v_drop.id,
         'in_app',
         round(matched.distance_meters)::integer,
         v_drop.title,
         v_drop.venue_name,
         v_drop.remaining_stock,
         v_drop.pickup_deadline
  from (
    select zone.user_id,
           2 * 6371000 * asin(
             least(1::double precision, sqrt(
               power(sin(radians(v_drop.latitude - zone.center_latitude) / 2), 2)
               + cos(radians(zone.center_latitude)) * cos(radians(v_drop.latitude))
               * power(sin(radians(v_drop.longitude - zone.center_longitude) / 2), 2)
             ))
           ) as distance_meters
    from public.watch_zones zone
    where zone.enabled
      and (zone.expires_at is null or zone.expires_at > now())
  ) matched
  join public.watch_zones zone on zone.user_id = matched.user_id
  where matched.distance_meters <= zone.radius_meters
  on conflict (user_id, food_drop_id, delivery_kind) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

create or replace function public.enqueue_food_drop_alerts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active' and (old.status is distinct from new.status) then
    perform public.match_food_drop_alerts(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists food_drops_enqueue_alerts on public.food_drops;
create trigger food_drops_enqueue_alerts
after update of status on public.food_drops
for each row execute function public.enqueue_food_drop_alerts();

create or replace function public.mark_my_alert_delivery(p_id uuid, p_event text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if p_event not in ('presented', 'opened') then raise exception 'invalid_alert_event'; end if;
  update public.alert_deliveries
  set presented_at = case when p_event in ('presented', 'opened') then coalesce(presented_at, now()) else presented_at end,
      opened_at = case when p_event = 'opened' then coalesce(opened_at, now()) else opened_at end
  where id = p_id and user_id = auth.uid();
end;
$$;

-- Preserve the Phase 2/3 collection response while adding idempotent rewards.
create or replace function public.collect_food_drop(qr_payload text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prefix constant text := 'porsipas://collect?token=';
  v_token text;
  v_drop public.food_drops;
  v_user public.users;
  v_collection_id uuid;
  v_remaining integer;
  v_points integer := 0;
  v_streak integer;
  v_now timestamptz := clock_timestamp();
  v_scored_today boolean;
begin
  if auth.uid() is null then
    return jsonb_build_object('code', 'unauthenticated', 'food_drop_id', null, 'collection_id', null, 'remaining_stock', null, 'points_awarded', 0, 'current_streak', null);
  end if;
  if qr_payload is null or left(qr_payload, char_length(v_prefix)) <> v_prefix then
    return jsonb_build_object('code', 'invalid_qr', 'food_drop_id', null, 'collection_id', null, 'remaining_stock', null, 'points_awarded', 0, 'current_streak', null);
  end if;

  v_token := substring(qr_payload from char_length(v_prefix) + 1);
  if char_length(v_token) <> 64 then
    return jsonb_build_object('code', 'invalid_qr', 'food_drop_id', null, 'collection_id', null, 'remaining_stock', null, 'points_awarded', 0, 'current_streak', null);
  end if;

  select drop_row.* into v_drop
  from private.food_drop_qr_secrets secret
  join public.food_drops drop_row on drop_row.id = secret.food_drop_id
  where secret.token_hash = extensions.digest(v_token, 'sha256')
  for update of drop_row;

  if v_drop.id is null then
    return jsonb_build_object('code', 'invalid_qr', 'food_drop_id', null, 'collection_id', null, 'remaining_stock', null, 'points_awarded', 0, 'current_streak', null);
  end if;
  if v_drop.status = 'cancelled' then
    return jsonb_build_object('code', 'cancelled', 'food_drop_id', v_drop.id, 'collection_id', null, 'remaining_stock', v_drop.remaining_stock, 'points_awarded', 0, 'current_streak', null);
  end if;
  if v_drop.status = 'expired' or v_drop.pickup_deadline <= v_now then
    if v_drop.status = 'active' then
      update public.food_drops set status = 'expired' where id = v_drop.id;
    end if;
    return jsonb_build_object('code', 'expired', 'food_drop_id', v_drop.id, 'collection_id', null, 'remaining_stock', v_drop.remaining_stock, 'points_awarded', 0, 'current_streak', null);
  end if;
  if v_drop.status = 'depleted' or v_drop.remaining_stock <= 0 then
    return jsonb_build_object('code', 'depleted', 'food_drop_id', v_drop.id, 'collection_id', null, 'remaining_stock', 0, 'points_awarded', 0, 'current_streak', null);
  end if;
  if v_drop.status <> 'active' then
    return jsonb_build_object('code', 'invalid_qr', 'food_drop_id', null, 'collection_id', null, 'remaining_stock', null, 'points_awarded', 0, 'current_streak', null);
  end if;
  if exists (
    select 1 from public.collections
    where food_drop_id = v_drop.id and user_id = auth.uid()
  ) then
    return jsonb_build_object('code', 'duplicate_collection', 'food_drop_id', v_drop.id, 'collection_id', null, 'remaining_stock', v_drop.remaining_stock, 'points_awarded', 0, 'current_streak', null);
  end if;

  select * into v_user from public.users where id = auth.uid() for update;
  if v_user.id is null then raise exception 'missing_user_profile'; end if;

  select exists (
    select 1 from public.collections
    where user_id = auth.uid()
      and (verified_at at time zone 'Asia/Singapore')::date
        = (v_now at time zone 'Asia/Singapore')::date
  ) into v_scored_today;
  if not v_scored_today then v_points := 100; end if;

  v_streak := private.next_weekly_streak(
    v_user.current_streak,
    v_user.last_qualified_rescue_at,
    v_now
  );

  insert into public.collections (food_drop_id, user_id, verified_at, points_awarded)
  values (v_drop.id, auth.uid(), v_now, v_points)
  returning id into v_collection_id;

  if v_points > 0 then
    insert into public.points_ledger (user_id, collection_id, points, reason)
    values (auth.uid(), v_collection_id, v_points, 'verified_rescue_daily');
  end if;

  update public.users
  set points_total = points_total + v_points,
      current_streak = v_streak,
      last_qualified_rescue_at = v_now
  where id = auth.uid();

  v_remaining := v_drop.remaining_stock - 1;
  update public.food_drops
  set remaining_stock = v_remaining,
      status = case when v_remaining = 0 then 'depleted'::public.food_drop_status else status end
  where id = v_drop.id;

  return jsonb_build_object(
    'code', 'success',
    'food_drop_id', v_drop.id,
    'collection_id', v_collection_id,
    'remaining_stock', v_remaining,
    'points_awarded', v_points,
    'current_streak', v_streak
  );
exception
  when unique_violation then
    return jsonb_build_object('code', 'duplicate_collection', 'food_drop_id', v_drop.id, 'collection_id', null, 'remaining_stock', v_drop.remaining_stock, 'points_awarded', 0, 'current_streak', null);
  when others then
    raise warning 'collect_food_drop failed: %', sqlerrm;
    return jsonb_build_object('code', 'server_error', 'food_drop_id', null, 'collection_id', null, 'remaining_stock', null, 'points_awarded', 0, 'current_streak', null);
end;
$$;

revoke all on function public.save_my_watch_zone(double precision, double precision, integer, text, boolean) from public;
revoke all on function public.disable_my_watch_zone() from public;
revoke all on function public.delete_my_watch_zone() from public;
revoke all on function public.list_my_collection_history(integer) from public;
revoke all on function public.get_verified_impact() from public;
revoke all on function public.match_food_drop_alerts(uuid) from public;
revoke all on function public.enqueue_food_drop_alerts() from public;
revoke all on function public.mark_my_alert_delivery(uuid, text) from public;
revoke all on function public.collect_food_drop(text) from public;

grant execute on function public.save_my_watch_zone(double precision, double precision, integer, text, boolean) to authenticated;
grant execute on function public.disable_my_watch_zone() to authenticated;
grant execute on function public.delete_my_watch_zone() to authenticated;
grant execute on function public.list_my_collection_history(integer) to authenticated;
grant execute on function public.get_verified_impact() to authenticated;
grant execute on function public.mark_my_alert_delivery(uuid, text) to authenticated;
grant execute on function public.collect_food_drop(text) to anon, authenticated;

-- Foreground clients may observe only their own alert rows through RLS.
do $$
begin
  alter publication supabase_realtime add table public.alert_deliveries;
exception when duplicate_object then null;
end $$;
