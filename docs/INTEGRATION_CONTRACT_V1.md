---
document_id: PORSIPAS-INTEGRATION-CONTRACT-V1
version: 1.0.0
status: active
approval_status: approved
created_at: 2026-08-29
timezone: Asia/Singapore
baseline_branch: main
baseline_commit: 46245fe
platform: Expo SDK 54
owners:
  integration: phase_2_owner
  host_backend: phase_2_owner
  student_path: phase_3_owner
  retention: phase_4_owner
  polish_submission: phase_5_owner
---

# PorsiPas V1 Integration Contract

## 1. Purpose

This document is the shared boundary between the four parallel PorsiPas workstreams. It exists so teammates can build against the same data shapes, routes, service methods, result codes, ownership rules, and security assumptions while upstream phases are incomplete.

This contract supplements `PorsiPasV1_HANDOFF.md`; it does not replace the product requirements. If the documents conflict, stop implementation, record the conflict, and resolve it through a reviewed contract update.

No teammate may describe a phase as complete until its upstream dependencies have been integrated and its end-to-end acceptance checks pass. Parallel branches may use mock adapters before that point.

## 2. Approval record

The repository owner approved every decision below on 2026-08-29. Shared implementation branches start from the commit that merges this active contract into `main`.

### 2.1 Approved implementation decisions

| ID | Decision | Proposed V1 contract | Status |
|---|---|---|---|
| C-001 | Map library | `react-native-maps`, installed through Expo for SDK 54; it works in Expo Go and avoids an immediate development-build requirement | Approved |
| C-002 | Points per scored rescue | 100 points, defined once in server-side configuration | Approved |
| C-003 | Points cap | Only the first verified rescue per user per Singapore calendar day awards points; every valid rescue still creates history and changes real stock | Approved |
| C-004 | Alert-radius defaults | Default 250 m; selectable from 50 m through 2,000 m | Approved |
| C-005 | Dietary tags | `halal`, `vegetarian`, `vegan`, `contains_pork`, and `unknown` | Approved |
| C-006 | Remote notification scope | Expo Go-compatible alert/watch-zone baseline first; closed-app remote push through a development build is a stretch goal | Approved |

### 2.2 Already confirmed product rules

- The app is standalone; there is no Telegram dependency.
- Every authenticated account may rescue food and host a FoodDrop.
- Authentication creates a stable anonymous device identity with a required non-empty display name.
- A FoodDrop requires a current food photo, positive integer stock, pickup location, future deadline, allergen information or `Unknown`, and an unserved-surplus confirmation.
- One successful QR scan represents one portion.
- A user may successfully collect from a given FoodDrop only once.
- Stock changes are server-authoritative, atomic, and never negative.
- The streak is weekly and uses `Asia/Singapore` calendar boundaries.
- Location refresh occurs only while the app is open and permission is granted.
- The server may match alerts against the last user-approved watch point; this is not live tracking.
- Exact student coordinates are never shown to another student or host.
- Push while the app is closed is desirable but is not a V1 release gate.
- V1 has no teams, leaderboard, reservations, delivery, payments, ratings, calorie analysis, or continuous background tracking.

## 3. Platform contract

| Concern | Contract |
|---|---|
| Client | React Native with Expo SDK 54 and TypeScript |
| Navigation | Expo Router file-based routes |
| Primary demo | Physical Android device |
| Quick client | Expo Go compatible unless a separately approved development build is created |
| Backend | Supabase Auth, Postgres, Storage, Realtime, and server-side database functions or Edge Functions where required |
| Time storage | UTC ISO timestamps or Postgres `timestamptz` |
| Time display/rules | `Asia/Singapore` |
| Coordinates | WGS84 decimal latitude and longitude |
| Distance | Integer metres in data/service contracts; UI may render metres or kilometres |
| IDs | UUID strings |
| Secrets | Server-only; never stored in `EXPO_PUBLIC_*`, source control, screenshots, logs, or handoffs |

Expo SDK 54 must not be upgraded during the hackathon without a reviewed contract change and a new physical-device compatibility plan.

## 4. Branches, merge order, and integration gates

### 4.1 Planned branches

| Workstream | Branch |
|---|---|
| Contract | `docs/v1-integration-contract` |
| Phase 2 | `phase/2-host-path` |
| Phase 3 | `phase/3-student-path` |
| Phase 4 | `phase/4-retention` |
| Phase 5 | `phase/5-polish-submission` |

