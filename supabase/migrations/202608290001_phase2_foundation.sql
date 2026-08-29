-- PorsiPas V1 Phase 2 foundation
-- Run once in the Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto with schema extensions;

do $$ begin
  create type public.food_drop_status as enum ('draft', 'active', 'depleted', 'expired', 'cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text null check (display_name is null or char_length(btrim(display_name)) between 2 and 40),
  points_total integer not null default 0 check (points_total >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  last_qualified_rescue_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.food_drops (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.users(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 2 and 80),
  description text null check (description is null or char_length(description) <= 500),
  photo_url text not null check (char_length(btrim(photo_url)) > 0),
  initial_stock integer not null check (initial_stock > 0),
  remaining_stock integer not null check (remaining_stock >= 0 and remaining_stock <= initial_stock),
  venue_name text not null check (char_length(btrim(venue_name)) between 2 and 100),
  building_code text null check (building_code is null or char_length(building_code) <= 40),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  pickup_instructions text null check (pickup_instructions is null or char_length(pickup_instructions) <= 300),
  pickup_deadline timestamptz not null,
  dietary_tags text[] not null default '{}'::text[] check (
    dietary_tags <@ array['halal', 'vegetarian', 'vegan', 'contains_pork', 'unknown']::text[]
  ),
  allergen_note text not null check (char_length(btrim(allergen_note)) > 0 and char_length(allergen_note) <= 300),
  confirms_unserved_surplus boolean not null default false,
  status public.food_drop_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'draft' or confirms_unserved_surplus)
);

create index if not exists food_drops_active_deadline_idx
  on public.food_drops (pickup_deadline)
  where status = 'active';
create index if not exists food_drops_host_created_idx
  on public.food_drops (host_id, created_at desc);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  food_drop_id uuid not null references public.food_drops(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  verified_at timestamptz not null default now(),
  quantity integer not null default 1 check (quantity = 1),
  points_awarded integer not null default 0 check (points_awarded >= 0),
  unique (food_drop_id, user_id)
);

create index if not exists collections_user_verified_idx
  on public.collections (user_id, verified_at desc);

create table if not exists public.food_drop_audit (
  id bigint generated always as identity primary key,
  food_drop_id uuid not null references public.food_drops(id) on delete cascade,
  actor_user_id uuid not null references public.users(id) on delete restrict,
  action text not null,
  reason text null,
  previous_remaining_stock integer null,
  new_remaining_stock integer null,
  created_at timestamptz not null default now()
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.food_drop_qr_secrets (
  food_drop_id uuid primary key references public.food_drops(id) on delete cascade,
  token_hash bytea not null unique,
  raw_token text not null,
  created_at timestamptz not null default now()
);

alter table private.food_drop_qr_secrets enable row level security;
revoke all on all tables in schema private from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists food_drops_set_updated_at on public.food_drops;
create trigger food_drops_set_updated_at
before update on public.food_drops
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

-- Backfill profiles if this migration is applied after test users were created.
insert into public.users (id)
select id from auth.users
on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.food_drops enable row level security;
alter table public.collections enable row level security;
alter table public.food_drop_audit enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
for select to authenticated
using (id = auth.uid());

drop policy if exists food_drops_select_collectible_or_own on public.food_drops;
create policy food_drops_select_collectible_or_own on public.food_drops
for select to authenticated
using (
  host_id = auth.uid()
  or (
    status = 'active'
    and remaining_stock > 0
    and pickup_deadline > now()
  )
);

drop policy if exists collections_select_self on public.collections;
create policy collections_select_self on public.collections
for select to authenticated
using (user_id = auth.uid());

drop policy if exists food_drop_audit_select_host on public.food_drop_audit;
create policy food_drop_audit_select_host on public.food_drop_audit
for select to authenticated
using (
  exists (
    select 1 from public.food_drops
    where food_drops.id = food_drop_audit.food_drop_id
      and food_drops.host_id = auth.uid()
  )
);

revoke all on public.users, public.food_drops, public.collections, public.food_drop_audit
  from anon, authenticated;
grant select on public.users, public.food_drops, public.collections, public.food_drop_audit
  to authenticated;

create or replace function public.set_display_name(p_display_name text)
returns public.users
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user public.users;
  v_name text := btrim(p_display_name);
begin
  if auth.uid() is null then
    raise exception 'unauthenticated';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 40 then
    raise exception 'display_name_must_be_2_to_40_characters';
  end if;

  update public.users
  set display_name = v_name
  where id = auth.uid()
  returning * into v_user;

  if v_user.id is null then
    raise exception 'profile_not_found';
  end if;
  return v_user;
end;
$$;

create or replace function public.create_food_drop_draft(
  p_title text,
  p_description text,
  p_photo_url text,
  p_initial_stock integer,
  p_venue_name text,
  p_building_code text,
  p_latitude double precision,
  p_longitude double precision,
  p_pickup_instructions text,
  p_pickup_deadline timestamptz,
  p_dietary_tags text[],
  p_allergen_note text,
  p_confirms_unserved_surplus boolean
)
returns public.food_drops
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_drop public.food_drops;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if p_initial_stock is null or p_initial_stock <= 0 then raise exception 'stock_must_be_positive'; end if;
  if p_pickup_deadline is null or p_pickup_deadline <= now() then raise exception 'deadline_must_be_future'; end if;
  if not coalesce(p_confirms_unserved_surplus, false) then raise exception 'surplus_confirmation_required'; end if;

  insert into public.food_drops (
    host_id, title, description, photo_url, initial_stock, remaining_stock,
    venue_name, building_code, latitude, longitude, pickup_instructions,
    pickup_deadline, dietary_tags, allergen_note, confirms_unserved_surplus
  ) values (
    auth.uid(), btrim(p_title), nullif(btrim(p_description), ''), btrim(p_photo_url),
    p_initial_stock, p_initial_stock, btrim(p_venue_name), nullif(btrim(p_building_code), ''),
    p_latitude, p_longitude, nullif(btrim(p_pickup_instructions), ''), p_pickup_deadline,
    coalesce(p_dietary_tags, '{}'::text[]), btrim(p_allergen_note), true
  ) returning * into v_drop;

  return v_drop;
end;
$$;

create or replace function public.publish_food_drop(p_id uuid)
returns public.food_drops
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_drop public.food_drops;
  v_token text;
begin
  select * into v_drop from public.food_drops
  where id = p_id and host_id = auth.uid()
  for update;

  if v_drop.id is null then raise exception 'food_drop_not_found'; end if;
  if v_drop.status <> 'draft' then raise exception 'only_drafts_can_be_published'; end if;
  if v_drop.pickup_deadline <= now() then raise exception 'deadline_must_be_future'; end if;
  if v_drop.remaining_stock <= 0 then raise exception 'stock_must_be_positive'; end if;
  if not v_drop.confirms_unserved_surplus then raise exception 'surplus_confirmation_required'; end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into private.food_drop_qr_secrets (food_drop_id, token_hash, raw_token)
  values (v_drop.id, extensions.digest(v_token, 'sha256'), v_token)
  on conflict (food_drop_id) do update
    set token_hash = excluded.token_hash, raw_token = excluded.raw_token, created_at = now();

  update public.food_drops set status = 'active'
  where id = v_drop.id returning * into v_drop;

  insert into public.food_drop_audit (food_drop_id, actor_user_id, action, new_remaining_stock)
  values (v_drop.id, auth.uid(), 'published', v_drop.remaining_stock);
  return v_drop;
end;
$$;

create or replace function public.get_food_drop_qr_payload(p_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  select secret.raw_token into v_token
  from private.food_drop_qr_secrets secret
  join public.food_drops drop_row on drop_row.id = secret.food_drop_id
  where drop_row.id = p_id
    and drop_row.host_id = auth.uid()
    and drop_row.status = 'active';

  if v_token is null then raise exception 'active_food_drop_qr_not_found'; end if;
  return 'porsipas://collect?token=' || v_token;
end;
$$;

create or replace function public.adjust_food_drop_stock(
  p_id uuid,
  p_remaining_stock integer,
  p_reason text
)
returns public.food_drops
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_drop public.food_drops;
  v_previous integer;
begin
  select * into v_drop from public.food_drops
  where id = p_id and host_id = auth.uid()
  for update;

  if v_drop.id is null then raise exception 'food_drop_not_found'; end if;
  if v_drop.status <> 'active' then raise exception 'only_active_food_drops_can_change_stock'; end if;
  if v_drop.pickup_deadline <= now() then
    update public.food_drops set status = 'expired' where id = v_drop.id returning * into v_drop;
    return v_drop;
  end if;
  if p_remaining_stock < 0 or p_remaining_stock > v_drop.initial_stock then raise exception 'invalid_remaining_stock'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'stock_reason_required'; end if;

  v_previous := v_drop.remaining_stock;
  update public.food_drops
  set remaining_stock = p_remaining_stock,
      status = case when p_remaining_stock = 0 then 'depleted'::public.food_drop_status else status end
  where id = v_drop.id returning * into v_drop;

  insert into public.food_drop_audit (
    food_drop_id, actor_user_id, action, reason, previous_remaining_stock, new_remaining_stock
  ) values (v_drop.id, auth.uid(), 'stock_adjusted', btrim(p_reason), v_previous, p_remaining_stock);
  return v_drop;
end;
$$;

create or replace function public.extend_food_drop_deadline(p_id uuid, p_pickup_deadline timestamptz)
returns public.food_drops
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_drop public.food_drops;
begin
  if p_pickup_deadline <= now() then raise exception 'deadline_must_be_future'; end if;

  update public.food_drops
  set pickup_deadline = p_pickup_deadline
  where id = p_id and host_id = auth.uid() and status = 'active'
  returning * into v_drop;

  if v_drop.id is null then raise exception 'active_food_drop_not_found'; end if;
  insert into public.food_drop_audit (food_drop_id, actor_user_id, action, reason)
  values (v_drop.id, auth.uid(), 'deadline_extended', p_pickup_deadline::text);
  return v_drop;
end;
$$;

create or replace function public.cancel_food_drop(p_id uuid)
returns public.food_drops
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_drop public.food_drops;
begin
  update public.food_drops
  set status = 'cancelled'
  where id = p_id and host_id = auth.uid() and status in ('draft', 'active')
  returning * into v_drop;

  if v_drop.id is null then raise exception 'cancellable_food_drop_not_found'; end if;
  insert into public.food_drop_audit (food_drop_id, actor_user_id, action)
  values (v_drop.id, auth.uid(), 'cancelled');
  return v_drop;
end;
$$;

create or replace function public.expire_food_drops()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.food_drops
  set status = 'expired'
  where status = 'active' and pickup_deadline <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

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
  v_collection_id uuid;
  v_remaining integer;
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
  if v_drop.status = 'expired' or v_drop.pickup_deadline <= now() then
    if v_drop.status = 'active' then update public.food_drops set status = 'expired' where id = v_drop.id; end if;
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

  insert into public.collections (food_drop_id, user_id)
  values (v_drop.id, auth.uid())
  returning id into v_collection_id;

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
    'points_awarded', 0,
    'current_streak', null
  );
exception
  when unique_violation then
    return jsonb_build_object('code', 'duplicate_collection', 'food_drop_id', v_drop.id, 'collection_id', null, 'remaining_stock', v_drop.remaining_stock, 'points_awarded', 0, 'current_streak', null);
  when others then
    raise warning 'collect_food_drop failed: %', sqlerrm;
    return jsonb_build_object('code', 'server_error', 'food_drop_id', null, 'collection_id', null, 'remaining_stock', null, 'points_awarded', 0, 'current_streak', null);
end;
$$;

revoke all on function public.set_display_name(text) from public;
revoke all on function public.create_food_drop_draft(text, text, text, integer, text, text, double precision, double precision, text, timestamptz, text[], text, boolean) from public;
revoke all on function public.publish_food_drop(uuid) from public;
revoke all on function public.get_food_drop_qr_payload(uuid) from public;
revoke all on function public.adjust_food_drop_stock(uuid, integer, text) from public;
revoke all on function public.extend_food_drop_deadline(uuid, timestamptz) from public;
revoke all on function public.cancel_food_drop(uuid) from public;
revoke all on function public.expire_food_drops() from public;
revoke all on function public.collect_food_drop(text) from public;

grant execute on function public.set_display_name(text) to authenticated;
grant execute on function public.create_food_drop_draft(text, text, text, integer, text, text, double precision, double precision, text, timestamptz, text[], text, boolean) to authenticated;
grant execute on function public.publish_food_drop(uuid) to authenticated;
grant execute on function public.get_food_drop_qr_payload(uuid) to authenticated;
grant execute on function public.adjust_food_drop_stock(uuid, integer, text) to authenticated;
grant execute on function public.extend_food_drop_deadline(uuid, timestamptz) to authenticated;
grant execute on function public.cancel_food_drop(uuid) to authenticated;
grant execute on function public.expire_food_drops() to authenticated;
grant execute on function public.collect_food_drop(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-drop-photos',
  'food-drop-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists food_drop_photos_insert_own_folder on storage.objects;
create policy food_drop_photos_insert_own_folder on storage.objects
for insert to authenticated
with check (
  bucket_id = 'food-drop-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists food_drop_photos_update_own_folder on storage.objects;
create policy food_drop_photos_update_own_folder on storage.objects
for update to authenticated
using (
  bucket_id = 'food-drop-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'food-drop-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists food_drop_photos_delete_own_folder on storage.objects;
create policy food_drop_photos_delete_own_folder on storage.objects
for delete to authenticated
using (
  bucket_id = 'food-drop-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Realtime is used by Phase 3 for stock/status changes.
do $$
begin
  alter publication supabase_realtime add table public.food_drops;
exception when duplicate_object then null;
end $$;
