import { createClient } from '@supabase/supabase-js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(resolve(scriptDirectory, '..', '.env'));

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) throw new Error('Configure mobile/.env before verifying Phase 4.');

const createTestClient = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createUser(label) {
  const client = createTestClient();
  const { error: authError } = await client.auth.signInAnonymously();
  if (authError) throw authError;
  const { error: profileError } = await client.rpc('set_display_name', {
    p_display_name: label,
  });
  if (profileError) throw profileError;
  return client;
}

async function createPublishedDrop(host, { title, stock = 1, latitude, longitude }) {
  const { data: draft, error: draftError } = await host.rpc('create_food_drop_draft', {
    p_title: title,
    p_description: 'Automated Phase 4 backend verification artifact',
    p_photo_url: 'https://placehold.co/600x400/png?text=PorsiPas+Phase+4',
    p_initial_stock: stock,
    p_venue_name: 'Automated test venue',
    p_building_code: 'TEST',
    p_latitude: latitude,
    p_longitude: longitude,
    p_pickup_instructions: 'No physical pickup — automated verification only',
    p_pickup_deadline: new Date(Date.now() + 20 * 60_000).toISOString(),
    p_dietary_tags: ['unknown'],
    p_allergen_note: 'Unknown — automated test only',
    p_confirms_unserved_surplus: true,
  });
  if (draftError) throw draftError;
  const draftRow = Array.isArray(draft) ? draft[0] : draft;
  const { data: published, error: publishError } = await host.rpc('publish_food_drop', {
    p_id: draftRow.id,
  });
  if (publishError) throw publishError;
  return Array.isArray(published) ? published[0] : published;
}

async function qrFor(host, id) {
  const { data, error } = await host.rpc('get_food_drop_qr_payload', { p_id: id });
  if (error) throw error;
  return data;
}

async function collect(client, payload) {
  const { data, error } = await client.rpc('collect_food_drop', { qr_payload: payload });
  if (error) throw error;
  return data;
}

const suffix = Date.now().toString(36);
const latitude = 1.2966;
const longitude = 103.7764;
const host = await createUser(`P4 Host ${suffix}`);
const rescuer = await createUser(`P4 Rescuer ${suffix}`);

const { data: zoneData, error: zoneError } = await rescuer.rpc('save_my_watch_zone', {
  p_center_latitude: latitude,
  p_center_longitude: longitude,
  p_radius_meters: 250,
  p_label: 'Phase 4 test centre',
  p_enabled: true,
});
if (zoneError) throw zoneError;
const zone = Array.isArray(zoneData) ? zoneData[0] : zoneData;
assert(zone.radius_meters === 250 && zone.enabled, 'Watch zone did not persist.');

const { data: hostZones, error: hostZonesError } = await host.from('watch_zones').select('id');
if (hostZonesError) throw hostZonesError;
assert(hostZones.length === 0, 'Another user could read the rescuer watch zone.');

const nearOne = await createPublishedDrop(host, {
  title: `P4 nearby one ${suffix}`,
  stock: 2,
  latitude,
  longitude,
});
const { data: firstAlerts, error: firstAlertsError } = await rescuer
  .from('alert_deliveries')
  .select('*')
  .eq('food_drop_id', nearOne.id);
if (firstAlertsError) throw firstAlertsError;
assert(firstAlerts.length === 1, 'Nearby publish did not create exactly one alert delivery.');

const farDrop = await createPublishedDrop(host, {
  title: `P4 distant ${suffix}`,
  latitude: latitude + 0.03,
  longitude,
});
const { data: farAlerts, error: farAlertsError } = await rescuer
  .from('alert_deliveries')
  .select('id')
  .eq('food_drop_id', farDrop.id);
if (farAlertsError) throw farAlertsError;
assert(farAlerts.length === 0, 'Out-of-radius FoodDrop created an alert delivery.');

const firstQr = await qrFor(host, nearOne.id);
const firstCollection = await collect(rescuer, firstQr);
assert(
  firstCollection.code === 'success' && firstCollection.points_awarded === 100,
  'First daily rescue did not award 100 points.',
);
assert(firstCollection.current_streak === 1, 'First verified rescue did not establish streak 1.');
const duplicate = await collect(rescuer, firstQr);
assert(
  duplicate.code === 'duplicate_collection' && duplicate.points_awarded === 0,
  'Duplicate collection changed points or was not rejected.',
);

const nearTwo = await createPublishedDrop(host, {
  title: `P4 nearby two ${suffix}`,
  latitude,
  longitude,
});
const secondQr = await qrFor(host, nearTwo.id);
const secondCollection = await collect(rescuer, secondQr);
assert(secondCollection.code === 'success', 'Second valid collection failed.');
assert(secondCollection.points_awarded === 0, 'Second same-day rescue incorrectly awarded points.');
assert(secondCollection.current_streak === 1, 'Second same-week rescue changed the streak.');

const { data: profile, error: profileError } = await rescuer
  .from('users')
  .select('points_total,current_streak,last_qualified_rescue_at')
  .single();
if (profileError) throw profileError;
assert(profile.points_total === 100, 'Profile point total does not match the ledger.');
assert(profile.current_streak === 1, 'Stored weekly streak is incorrect.');
assert(Boolean(profile.last_qualified_rescue_at), 'Latest qualifying rescue time was not stored.');

const { data: ledger, error: ledgerError } = await rescuer.from('points_ledger').select('*');
if (ledgerError) throw ledgerError;
assert(ledger.length === 1 && ledger[0].points === 100, 'Points ledger is not idempotent.');

const { data: history, error: historyError } = await rescuer.rpc('list_my_collection_history', {
  p_limit: 50,
});
if (historyError) throw historyError;
assert(history.length === 2, 'Private rescue history does not contain both collections.');
assert(history.every((item) => item.user_id === zone.user_id), 'History exposed another user.');

const { data: impact, error: impactError } = await rescuer.rpc('get_verified_impact');
if (impactError) throw impactError;
assert(impact.user_meals_rescued === 2, 'Personal verified impact is incorrect.');
assert(impact.total_meals_rescued >= 2, 'Prototype verified impact is incorrect.');

const { error: disableError } = await rescuer.rpc('disable_my_watch_zone');
if (disableError) throw disableError;
const { data: disabledZone, error: disabledReadError } = await rescuer
  .from('watch_zones')
  .select('enabled')
  .single();
if (disabledReadError) throw disabledReadError;
assert(disabledZone.enabled === false, 'Watch zone did not disable.');

const { error: deleteError } = await rescuer.rpc('delete_my_watch_zone');
if (deleteError) throw deleteError;
const { data: deletedZones, error: deletedReadError } = await rescuer
  .from('watch_zones')
  .select('id');
if (deletedReadError) throw deletedReadError;
assert(deletedZones.length === 0, 'Watch zone did not delete.');

const { error: cancelFarError } = await host.rpc('cancel_food_drop', { p_id: farDrop.id });
if (cancelFarError) throw cancelFarError;
const { error: cancelNearError } = await host.rpc('cancel_food_drop', { p_id: nearOne.id });
if (cancelNearError) throw cancelNearError;

console.log('Phase 4 backend verification passed: 15/15 behavioural groups.');
console.log('The script created two terminal rescue records and retained them as audit evidence.');