### 4.2 Merge order

```text
Integration contract
  -> Phase 2 host/backend
  -> Phase 3 student path
  -> Phase 4 retention
  -> Phase 5 polish/submission
```

Work may happen in parallel, but pull requests merge in the order above. Before final integration, a downstream branch merges the newest `origin/main`, replaces mocks with real adapters, removes obsolete fixtures, and reruns its full checks.

Use merge-based synchronization for this learning-team workflow:

```powershell
git fetch origin
git merge origin/main
```

Do not force-push shared phase branches, commit directly to `main`, or silently rewrite another phase's contract.

## 5. File ownership and collision prevention

| Area | Primary owner | Parallel rule |
|---|---|---|
| `supabase/**` and backend migrations | Phase 2 | Other phases propose migrations in their handoff; Phase 2/integration owner reviews shared changes |
| Authentication and Supabase client | Phase 2 | Exactly one Supabase client and one authenticated-session provider |
| `mobile/src/app/create.tsx` and host routes | Phase 2 | No other phase edits without coordination |
| Discover, list, detail, map, and scanner routes | Phase 3 | Phase 5 supplies polish components rather than editing these screens during parallel work |
| `mobile/src/app/profile.tsx`, alerts, history, points, streak, and impact | Phase 4 | Phase 5 supplies isolated polish components |
| Polish components, visual assets, pitch, and demo documents | Phase 5 | Do not wire into active Phase 2-4 screens until their owners are ready |
| `mobile/package.json`, lockfile, and `mobile/app.json` | Integration owner | Teammates request dependencies; one owner applies compatible versions to reduce lockfile conflicts |
| `mobile/src/app/_layout.tsx` | Integration owner | Route files may be added independently; shared navigation changes are coordinated |
| `mobile/src/constants/theme.ts` | Integration owner | Phase 5 proposes additive tokens; one owner applies them |
| Shared generated database types | Phase 2/integration owner | Regenerate after migrations; do not hand-edit generated types |

If a task requires changing a file owned by another phase, notify that owner first and record the agreed change in the relevant working or completion handoff.

## 6. Shared source layout

The exact tree may evolve, but responsibilities must remain separated:

```text
mobile/src/
  app/                    Expo Router route components
  components/             Reusable presentation components
  constants/              Theme and shared configuration
  domain/                 Framework-independent types and rules
  features/
    auth/
    host/
    discovery/
    collections/
    alerts/
    retention/
    polish/
  services/
    supabase/
    location/
    notifications/
  test-fixtures/           Clearly labelled development fixtures
  types/                   Shared and generated TypeScript types

supabase/
  migrations/
  functions/               Only if server-side Edge Functions are required

docs/
handoffs/
```

Route components should compose features rather than contain database queries or large business rules.

## 7. Route contract

| Route | Owner | Purpose |
|---|---|---|
| `/` | Phase 3 | Discover active FoodDrops in map/list form |
| `/create` | Phase 2 | Create a FoodDrop |
| `/profile` | Phase 4 | Profile, preferences, points, streak, history, and impact |
| `/onboarding` | Phase 2 | Required display name and minimal account setup |
| `/food-drop/[id]` | Phase 3 | Student-facing FoodDrop detail; stable target for Phase 4 alert deep links |
| `/scan` | Phase 3 | QR scanner and verified-collection flow |
| `/host/food-drop/[id]` | Phase 2 | Host management for an existing FoodDrop |
| `/host/food-drop/[id]/qr` | Phase 2 | Full-screen host QR display |
| `/rescue-result` | Phase 3 | Collection success or classified failure; may be implemented as a modal |

Rules:

- Route parameters contain IDs or UI navigation context, never secrets, stock authority, or trusted point values.
- The detail route fetches current state by ID rather than trusting stale navigation data.
- Phase 4 notification payloads target `/food-drop/[id]`.
- The scanner forwards the scanned opaque/signed token to the collection service. It does not infer stock or collection validity.

## 8. Canonical domain types

Shared types live in one common domain/types location. Mocks, Supabase adapters, and UI code all implement these shapes.

