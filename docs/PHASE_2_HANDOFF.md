---
document: PorsiPas Phase 2 Handoff
contract: INTEGRATION_CONTRACT_V1.md
contract_version: 1.0.0
branch: phase/2-host-path
owner: Phase 2 host/backend team
status: implementation_complete_pending_live_supabase_validation
updated: 2026-08-29
---

# PorsiPas Phase 2 — Host and backend handoff

This is the human-readable and machine-readable handoff for Phase 2. It records what the branch provides, the stable boundaries other phases consume, setup steps, validation evidence, and remaining integration work. The shared contract remains authoritative if wording here conflicts with it.

## Outcome

Phase 2 turns the Phase 1 shell into a real host workflow backed by Supabase:

1. A fresh installation creates and persists an anonymous Supabase session.
2. The user must set a 2–40 character display name before entering the app.
3. Any signed-in user can host and rescue; there is no separate caterer role.
4. A host can photograph surplus food, enter stock and safety details, place a pickup pin, choose a short deadline, and publish.
5. Published FoodDrops have an opaque server-generated QR token.
6. The host can display the QR full-screen, correct physical stock, extend the deadline, or cancel the FoodDrop.
7. The backend exposes the atomic collection operation required by Phase 3.
8. Supabase Realtime is enabled for FoodDrop stock and status updates.

## Source map and ownership

| Path | Responsibility |
|---|---|
| `mobile/src/domain/types.ts` | Canonical camelCase domain and service interfaces from the integration contract |
| `mobile/src/services/supabase/client.ts` | Single persistent Supabase client; no service-role secret |
| `mobile/src/features/auth/*` | Anonymous bootstrap, profile loading, required display-name onboarding |
| `mobile/src/features/food-drops/food-drop-service.ts` | Supabase adapters for read, host, QR, collection, photo upload, and host listing |
| `mobile/src/app/(tabs)/create.tsx` | Create/publish flow and links to the host’s live FoodDrops |
| `mobile/src/app/host/food-drop/[id].tsx` | Host management screen |
| `mobile/src/app/host/food-drop/[id]/qr.tsx` | Full-screen host QR display |
| `supabase/migrations/202608290001_phase2_foundation.sql` | Schema, constraints, RLS, storage policies, RPCs, QR verification, and Realtime registration |
| `supabase/migrations/202608290002_phase2_collection_anon_result.sql` | Allows a signed-out scanner to receive the stable `unauthenticated` result without permitting a mutation |
| `mobile/scripts/verify-phase2-backend.mjs` | Live backend acceptance test with isolated anonymous users and terminal test drops |

Phase 3 owns the Discover, student detail, and scan screens. Phase 4 owns profile/retention and may extend the collection transaction without changing its response. Phase 5 owns isolated polish and submission work. Resolve overlapping root-navigation changes during ordered integration.

## Stable application interfaces

Other phases import from `mobile/src/domain/types.ts` and use the exported adapters in `mobile/src/features/food-drops/food-drop-service.ts`.

```ts
foodDropReadService.listActive({ origin? })
foodDropReadService.getById(id)
foodDropReadService.subscribeToFoodDrop(id, onChange)

foodDropHostService.createDraft(input)
foodDropHostService.publish(id)
foodDropHostService.adjustStock(id, remainingStock, reason)
foodDropHostService.extendDeadline(id, pickupDeadline)
foodDropHostService.cancel(id)
foodDropHostService.getQrPayload(id)

collectionService.collectByQrPayload(qrPayload)
```

The scanner passes the entire raw payload to `collectionService`; it must never extract a FoodDrop ID and modify stock itself.

## Database contract

Phase 2 creates:

- `public.users`
- `public.food_drops`
- `public.collections`
- `public.food_drop_audit`
- private `private.food_drop_qr_secrets`
- public Storage bucket `food-drop-photos`

Important constraints:

- Stock is a positive initial integer and remaining stock stays from zero through initial stock.
- `(food_drop_id, user_id)` is unique in `collections`.
- Collection quantity is always one.
- Hosts cannot reactivate terminal FoodDrops.
- Authenticated users see active, unexpired, in-stock FoodDrops and hosts also see their own records.
- Users see only their own profile and collection records.
- Mobile clients cannot directly insert or update FoodDrops or collections; reviewed server functions perform mutations.
- Raw QR tokens and token hashes live in an RLS-enabled private-schema table with no client policies and cannot be selected by the mobile roles.

## Server operations

| Operation | Caller | Result |
|---|---|---|
| `set_display_name` | Current user | Updated user row |
| `create_food_drop_draft` | Current user | Owned draft row |
| `publish_food_drop` | Host | Active row and new QR secret |
| `get_food_drop_qr_payload` | Host | `porsipas://collect?token=<opaque-token>` |
| `adjust_food_drop_stock` | Host | Updated row and audit record |
| `extend_food_drop_deadline` | Host | Updated row and audit record |
| `cancel_food_drop` | Host | Cancelled row and audit record |
| `expire_food_drops` | Authenticated app | Count of newly expired rows |
| `collect_food_drop` | Rescuer | Stable collection result object |

## QR and atomic collection design

Publishing generates 32 cryptographically random bytes server-side and encodes them as a 64-character opaque token. The rendered envelope is:

