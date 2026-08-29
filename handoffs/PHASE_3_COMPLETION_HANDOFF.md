---
document: PorsiPas Phase 3 Completion Handoff
version: 0.9.0
status: implementation_complete_pending_physical_validation
date: 2026-08-30
timezone: Asia/Singapore
phase: 3
objective: student_discovery_and_verified_collection
branch: phase/3-student-path
phase_2_base_commit: 69ecf72
phase_3_commits:
  - df98130
  - 2e636a9
  - b4453cc
  - PENDING_FINAL_PHASE_3_COMMIT
physical_validation: pending
---

# PorsiPas Phase 3 completion handoff

## Executive summary

Phase 3 implements the student discovery and verified collection path against Phase 2's production Supabase adapters. The normal application path no longer uses mock FoodDrops or a placeholder collection action. Discovery reads live active FoodDrops, optional foreground location enables nearest-first sorting, details fetch current state and subscribe to Realtime updates, and the camera scanner sends the complete raw QR value to the server-authoritative atomic collection operation.

Static checks and an Android production export pass. This document does **not** declare the phase fully accepted yet: the real shared-Supabase, physical-device, two-device matrix remains pending and must be completed before the pull request is presented as finished.

## Implemented scope

- Live list and map discovery through `foodDropReadService.listActive({ origin? })`.
- Active/loading/empty/backend-error discovery states.
- Optional foreground-only location request with default-campus fallback.
- Nearest-first sorting when a foreground-approved location is available.
- Textual low-stock and near-expiry indicators that do not rely only on colour.
- FoodDrop photo, title, venue, stock, Singapore deadline, time remaining, distance/fallback, and markers.
- Stable `/food-drop/[id]` student detail route with fresh fetch-by-ID.
- Detail Realtime subscription through `foodDropReadService.subscribeToFoodDrop` and cleanup on unmount or ID change.
- Understandable unavailable and terminal-state presentation with collection disabled.
- Expo Camera QR scanner with permission explanation, denial/settings recovery, cancellation, and one-request scan locking.
- Raw scanned QR payload forwarding to `collectionService.collectByQrPayload` without extracting or trusting a FoodDrop ID.
- Result handling for `success`, `invalid_qr`, `duplicate_collection`, `depleted`, `expired`, `cancelled`, `unauthenticated`, `offline`, and `server_error`.
- Authoritative remaining-stock display on success; no client-side stock mutation.
- Recoverable retry from invalid QR, offline, and server-error results.
- Discovery refresh whenever the Discover tab regains focus, including after detail/scanner navigation.
- Removed Phase 3 mock service, duplicate service contracts, and mock fixture data from the repository path.

## Deferred and non-goal scope

- Phase 4 points, streak, history, impact, alerts, notifications, and watch zones.
- Phase 5 decorative animation, PorsiPal, richer meteor art, and submission polish.
- Reservations, payments, delivery, ratings, leaderboards, Telegram integration, continuous background tracking, and food-image recognition.
- QR rotation and production host moderation.
- Phase 2 currently returns `pointsAwarded: 0` and `currentStreak: null`; Phase 3 does not invent rewards.

## Files and routes

Major Phase 3 files added or changed:

- `mobile/src/app/(tabs)/index.tsx` — live discovery list/map, refresh, location fallback, and state handling.
- `mobile/src/app/food-drop/[id].tsx` — fresh detail fetch, terminal state, distance, and Realtime subscription.
- `mobile/src/app/scan.tsx` — camera permission and locked QR submission flow.
- `mobile/src/app/rescue-result.tsx` — complete result-code presentation and retry/navigation actions.
- `mobile/src/app/_layout.tsx` — protected registration of Phase 3 routes while preserving Phase 2 auth gating.
- `mobile/src/components/discovery/food-drop-card.tsx` — stock, urgency, deadline, and distance presentation.
- `mobile/src/constants/food-drops.ts` — single low-stock, near-expiry, and default-campus configuration source.
- `mobile/src/services/location/foreground-location.ts` — in-memory foreground location and distance calculation.
- `mobile/src/features/collections/collection-result-store.ts` — transient handoff of the server result from scanner to result UI.
- `mobile/app.json` — camera and foreground-location permission explanations.

Routes owned by Phase 3:

- `/` — Discover tab.
- `/food-drop/[id]` — student FoodDrop detail and future Phase 4 notification target.
- `/scan` — QR scanner.
- `/rescue-result` — classified collection outcome.

## Dependencies

- `expo-location` — foreground-only location permission and approximate distance sorting.
- `expo-camera` — Expo SDK 54-compatible QR scanning.
- `react-native-maps` — Expo Go-compatible Android map and FoodDrop markers.

Phase 2 dependencies, including Supabase, AsyncStorage, image picker, QR display, SVG, and URL polyfill, were preserved during integration. Expo remains on SDK 54.

## Environment variables

Names only; values must remain in `mobile/.env` and must never be committed:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — supported by the Phase 2 client as a compatibility fallback.

No service-role key, database password, QR signing material, or private token belongs in the mobile environment.

## Production services and backend data consumed