```ts
export type ISODateTime = string;
export type UUID = string;

export type FoodDropStatus =
  | 'draft'
  | 'active'
  | 'depleted'
  | 'expired'
  | 'cancelled';

export type DietaryTag =
  | 'halal'
  | 'vegetarian'
  | 'vegan'
  | 'contains_pork'
  | 'unknown';

export type CollectionResultCode =
  | 'success'
  | 'invalid_qr'
  | 'duplicate_collection'
  | 'depleted'
  | 'expired'
  | 'cancelled'
  | 'unauthenticated'
  | 'offline'
  | 'server_error';

export interface UserProfile {
  id: UUID;
  displayName: string;
  pointsTotal: number;
  currentStreak: number;
  lastQualifiedRescueAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface FoodDrop {
  id: UUID;
  hostId: UUID;
  title: string;
  description: string | null;
  photoUrl: string;
  initialStock: number;
  remainingStock: number;
  venueName: string;
  buildingCode: string | null;
  latitude: number;
  longitude: number;
  pickupInstructions: string | null;
  pickupDeadline: ISODateTime;
  dietaryTags: DietaryTag[];
  allergenNote: string;
  status: FoodDropStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FoodDropSummary {
  id: UUID;
  title: string;
  photoUrl: string;
  venueName: string;
  latitude: number;
  longitude: number;
  remainingStock: number;
  pickupDeadline: ISODateTime;
  dietaryTags: DietaryTag[];
  status: FoodDropStatus;
  distanceMeters: number | null;
}

export interface CreateFoodDropInput {
  title: string;
  description: string | null;
  localPhotoUri: string;
  initialStock: number;
  venueName: string;
  buildingCode: string | null;
  latitude: number;
  longitude: number;
  pickupInstructions: string | null;
  pickupDeadline: ISODateTime;
  dietaryTags: DietaryTag[];
  allergenNote: string;
  confirmsUnservedSurplus: true;
}

export interface CollectionRecord {
  id: UUID;
  foodDropId: UUID;
  userId: UUID;
  verifiedAt: ISODateTime;
  quantity: 1;
  pointsAwarded: number;
}

export interface WatchZone {
  id: UUID;
  userId: UUID;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  label: string | null;
  expiresAt: ISODateTime | null;
  enabled: boolean;
}

export interface CollectFoodDropResult {
  code: CollectionResultCode;
  foodDropId: UUID | null;
  collectionId: UUID | null;
  remainingStock: number | null;
  pointsAwarded: number;
  currentStreak: number | null;
}
```

### 8.1 Type invariants

- `initialStock` is a positive integer.
- `remainingStock` is an integer from zero through `initialStock`.
- `quantity` is always `1` in V1.
- `photoUrl`, `title`, `venueName`, and `allergenNote` are non-empty for an Active FoodDrop.
- `pickupDeadline` must be in the future when publishing.
- `distanceMeters` is `null` when the user has not approved a location.
- Expected business failures use a `CollectionResultCode`; unexpected transport/programming failures use the service error boundary.

Database rows may use `snake_case`; the application domain uses `camelCase`. Conversion occurs in the Supabase adapter, not throughout UI components.

## 9. Service-interface contract

UI code depends on these interfaces rather than importing Supabase directly. Method names may receive minor ergonomic changes during team review, but their responsibilities must stay stable.

```ts
export interface AuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  ensureAnonymousSession(displayName: string): Promise<UserProfile>;
  updateDisplayName(displayName: string): Promise<UserProfile>;
}

export interface FoodDropReadService {
  listActive(options: {
    origin?: { latitude: number; longitude: number };
  }): Promise<FoodDropSummary[]>;
  getById(id: UUID): Promise<FoodDrop | null>;
  subscribeToFoodDrop(
    id: UUID,
    onChange: (foodDrop: FoodDrop) => void,
  ): () => void;
}

export interface FoodDropHostService {
  createDraft(input: CreateFoodDropInput): Promise<FoodDrop>;
  publish(id: UUID): Promise<FoodDrop>;
  adjustStock(id: UUID, remainingStock: number, reason: string): Promise<FoodDrop>;
  extendDeadline(id: UUID, pickupDeadline: ISODateTime): Promise<FoodDrop>;
  cancel(id: UUID): Promise<FoodDrop>;
  getQrPayload(id: UUID): Promise<string>;
}

export interface CollectionService {
  collectByQrPayload(qrPayload: string): Promise<CollectFoodDropResult>;
}

export interface WatchZoneService {
  getMine(): Promise<WatchZone | null>;
  saveMine(input: Omit<WatchZone, 'id' | 'userId'>): Promise<WatchZone>;
  disableMine(): Promise<void>;
  deleteMine(): Promise<void>;
}

export interface RetentionService {
  getMyProfile(): Promise<UserProfile>;
  listMyCollections(): Promise<CollectionRecord[]>;
  getVerifiedImpact(): Promise<{
    userMealsRescued: number;
    totalMealsRescued: number;
  }>;
}
```