```text
porsipas://collect?token=<64-character-opaque-token>
```

The private table stores the raw token for host QR retrieval and a SHA-256 digest for lookup. Normal FoodDrop queries expose neither. In a single database transaction, `collect_food_drop`:

1. derives the user from `auth.uid()`;
2. validates the envelope and hashed token;
3. locks the FoodDrop row;
4. checks status, deadline, stock, and prior collection;
5. inserts one unique collection;
6. subtracts exactly one portion;
7. marks zero stock as `depleted`; and
8. returns the contract response.

Expected response codes are `success`, `invalid_qr`, `duplicate_collection`, `depleted`, `expired`, `cancelled`, `unauthenticated`, and `server_error`. The client adapter produces `offline` for transport failure. Phase 2 returns zero points and a null streak so Phase 4 can safely add idempotent scoring later.

The `collect_food_drop` operation is executable by the `anon` role only so a signed-out client can receive `unauthenticated`. Its first branch returns without mutation when `auth.uid()` is null; every mutation remains authenticated and server-derived.

V1 accepts that a photographed QR can be shared. Authentication, single collection per user/drop, and the deadline limit replay damage. Rotating QR codes are explicitly deferred.

## One-time Supabase setup

Do not paste credentials into chat or commit them.

1. Create or select the team Supabase project.
2. Enable anonymous sign-ins in Supabase Authentication settings.
3. Open the Supabase SQL editor, paste the complete migration file, and run it once. Alternatively, a linked Supabase CLI project may run `supabase db push`.
4. In `mobile/`, copy `.env.example` to `.env`.
5. Put the project URL and public anonymous/publishable key in `.env`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

6. Restart Expo with its cache cleared after changing environment values.
7. Never put a service-role key in `mobile/.env`; all `EXPO_PUBLIC_*` values are bundled into the app.

## Validation checklist

Static checks on the implementation branch:

- [x] TypeScript strict check
- [x] Expo lint
- [x] Expo Doctor (18/18 checks passed)
- [x] Android production bundle (Hermes bundle exported successfully)
- [x] Production dependency audit reviewed; no forced breaking upgrade applied
- [x] Foundation migration executed against the team Supabase project
- [x] Anonymous auth enabled and onboarding verified on Android
- [x] Photo selection/upload verified on Android
- [x] Host create, publish, manage, QR, stock correction, deadline extension, and cancellation verified on Android
- [x] Automated live backend verification passed (12/12 checks)
- [ ] Current-location and manual-pin flows verified
- [ ] Two-device create/discover flow verified after Phase 3 integration
- [x] Valid, duplicate, depleted, expired, cancelled, invalid, and unauthenticated QR cases verified

## Integration instructions

1. Merge Phase 2 before Phase 3, then Phase 4, then Phase 5.
2. Preserve Phase 3’s Discover/detail/scan screens when resolving route-group changes.
3. Phase 3 should replace its mock adapter with the exported `foodDropReadService` and `collectionService`, not import Supabase in UI files.
4. Phase 4 may add tables and extend `collect_food_drop`, but must preserve its name, arguments, response keys, result codes, uniqueness, and atomic stock behavior.
5. Regenerate Supabase database types after all migrations are integrated and replace untyped adapter row assertions in one integration-owned change.
6. Retest root protected navigation after merging any `_layout.tsx` changes.

## Machine-readable summary

```json
{
  "phase": 2,
  "branch": "phase/2-host-path",
  "contractVersion": "1.0.0",
  "status": "implementation_complete_pending_live_supabase_validation",
  "routesOwned": ["/create", "/onboarding", "/host/food-drop/[id]", "/host/food-drop/[id]/qr"],
  "tablesCreated": ["users", "food_drops", "collections", "food_drop_audit"],
  "privateTablesCreated": ["food_drop_qr_secrets"],
  "storageBucketsCreated": ["food-drop-photos"],
  "stableRpc": {
    "name": "collect_food_drop",
    "arguments": ["qr_payload"],
    "resultKeys": ["code", "food_drop_id", "collection_id", "remaining_stock", "points_awarded", "current_streak"]
  },
  "pointsOwner": "phase-4",
  "safeMergeOrder": [2, 3, 4, 5],
  "requiresHumanSetup": ["create_supabase_project", "enable_anonymous_auth", "run_migration", "create_mobile_env", "android_device_validation"]
}
```

## Known limitations

- Live Supabase validation cannot occur until the team project is configured.
- Expiry is enforced on every active listing request, host fetch, management action, and collection attempt. A production deployment should additionally schedule `expire_food_drops()` so the stored status changes even during periods with no app traffic.
- The photo bucket is public because rescuers must render listing photos; hosts can upload/update/delete only inside their own user-ID folder.
- Anonymous sessions are device-local. Clearing app data creates a new identity in V1.
- The SDK 54 dependency tree currently reports transitive npm advisories in Expo/Metro build tooling. npm's suggested automatic fix is a breaking jump to Expo 57, so the team intentionally preserves the Expo Go-compatible SDK during the hackathon and should upgrade/test after submission.
- QR rotation, host verification, moderation, and production abuse controls are outside the hackathon MVP.
