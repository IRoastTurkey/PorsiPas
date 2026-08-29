import type { RealtimeChannel } from '@supabase/supabase-js';

import type {
  AlertDelivery,
  AlertDeliveryService,
  CollectionRecord,
  RetentionService,
  SaveWatchZoneInput,
  UserProfile,
  WatchZone,
  WatchZoneService,
} from '@/domain/types';
import { requireSupabase } from '@/services/supabase/client';

type UserRow = {
  id: string;
  display_name: string | null;
  points_total: number;
  current_streak: number;
  last_qualified_rescue_at: string | null;
  created_at: string;
};

type WatchZoneRow = {
  id: string;
  user_id: string;
  center_latitude: number;
  center_longitude: number;
  radius_meters: number;
  label: string | null;
  expires_at: string | null;
  enabled: boolean;
  refreshed_at: string;
  created_at: string;
  updated_at: string;
};

type CollectionHistoryRow = {
  id: string;
  food_drop_id: string;
  user_id: string;
  title: string;
  venue_name: string;
  verified_at: string;
  quantity: number;
  points_awarded: number;
};

type AlertDeliveryRow = {
  id: string;
  food_drop_id: string;
  approximate_distance_meters: number;
  title_snapshot: string;
  venue_name_snapshot: string;
  remaining_stock_snapshot: number;
  pickup_deadline_snapshot: string;
  created_at: string;
  presented_at: string | null;
  opened_at: string | null;
};

const WATCH_ZONE_COLUMNS = [
  'id',
  'user_id',
  'center_latitude',
  'center_longitude',
  'radius_meters',
  'label',
  'expires_at',
  'enabled',
  'refreshed_at',
  'created_at',
  'updated_at',
].join(',');

const ALERT_COLUMNS = [
  'id',
  'food_drop_id',
  'approximate_distance_meters',
  'title_snapshot',
  'venue_name_snapshot',
  'remaining_stock_snapshot',
  'pickup_deadline_snapshot',
  'created_at',
  'presented_at',
  'opened_at',
].join(',');

function mapProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name ?? '',
    pointsTotal: row.points_total,
    currentStreak: row.current_streak,
    lastQualifiedRescueAt: row.last_qualified_rescue_at,
    createdAt: row.created_at,
  };
}

function mapWatchZone(row: WatchZoneRow): WatchZone {
  return {
    id: row.id,
    userId: row.user_id,
    centerLatitude: row.center_latitude,
    centerLongitude: row.center_longitude,
    radiusMeters: row.radius_meters,
    label: row.label,
    expiresAt: row.expires_at,
    enabled: row.enabled,
    refreshedAt: row.refreshed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCollection(row: CollectionHistoryRow): CollectionRecord {
  return {
    id: row.id,
    foodDropId: row.food_drop_id,
    userId: row.user_id,
    title: row.title,
    venueName: row.venue_name,
    verifiedAt: row.verified_at,
    quantity: 1,
    pointsAwarded: row.points_awarded,
  };
}

function mapAlert(row: AlertDeliveryRow): AlertDelivery {
  return {
    id: row.id,
    foodDropId: row.food_drop_id,
    approximateDistanceMeters: row.approximate_distance_meters,
    title: row.title_snapshot,
    venueName: row.venue_name_snapshot,
    remainingStock: row.remaining_stock_snapshot,
    pickupDeadline: row.pickup_deadline_snapshot,
    createdAt: row.created_at,
    presentedAt: row.presented_at,
    openedAt: row.opened_at,
  };
}

function unwrapRow<T>(data: unknown, message: string): T {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error(message);
  return row as T;
}

export const retentionService: RetentionService = {
  async getMyProfile() {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) throw authError ?? new Error('You must be signed in.');
    const { data, error } = await client
      .from('users')
      .select('id,display_name,points_total,current_streak,last_qualified_rescue_at,created_at')
      .eq('id', authData.user.id)
      .single();
    if (error) throw error;
    return mapProfile(data as UserRow);
  },

  async listMyCollections() {
    const { data, error } = await requireSupabase().rpc('list_my_collection_history', {
      p_limit: 50,
    });
    if (error) throw error;
    return ((data ?? []) as CollectionHistoryRow[]).map(mapCollection);
  },

  async getVerifiedImpact() {
    const { data, error } = await requireSupabase().rpc('get_verified_impact');
    if (error) throw error;
    const result = data as Record<string, unknown>;
    return {
      userMealsRescued: Number(result.user_meals_rescued ?? 0),
      totalMealsRescued: Number(result.total_meals_rescued ?? 0),
    };
  },
};

export const watchZoneService: WatchZoneService = {
  async getMine() {
    const { data, error } = await requireSupabase()
      .from('watch_zones')
      .select(WATCH_ZONE_COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return data ? mapWatchZone(data as unknown as WatchZoneRow) : null;
  },

  async saveMine(input: SaveWatchZoneInput) {
    const { data, error } = await requireSupabase().rpc('save_my_watch_zone', {
      p_center_latitude: input.centerLatitude,
      p_center_longitude: input.centerLongitude,
      p_radius_meters: input.radiusMeters,
      p_label: input.label,
      p_enabled: input.enabled,
    });
    if (error) throw error;
    return mapWatchZone(
      unwrapRow<WatchZoneRow>(data, 'Supabase did not return the saved watch zone.'),
    );
  },

  async disableMine() {
    const { error } = await requireSupabase().rpc('disable_my_watch_zone');
    if (error) throw error;
  },

  async deleteMine() {
    const { error } = await requireSupabase().rpc('delete_my_watch_zone');
    if (error) throw error;
  },
};

export const alertDeliveryService: AlertDeliveryService = {
  async listMine(limit = 20) {
    const { data, error } = await requireSupabase()
      .from('alert_deliveries')
      .select(ALERT_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 50));
    if (error) throw error;
    return ((data ?? []) as unknown as AlertDeliveryRow[]).map(mapAlert);
  },

  async markPresented(id) {
    const { error } = await requireSupabase().rpc('mark_my_alert_delivery', {
      p_id: id,
      p_event: 'presented',
    });
    if (error) throw error;
  },

  async markOpened(id) {
    const { error } = await requireSupabase().rpc('mark_my_alert_delivery', {
      p_id: id,
      p_event: 'opened',
    });
    if (error) throw error;
  },

  subscribe(onDelivery) {
    const client = requireSupabase();
    let channel: RealtimeChannel | null = client
      .channel('my-alert-deliveries')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alert_deliveries' },
        (payload) => onDelivery(mapAlert(payload.new as AlertDeliveryRow)),
      )
      .subscribe();

    return () => {
      if (channel) void client.removeChannel(channel);
      channel = null;
    };
  },
};