Mock and Supabase implementations must be interchangeable at the interface boundary. Components must not use environment checks to choose individual mock values.

## 10. Backend ownership and data contract

### 10.1 Phase 2-owned foundation

Phase 2 owns the initial migrations and RLS for:

- `users`
- `food_drops`
- `collections`
- FoodDrop photo storage bucket and policies
- Host creation/management operations
- QR generation/display operation
- Atomic collection operation consumed by Phase 3

Phase 2 also owns the initial shared generated database types.

### 10.2 Phase 4-owned additions

Phase 4 may add reviewed migrations for:

- `points_ledger`
- `watch_zones`
- `device_push_tokens`, only if a development-build notification path is approved
- `alert_deliveries` or an equivalent idempotency record
- Server-side points and streak evolution of the collection transaction

Phase 4 must preserve the collection result contract in Section 12. If it changes implementation internals, Phase 3 UI must continue receiving the same result codes and fields.

### 10.3 Required database constraints

- `collections` has a unique constraint on `(food_drop_id, user_id)`.
- Stock is constrained to `remaining_stock >= 0` and `remaining_stock <= initial_stock`.
- `initial_stock > 0`.
- Collection quantity is `1` in V1.
- A points-ledger collection source is unique so one collection cannot award twice.
- Alert delivery is unique per `(user_id, food_drop_id, delivery_kind)` or an equivalent key.
- User-owned tables enforce ownership through `auth.uid()`-based RLS.

### 10.4 RLS minimums

- Authenticated users may read collectible FoodDrop fields.
- QR verification material is never exposed by the normal FoodDrop read query.
- A host may create and manage only their own FoodDrops.
- A user may read only their own collection history, watch zones, points events, and device tokens.
- Exact watch-zone coordinates are never readable by other application users.
- Aggregate verified-impact access must not expose another user's private history or location.
- Service-role credentials never enter the mobile app.

## 11. FoodDrop lifecycle contract

```text
draft -> active -> depleted
                -> expired
                -> cancelled
draft -> cancelled
```

- Only Active, unexpired FoodDrops with positive remaining stock are collectible.
- Reaching zero stock changes status to Depleted in the same transaction.
- Terminal states are Depleted, Expired, and Cancelled.
- Terminal FoodDrops are not reactivated in V1.
- The provisional low-stock threshold is three portions and must be defined once, not repeated across components.
- Active discovery queries must not depend solely on the client hiding invalid rows; backend operations revalidate current state.

## 12. QR and atomic collection contract

### 12.1 QR payload

The rendered QR contains an opaque or signed value in this envelope:

```text
porsipas://collect?token=<opaque-or-signed-token>
```

Rules:

- The token must not contain trusted stock, point values, user identity, or authorization claims supplied by the client.
- The raw QR payload is sent to the collection service.
- The client may validate the `porsipas://collect` envelope for user feedback, but only the server decides validity.
- The token generation and verification mechanism is Phase 2 backend-owned and must be documented in the Phase 2 completion handoff.
- Server signing/hashing secrets are never exposed to the client.

### 12.2 Stable server operation

Logical operation name:

```text
collect_food_drop(qr_payload text)
```

The authenticated user is derived from the server session. The client never sends a trusted `user_id`, stock value, quantity, points value, or current streak.

Stable logical response:

```json
{
  "code": "success",
  "food_drop_id": "uuid",
  "collection_id": "uuid",
  "remaining_stock": 7,
  "points_awarded": 0,
  "current_streak": null
}
```

Expected `code` values:

| Code | Meaning | Stock changes? |
|---|---|---:|
| `success` | Verified new collection | Exactly -1 |
| `invalid_qr` | Envelope/token invalid or unknown | No |
| `duplicate_collection` | This user already collected this FoodDrop | No |
| `depleted` | No portions remain | No |
| `expired` | Deadline passed | No |
| `cancelled` | Host cancelled the FoodDrop | No |
| `unauthenticated` | No stable authenticated user | No |
| `server_error` | Unexpected recoverable server failure | No committed partial mutation |