Phase 3 imports the existing production adapters from `mobile/src/features/food-drops/food-drop-service.ts`:

```ts
foodDropReadService.listActive({ origin? })
foodDropReadService.getById(id)
foodDropReadService.subscribeToFoodDrop(id, onChange)
collectionService.collectByQrPayload(qrPayload)
```

Consumed Supabase resources:

- `public.food_drops` — authenticated read of collectible FoodDrop fields and Realtime updates.
- `public.collections` — written only inside the server function; users may read only their own records.
- `public.users` — authenticated identity/profile provided by Phase 2 auth.
- Private `private.food_drop_qr_secrets` — server-only; never queried by the mobile app.
- Public `food-drop-photos` Storage bucket — rendered through Phase 2-provided photo URLs.

Relevant Phase 2 RLS guarantees:

- Authenticated users can read active, unexpired, in-stock FoodDrops; hosts can also read their own rows.
- Users can read only their own profile and collection records.
- Mobile roles cannot directly insert/update FoodDrops or collections.
- QR secrets are not readable by mobile roles.
- Service-role credentials never enter the app.

## Atomic collection contract

Authoritative operation:

```text
collect_food_drop(qr_payload text)
```

Request sent by Phase 3:

```json
{
  "qr_payload": "the complete raw scanned QR value"
}
```

The scanner does not parse a FoodDrop ID, user ID, stock, quantity, points, or authorization data from the QR. The expected envelope is:

```text
porsipas://collect?token=<64-character-opaque-token>
```

Stable response mapping:

```json
{
  "code": "success | invalid_qr | duplicate_collection | depleted | expired | cancelled | unauthenticated | offline | server_error",
  "foodDropId": "uuid or null",
  "collectionId": "uuid or null",
  "remainingStock": "integer or null",
  "pointsAwarded": 0,
  "currentStreak": null
}
```

Result behaviour:

| Code | UI behaviour | Client stock change |
|---|---|---:|
| `success` | Verified rescue and authoritative remaining stock | None; server already committed exactly -1 |
| `invalid_qr` | Explain invalid PorsiPas QR and offer retry | None |
| `duplicate_collection` | Explain one-portion-per-user rule | None |
| `depleted` | Explain no portions remain | None |
| `expired` | Explain pickup deadline ended | None |
| `cancelled` | Explain host cancellation | None |
| `unauthenticated` | Explain identity recovery is required | None |
| `offline` | State that no success is claimed and offer retry | None |
| `server_error` | State verification failed and offer retry | None |

Only the `success` code produces successful-rescue copy.

## Scanner locking and privacy

- A `useRef` lock is set synchronously on the first decoded frame before awaiting the server.
- The barcode callback is removed while the collection request is pending.
- Cancellation is disabled while verification is pending.
- Invalid/offline/server-error result screens can return to a fresh scanner instance.
- The opaque QR token is not logged, displayed, persisted, or placed in route parameters.
- The result is passed through a transient in-memory store rather than trusted navigation parameters.

## Realtime behaviour

- Detail fetches persisted current state before subscribing.
- Subscription channel: `food-drop:<foodDropId>`.
- Source: `UPDATE` events on `public.food_drops`, filtered by ID.
- Incoming rows use the same Phase 2 adapter as ordinary reads.
- UI clamps displayed stock to zero or above and derives `depleted` when zero arrives.
- The unsubscribe function removes the Supabase channel on unmount or ID change.
- Discovery refetches when its tab regains focus so terminal drops disappear after navigation.
- Realtime terminal-row delivery under the deployed RLS policy must be confirmed in the two-device physical test matrix.

## Location and privacy behaviour

- Location is optional and requested only after the user taps **Use my location**.
- Only foreground permission is requested; no background task, geofence, movement trail, or persistent exact coordinate is created.
- The approved coordinate is held only in module memory and used locally for Haversine distance calculations.
- The exact rescuer coordinate is not sent to hosts or other students.
- If permission is denied, blocked, GPS-disabled, or unavailable, discovery continues with the default campus map/list and null distance.
- Blocked permission provides a direct system-settings recovery action.
- User-facing deadlines are formatted in `Asia/Singapore`.

## Automated verification

Executed on 2026-08-30 after integrating Phase 2 commit `69ecf72`:

| Check | Result | Evidence |
|---|---|---|
| `npm.cmd install` | Pass | Dependency tree installed; no forced audit fix applied |
| `npm.cmd run typecheck` | Pass | TypeScript strict check exited 0 |
| `npm.cmd run lint` | Pass | Expo lint exited 0 |
| `npm.cmd exec expo-doctor` | Pass | 18/18 checks passed |
| `npx.cmd expo export --platform android --output-dir dist` | Pass | Android Hermes bundle exported successfully |
| `git diff --check` | Pass | No whitespace errors; Windows line-ending notices only |

The SDK 54 dependency tree reports transitive npm advisories inherited from the hackathon toolchain. `npm audit fix --force` was not run because it proposes breaking upgrades.

## Physical-device and live-backend matrix

These results must be replaced with actual Pass/Fail evidence before Phase 3 is declared complete.

