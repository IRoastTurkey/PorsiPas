import type { RealtimeChannel } from '@supabase/supabase-js';

import type {
  CollectFoodDropResult,
  CollectionService,
  CreateFoodDropInput,
  DietaryTag,
  FoodDrop,
  FoodDropHostService,
  FoodDropReadService,
  FoodDropSummary,
  UUID,
} from '@/domain/types';
import { requireSupabase } from '@/services/supabase/client';

type FoodDropRow = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  photo_url: string;
  initial_stock: number;
  remaining_stock: number;
  venue_name: string;
  building_code: string | null;
  latitude: number;
  longitude: number;
  pickup_instructions: string | null;
  pickup_deadline: string;
  dietary_tags: string[];
  allergen_note: string;
  status: FoodDrop['status'];
  created_at: string;
  updated_at: string;
};

const FOOD_DROP_COLUMNS = [
  'id',
  'host_id',
  'title',
  'description',
  'photo_url',
  'initial_stock',
  'remaining_stock',
  'venue_name',
  'building_code',
  'latitude',
  'longitude',
  'pickup_instructions',
  'pickup_deadline',
  'dietary_tags',
  'allergen_note',
  'status',
  'created_at',
  'updated_at',
].join(',');

export function mapFoodDrop(row: FoodDropRow): FoodDrop {
  return {
    id: row.id,
    hostId: row.host_id,
    title: row.title,
    description: row.description,
    photoUrl: row.photo_url,
    initialStock: row.initial_stock,
    remainingStock: row.remaining_stock,
    venueName: row.venue_name,
    buildingCode: row.building_code,
    latitude: row.latitude,
    longitude: row.longitude,
    pickupInstructions: row.pickup_instructions,
    pickupDeadline: row.pickup_deadline,
    dietaryTags: row.dietary_tags as DietaryTag[],
    allergenNote: row.allergen_note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function unwrapFoodDrop(data: unknown) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Supabase did not return a FoodDrop.');
  return mapFoodDrop(row as FoodDropRow);
}

function distanceMeters(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;
  const deltaLatitude = radians(second.latitude - first.latitude);
  const deltaLongitude = radians(second.longitude - first.longitude);
  const latitude1 = radians(first.latitude);
  const latitude2 = radians(second.latitude);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
}

async function uploadPhoto(localUri: string) {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error('You must be signed in.');

  const uriWithoutQuery = localUri.split('?')[0];
  const candidateExtension = uriWithoutQuery.split('.').pop()?.toLowerCase();
  const extension = ['jpg', 'jpeg', 'png', 'webp'].includes(candidateExtension ?? '')
    ? candidateExtension!
    : 'jpg';
  const contentType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  const path = `${userData.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const photoResponse = await fetch(localUri);
  const photoBytes = await photoResponse.arrayBuffer();
  const { error: uploadError } = await client.storage
    .from('food-drop-photos')
    .upload(path, photoBytes, { contentType, upsert: false });

  if (uploadError) throw uploadError;
  const { data } = client.storage.from('food-drop-photos').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export const foodDropReadService: FoodDropReadService = {
  async listActive({ origin } = {}) {
    const client = requireSupabase();
    await client.rpc('expire_food_drops');
    const { data, error } = await client
      .from('food_drops')
      .select(FOOD_DROP_COLUMNS)
      .eq('status', 'active')
      .gt('remaining_stock', 0)
      .gt('pickup_deadline', new Date().toISOString())
      .order('pickup_deadline', { ascending: true });
    if (error) throw error;

    return ((data ?? []) as unknown as FoodDropRow[])
      .map(mapFoodDrop)
      .map<FoodDropSummary>((drop) => ({
        id: drop.id,
        title: drop.title,
        photoUrl: drop.photoUrl,
        venueName: drop.venueName,
        latitude: drop.latitude,
        longitude: drop.longitude,
        remainingStock: drop.remainingStock,
        pickupDeadline: drop.pickupDeadline,
        dietaryTags: drop.dietaryTags,
        status: drop.status,
        distanceMeters: origin ? distanceMeters(origin, drop) : null,
      }))
      .sort((a, b) =>
        origin
          ? (a.distanceMeters ?? Number.POSITIVE_INFINITY) -
            (b.distanceMeters ?? Number.POSITIVE_INFINITY)
          : a.pickupDeadline.localeCompare(b.pickupDeadline),
      );
  },

  async getById(id) {
    const client = requireSupabase();
    await client.rpc('expire_food_drops');
    const { data, error } = await client
      .from('food_drops')
      .select(FOOD_DROP_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapFoodDrop(data as unknown as FoodDropRow) : null;
  },

  subscribeToFoodDrop(id, onChange) {
    const client = requireSupabase();
    let channel: RealtimeChannel | null = client
      .channel(`food-drop:${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'food_drops', filter: `id=eq.${id}` },
        (payload) => onChange(mapFoodDrop(payload.new as FoodDropRow)),
      )
      .subscribe();

    return () => {
      if (channel) void client.removeChannel(channel);
      channel = null;
    };
  },
};