`offline` is a client service result produced when the server cannot be reached; it is not stored as a database result.

### 12.3 Transaction guarantees

One server transaction must:

1. Resolve and validate the QR token.
2. Resolve the authenticated user.
3. Lock or conditionally update the current FoodDrop row.
4. Validate Active status, deadline, stock, and duplicate collection.
5. Insert one collection.
6. Decrement stock by one.
7. Mark the FoodDrop Depleted if the result is zero.
8. Return the stable result.

Phase 4 may extend the same transaction to add an idempotent points event and update the weekly streak. Retrying a successful request must not create another collection, decrement, ledger event, or streak update.

## 13. Realtime contract

- Phase 3 subscribes to changes for the currently visible FoodDrop and may subscribe to relevant active-list changes.
- The authoritative event source is the persisted `food_drops` row.
- A subscription callback maps the new row through the same adapter used for ordinary queries.
- Every subscription returns an unsubscribe function and is cleaned up on unmount or ID change.
- UI code must tolerate duplicate, delayed, or out-of-order notifications by accepting only current persisted state.
- Realtime is a freshness enhancement; opening a detail screen still fetches current state.

## 14. Location and distance contract

- Device location is requested or refreshed only while the app is open.
- The app does not start background location tasks or continuous geofencing.
- A user may deny location and continue with a campus-zone/default-map/list fallback.
- Distance sorting uses the user's current foreground-approved point when available.
- Distance calculations output metres and document the chosen Haversine or database-geospatial implementation.
- A watch zone stores only the latest approved centre, radius, optional label, and enabled state.
- The saved watch point is not described as the user's current position.
- No public query or host screen exposes student location or watch-zone data.

## 15. Alerts contract

- Users explicitly opt in or out.
- Radius and watch point/campus zone persist per user.
- A new eligible Active FoodDrop creates at most one alert-delivery record per user.
- Terminal or out-of-stock FoodDrops do not generate alerts.
- Alert content includes title, approximate distance or campus zone, stock, and deadline.
- Alert payloads include `foodDropId` and route to `/food-drop/[id]`.
- Opening an alert refetches current FoodDrop state and may show a terminal state.
- Expo Go supports the baseline UI/local-notification demonstration; real closed-app remote push requires an explicitly approved development-build path.
- Notification delivery claims must distinguish implemented, simulated, and deferred behaviour.

## 16. Points, streak, history, and impact contract

### 16.1 Points

- Only verified collections may create ledger events.
- The client never supplies the awarded value.
- The configured award is stored in one server-owned location.
- A unique collection source makes point awards idempotent.
- Point caps affect rewards, not real FoodDrop stock or collection history.
- No team score or leaderboard exists.

### 16.2 Weekly streak

- First verified collection creates streak 1.
- Additional collections in the same Singapore calendar week do not increment it.
- First collection in the immediately following week increments it by one.
- Missing at least one full week resets the next qualifying collection to 1.
- The server clock and `Asia/Singapore` calendar boundaries are authoritative.
- A duplicate/failed scan never changes the streak.

### 16.3 History and impact

- A user's rescue history is derived from verified `collections` and visible only to that user.
- One verified collection of quantity one equals one measured meal rescued.
- User and prototype totals count verified collections, not self-reported intent.
- Carbon, weight, nutrition, or money estimates are excluded unless assumptions and formulas are disclosed.

## 17. Mock-adapter rules for parallel work

Phase 3 and Phase 4 may work before upstream implementation is merged only when all of these are true:

- Their components depend on the interfaces in Section 9.
- Fixtures use the canonical types in Section 8.
- Mock files live under `test-fixtures` or use an unmistakable `mock` name.
- Mocks are selected at one composition/provider boundary, not throughout UI components.
- Mock data is visibly identified during team demos.
- No mock is described as live backend behaviour.
- Completion waits until the real adapter replaces the mock and acceptance checks pass.
- Obsolete fixtures are removed or explicitly retained for development/testing.

Mock collection behaviour must return the same result union as the real collection service; it must never become the production stock authority.

## 18. Dependency requests

Expected Phase 3 requests, subject to the approved map decision:

- `expo-location`
- `expo-camera`
- `react-native-maps`