| Test | Status | Result notes |
|---|---|---|
| Host creates/publishes a real FoodDrop on device A | Deferred | Requires human-operated shared Supabase/device test |
| Rescuer sees it on device B | Deferred | Requires two devices or two isolated app identities |
| List and map render live stock/deadline | Deferred | Pending device test |
| Location granted sorts nearest-first | Deferred | Pending Android permission test |
| Location denied leaves fallback usable | Deferred | Pending Android permission test |
| Detail shows current live data | Deferred | Pending device test |
| Valid scan decrements exactly once | Deferred | Pending physical host QR test |
| Duplicate scan does not decrement | Deferred | Pending physical host QR test |
| Invalid QR is recoverable | Deferred | Pending physical scanner test |
| Expired/cancelled/depleted rejection | Deferred | Pending live backend test |
| Final stock cannot become negative | Deferred | Phase 2 automated backend test passed; two-device Phase 3 confirmation pending |
| Viewing client receives live stock/status | Deferred | Pending two-device Realtime test |
| Camera denial/settings recovery | Deferred | Pending Android permission test |
| Offline/backend failure never shows success | Deferred | Pending device network test |

## Acceptance checklist

| Criterion | Status |
|---|---|
| Production service replaces mock discovery | Pass |
| Stable detail route fetches by ID | Pass |
| Scanner calls production atomic collection service | Pass |
| All result codes have distinct UI copy | Pass |
| Mock adapters/fixtures removed from normal path | Pass |
| Automated checks and Android export pass | Pass |
| Complete real two-device rescue path | Deferred |
| Physical permission-denial tests | Deferred |
| Live Realtime terminal-state test | Deferred |
| Phase 3 may be declared complete | Deferred |

## Known limitations, debt, and integration risks

- Physical-device and two-device acceptance evidence is still missing.
- The shared Supabase project and anonymous authentication must be configured in `mobile/.env` before the live path can run.
- Phase 2 RLS intentionally hides non-collectible rows from ordinary rescuer reads. Realtime delivery when a visible row becomes terminal must be validated on the deployed project; if the zero-stock event is not delivered, this is an integration-policy gap requiring Phase 2/integration-owner review rather than a client-side stock workaround.
- The location origin is intentionally in-memory and resets when the app process restarts.
- Discovery refreshes on focus and manually; active-list-wide Realtime subscription was not added to avoid duplicate channels and unnecessary network traffic.
- Result state is transient in memory. Reloading `/rescue-result` directly shows **No recent scan result**, never false success.
- Phase 4 reward fields remain zero/null.

## Deviations from the integration contract

- No incompatible route, type, RPC, QR, schema, or error-code deviation was introduced.
- The default-campus fallback is used instead of a full manually selectable campus-zone picker; this is allowed by the Phase 3 fallback requirement.
- Active-list freshness uses focus/manual refetch while detail uses Realtime. This is within the contract's allowance that Phase 3 *may* subscribe to relevant active-list changes.

## Suggested review order

1. `mobile/src/app/(tabs)/index.tsx` and `mobile/src/services/location/foreground-location.ts`.
2. `mobile/src/app/food-drop/[id].tsx` and Realtime cleanup.
3. `mobile/src/app/scan.tsx` and the synchronous scan lock.
4. `mobile/src/features/food-drops/food-drop-service.ts` Phase 2 adapter contract.
5. `mobile/src/app/rescue-result.tsx` and complete result mapping.
6. `mobile/src/app/_layout.tsx` authentication/protected route preservation.
7. Device test evidence in this handoff.

## Rollback considerations

- Phase 3 client changes can be reverted without a database rollback; no new migration or RLS policy was added.
- Reverting scanner/result UI does not undo collections already committed by the server.
- Preserve Phase 2 commit `69ecf72`, migrations, authentication, host routes, Supabase client, and production adapters during any rollback.
- Dependency rollback must retain packages required by Phase 2 and keep Expo SDK 54 compatibility.

## Phase 4 and Phase 5 integration notes

- Phase 4 notification payloads should deep-link to `/food-drop/[id]`; the route always refetches current state.
- Phase 4 may extend the atomic transaction with points/streaks while preserving every existing response key and code.
- Phase 4 should not derive rewards from client navigation or QR data.
- Phase 5 may wrap result content with decorative feedback but must show celebration only for `success`.
- Phase 5 should not bypass permission, offline, terminal, or accessibility states.

## Exact next steps

1. Configure the real shared Supabase public environment values locally without committing them.
2. Start Expo on a physical Android device and complete onboarding.
3. Run the full physical-device matrix above, using two devices or two isolated authenticated identities where required.
4. Record Pass/Fail outcomes and concise evidence in this living handoff.
5. If terminal Realtime fails because of RLS visibility, stop and coordinate the exact policy/contract correction with the Phase 2/integration owner.
6. Review `git status`, `git diff`, and `git diff --check`.
7. Let the human operator inspect and approve the app.
8. Only after approval, create the final Phase 3 commit and push `phase/3-student-path`.
9. Open a pull request into `main`; do not merge it automatically.