export const foodDropHostService: FoodDropHostService = {
  async createDraft(input: CreateFoodDropInput) {
    const client = requireSupabase();
    const uploadedPhoto = await uploadPhoto(input.localPhotoUri);

    const { data, error } = await client.rpc('create_food_drop_draft', {
      p_title: input.title,
      p_description: input.description,
      p_photo_url: uploadedPhoto.publicUrl,
      p_initial_stock: input.initialStock,
      p_venue_name: input.venueName,
      p_building_code: input.buildingCode,
      p_latitude: input.latitude,
      p_longitude: input.longitude,
      p_pickup_instructions: input.pickupInstructions,
      p_pickup_deadline: input.pickupDeadline,
      p_dietary_tags: input.dietaryTags,
      p_allergen_note: input.allergenNote,
      p_confirms_unserved_surplus: input.confirmsUnservedSurplus,
    });

    if (error) {
      await client.storage.from('food-drop-photos').remove([uploadedPhoto.path]);
      throw error;
    }
    return unwrapFoodDrop(data);
  },

  async publish(id) {
    const { data, error } = await requireSupabase().rpc('publish_food_drop', { p_id: id });
    if (error) throw error;
    return unwrapFoodDrop(data);
  },

  async adjustStock(id, remainingStock, reason) {
    const { data, error } = await requireSupabase().rpc('adjust_food_drop_stock', {
      p_id: id,
      p_remaining_stock: remainingStock,
      p_reason: reason,
    });
    if (error) throw error;
    return unwrapFoodDrop(data);
  },

  async extendDeadline(id, pickupDeadline) {
    const { data, error } = await requireSupabase().rpc('extend_food_drop_deadline', {
      p_id: id,
      p_pickup_deadline: pickupDeadline,
    });
    if (error) throw error;
    return unwrapFoodDrop(data);
  },

  async cancel(id) {
    const { data, error } = await requireSupabase().rpc('cancel_food_drop', { p_id: id });
    if (error) throw error;
    return unwrapFoodDrop(data);
  },

  async getQrPayload(id) {
    const { data, error } = await requireSupabase().rpc('get_food_drop_qr_payload', {
      p_id: id,
    });
    if (error) throw error;
    return data as string;
  },
};

export async function listMyFoodDrops(): Promise<FoodDrop[]> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error('You must be signed in.');

  await client.rpc('expire_food_drops');
  const { data, error } = await client
    .from('food_drops')
    .select(FOOD_DROP_COLUMNS)
    .eq('host_id', userData.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as FoodDropRow[]).map(mapFoodDrop);
}

export const collectionService: CollectionService = {
  async collectByQrPayload(qrPayload): Promise<CollectFoodDropResult> {
    try {
      const { data, error } = await requireSupabase().rpc('collect_food_drop', {
        qr_payload: qrPayload,
      });
      if (error) throw error;
      const result = data as Record<string, unknown>;
      return {
        code: result.code as CollectFoodDropResult['code'],
        foodDropId: (result.food_drop_id as UUID | null) ?? null,
        collectionId: (result.collection_id as UUID | null) ?? null,
        remainingStock: (result.remaining_stock as number | null) ?? null,
        pointsAwarded: (result.points_awarded as number) ?? 0,
        currentStreak: (result.current_streak as number | null) ?? null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('network') || message.includes('fetch')) {
        return {
          code: 'offline',
          foodDropId: null,
          collectionId: null,
          remainingStock: null,
          pointsAwarded: 0,
          currentStreak: null,
        };
      }
      return {
        code: 'server_error',
        foodDropId: null,
        collectionId: null,
        remainingStock: null,
        pointsAwarded: 0,
        currentStreak: null,
      };
    }
  },
};