Expected Phase 4 request for local notifications or a development build:

- `expo-notifications`

Only the integration owner modifies shared package/configuration files during the initial parallel sprint. Packages are installed with Expo's SDK-compatible installer and verified with Expo Doctor. Do not install `expo-maps` for the Expo Go path because it requires a development build and is currently alpha in SDK 54.

## 19. Environment and secret names

Mobile-public configuration currently permits only:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Additional public names require contract review. The Supabase anonymous key is public-client configuration, but RLS remains mandatory.

Server-only signing keys, service-role keys, push credentials, and provider secrets must be configured outside the mobile bundle. Handoffs record their variable names and setup location, never their values.

## 20. Error and UI-state contract

Every network-backed screen supports:

- Initial loading
- Empty result
- Recoverable offline/backend failure
- Permission denied, where relevant
- Current data
- Stale or terminal FoodDrop state

Essential information never relies only on colour. Controls have readable labels, reasonable touch targets, and clear disabled states.

Phase 5 may improve presentation, but Phase 2-4 owners remain responsible for functional error recovery in their flows.

## 21. Verification gates

Every phase runs the repository's current checks before requesting review:

```powershell
cd mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd run lint
npm.cmd exec expo-doctor
```

Each phase also documents:

- Relevant automated or database tests
- Android bundle/build result
- Physical-device smoke test
- Accounts/devices used without exposing identifiers
- Acceptance criteria status
- Any simulated or deferred behaviour

Do not run `npm audit fix --force`, suppress compatibility errors, or expose environment values in logs.

## 22. Phase completion handoffs

Each phase branch contains exactly one living completion document:

```text
handoffs/PHASE_2_COMPLETION_HANDOFF.md
handoffs/PHASE_3_COMPLETION_HANDOFF.md
handoffs/PHASE_4_COMPLETION_HANDOFF.md
handoffs/PHASE_5_COMPLETION_HANDOFF.md
```

Each completion handoff includes:

- Base and final commits
- Implemented and deferred scope
- Files, dependencies, migrations, and routes
- Consumed and exposed service contracts
- Setup and reproduction commands
- Automated and physical-device test evidence
- Acceptance checklist
- Security/privacy notes
- Known bugs and integration risks
- Mock/real status
- Deviations from this contract or the product handoff
- Review order, rollback notes, and exact next steps

No phase is merged merely because its UI looks complete. The completion handoff and integration behaviour are part of the definition of done.

## 23. Contract change process

Any incompatible change to a type, route, RPC, result code, ownership boundary, or security rule requires:

1. A proposed edit to this document.
2. Notification to all affected phase owners.
3. A version increment.
4. A short migration/compatibility note.
5. Review before dependent code changes merge.

Additive optional fields may be introduced compatibly when older consumers remain valid. Removing or renaming a field/result code is a breaking contract change.

## 24. Team approval checklist

Approved on 2026-08-29:

- [x] Map library approved
- [x] Points value approved
- [x] Points cap approved
- [x] Alert-radius defaults approved
- [x] Dietary tags approved
- [x] Notification baseline/stretch boundary approved
- [x] Branch names approved
- [x] File ownership approved
- [x] Route contract approved
- [x] QR envelope and collection result contract approved
- [x] Phase 2 owns the atomic collection backend
- [x] Phase 3 uses service interfaces and replaces mocks before completion
- [x] Phase 4 does not claim Expo Go remote push
- [x] Phase 5 avoids editing active Phase 2-4 screens during parallel work

## 25. Official implementation references

- Expo SDK 54: `https://docs.expo.dev/versions/v54.0.0/`
- Expo Router: `https://docs.expo.dev/versions/v54.0.0/sdk/router/`
- Expo Go-compatible `react-native-maps`: `https://docs.expo.dev/versions/latest/sdk/map-view/`
- Expo notifications and development-build limitation: `https://docs.expo.dev/versions/v54.0.0/sdk/notifications/`

Check current official SDK 54 documentation before installing native packages. Package-version changes remain integration-owner changes.

## 26. Changelog

| Version | Date | Status | Change |
|---|---|---|---|
| 1.0.0 | 2026-08-29 | Active | Approved all six implementation defaults and activated the parallel-development contract |
| 0.1.0-draft | 2026-08-29 | Proposed | Initial parallel-development contract derived from PorsiPas V1 handoff 1.1 and Phase 1 baseline |
