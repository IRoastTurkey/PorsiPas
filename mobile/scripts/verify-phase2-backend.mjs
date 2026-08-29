import { createClient } from '@supabase/supabase-js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(resolve(scriptDirectory, '..', '.env'));

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) throw new Error('Configure mobile/.env before verifying the backend.');

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

async function createPublishedDrop(host, title, stock, deadlineOffsetMs = 10 * 60_000) {
  const { data: draft, error: draftError } = await host.rpc('create_food_drop_draft', {
    p_title: title,
    p_description: 'Automated Phase 2 backend verification artifact',
    p_photo_url: 'https://placehold.co/600x400/png?text=PorsiPas+Test',
    p_initial_stock: stock,
    p_venue_name: 'Automated test venue',
    p_building_code: 'TEST',
    p_latitude: 1.2966,
    p_longitude: 103.7764,
    p_pickup_instructions: 'No physical pickup — automated verification only',
    p_pickup_deadline: new Date(Date.now() + deadlineOffsetMs).toISOString(),
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
const host = await createUser(`Host ${suffix}`);
const rescuerOne = await createUser(`Rescuer A ${suffix}`);
const rescuerTwo = await createUser(`Rescuer B ${suffix}`);
const rescuerThree = await createUser(`Rescuer C ${suffix}`);

const unsigned = createTestClient();
const unsignedResult = await collect(unsigned, 'porsipas://collect?token=not-a-real-token');
assert(unsignedResult.code === 'unauthenticated', 'Unsigned caller did not receive unauthenticated.');

const invalidResult = await collect(rescuerOne, 'porsipas://collect?token=not-a-real-token');
assert(invalidResult.code === 'invalid_qr', 'Invalid QR did not receive invalid_qr.');

const stockDrop = await createPublishedDrop(host, `Atomic stock ${suffix}`, 2);
const stockQr = await qrFor(host, stockDrop.id);

const forbiddenQr = await rescuerOne.rpc('get_food_drop_qr_payload', { p_id: stockDrop.id });
assert(Boolean(forbiddenQr.error), 'A non-host could retrieve the host QR payload.');

const forbiddenUpdate = await rescuerOne
  .from('food_drops')
  .update({ remaining_stock: 99 })
  .eq('id', stockDrop.id);
assert(Boolean(forbiddenUpdate.error), 'A mobile client could directly update FoodDrop stock.');

const first = await collect(rescuerOne, stockQr);
assert(first.code === 'success' && first.remaining_stock === 1, 'First collection was not exactly -1.');
const duplicate = await collect(rescuerOne, stockQr);
assert(duplicate.code === 'duplicate_collection', 'Duplicate collection was not rejected.');
const second = await collect(rescuerTwo, stockQr);
assert(second.code === 'success' && second.remaining_stock === 0, 'Second collection did not deplete stock.');
const depleted = await collect(rescuerThree, stockQr);
assert(depleted.code === 'depleted', 'Depleted FoodDrop did not reject collection.');

const { data: depletedRow, error: depletedReadError } = await host
  .from('food_drops')
  .select('remaining_stock,status')
  .eq('id', stockDrop.id)
  .single();
if (depletedReadError) throw depletedReadError;
assert(depletedRow.remaining_stock === 0 && depletedRow.status === 'depleted', 'Stored depleted state is incorrect.');

const cancelledDrop = await createPublishedDrop(host, `Cancelled ${suffix}`, 1);
const cancelledQr = await qrFor(host, cancelledDrop.id);
const { error: cancelError } = await host.rpc('cancel_food_drop', { p_id: cancelledDrop.id });
if (cancelError) throw cancelError;
const cancelled = await collect(rescuerThree, cancelledQr);
assert(cancelled.code === 'cancelled', 'Cancelled FoodDrop did not reject collection.');

const expiringDrop = await createPublishedDrop(host, `Expired ${suffix}`, 1, 2_000);
const expiringQr = await qrFor(host, expiringDrop.id);
await new Promise((resolveWait) => setTimeout(resolveWait, 2_500));
const expired = await collect(rescuerThree, expiringQr);
assert(expired.code === 'expired', 'Expired FoodDrop did not reject collection.');

console.log('Phase 2 backend verification passed: 12/12 checks.');
console.log('Test FoodDrops are terminal and intentionally retained as audit evidence.');
