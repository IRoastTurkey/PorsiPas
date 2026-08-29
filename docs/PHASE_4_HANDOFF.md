---
document: PorsiPas Phase 4 Handoff
contract: INTEGRATION_CONTRACT_V1.md
contract_version: 1.0.0
branch: phase/4-retention
owner: Phase 4 retention team
status: implementation_complete_and_device_validated
updated: 2026-08-30
---

# PorsiPas Phase 4 — Retention and alerts handoff

This is the human-readable and machine-readable completion handoff for Phase 4. It records the delivered retention features, stable integration boundaries, privacy rules, validation evidence, and the remaining Phase 3 integration step. The shared V1 integration contract remains authoritative if wording here conflicts with it.

## Outcome

Phase 4 replaces the earlier retention mock with a live Supabase-backed experience:

1. A user can view their total points, weekly rescue streak, rescue history, and impact summary.
2. The first verified rescue per Singapore calendar day awards 100 points. Further valid rescues that day still reduce stock and appear in history but award zero additional points.
3. Weekly streaks advance across consecutive Monday–Sunday weeks in `Asia/Singapore` and remain idempotent when collection requests are retried.
4. A user can save one private watch zone using an explicitly approved foreground location or the NUS campus demo fallback.
5. The alert radius is user-selectable from 50 m to 2 km and can be disabled, re-enabled, or deleted.
6. Creating a qualifying active FoodDrop creates a private alert delivery for each matching watch zone.
7. While the Expo Go application is running, the alert provider receives the delivery through Supabase Realtime and presents a local notification.
8. There is no continuous or background location tracking.

## Source map and ownership

| Path | Responsibility |
|---|---|
| `mobile/src/app/(tabs)/profile.tsx` | Live retention profile, watch-zone controls, alert inbox, history, points, streak, and impact UI |
| `mobile/src/app/_layout.tsx` | Installs the alert provider inside the authenticated application shell |
| `mobile/src/domain/types.ts` | Phase 4 domain and service contracts added to the shared types |
| `mobile/src/features/retention/retention-service.ts` | Supabase adapters for retention summaries, history, watch zones, and alert deliveries |
| `mobile/src/features/alerts/alert-provider.tsx` | Realtime subscription, stale-state recheck, local notification delivery, and deep-link handling |
| `mobile/src/features/alerts/notification-service.ts` | Expo notification permissions, Android channel, content, and response helpers |
| `mobile/src/services/location/foreground-location.ts` | Foreground-only approved location helper and NUS demo fallback |
| `supabase/migrations/202608300001_phase4_retention.sql` | Points ledger, watch zones, alert deliveries, policies, RPCs, matching trigger, and atomic scoring/streak extension |
| `mobile/scripts/verify-phase4-backend.mjs` | Repeatable live backend behavioural verification |

The former mock-only retention adapter and mock domain file were removed. UI screens consume services rather than importing Supabase directly.

## Database additions

Phase 4 creates:

- `public.points_ledger`
- `public.watch_zones`
- `public.alert_deliveries`

The migration also adds reviewed functions for saving, disabling, and deleting the current user's watch zone; reading the current user's rescue history and impact; marking alert delivery state; matching FoodDrops against watch zones; and extending the Phase 2 `collect_food_drop` transaction with points and weekly streak updates.

Important guarantees:

- A collection can create at most one points-ledger entry.
- Only the first verified rescue per user per Singapore day receives 100 points.
- Duplicate, failed, expired, cancelled, depleted, and invalid scans never award points or change the streak.
- Every valid rescue still creates history and reduces stock, including zero-point rescues later in the same day.
- Exact watch-zone coordinates and alert deliveries are readable only by their owner.
- Watch-zone matching uses persisted, user-approved coordinates; it is not live tracking.
- Realtime is enabled for private alert deliveries.
- The Phase 2 collection RPC name, argument, result codes, and result keys remain unchanged.

## Alert baseline

The hackathon V1 uses an Expo Go-compatible alert baseline:

1. The user explicitly saves a watch point and radius.
2. A matching FoodDrop produces a private persisted alert delivery.
3. An authenticated running application receives that delivery via Realtime.
4. The application rechecks the current FoodDrop state before presenting it.
5. The user receives a local notification and can also see the matched alert in Profile.

Closed-app remote push requires a development build and push-token infrastructure. It remains a documented stretch goal rather than a Phase 4 acceptance gate.

The notification deep link targets `/food-drop/[id]`, which is owned by Phase 3. Alert delivery and the Profile inbox are independently validated; tapping through must be retested after Phase 3 is merged.

## Validation evidence

Completed on the Phase 4 branch:

- [x] Phase 4 migration executed successfully against the shared Supabase project
- [x] Live backend behavioural verification passed 15/15 groups
- [x] Points daily cap and ledger idempotency verified
- [x] Weekly streak calculation and Singapore Sunday/Monday boundary verified
- [x] Private watch-zone read/write/disable/delete behaviour verified
- [x] Near FoodDrop matched and far FoodDrop rejected
- [x] Alert delivery ownership and state update verified
- [x] Rescue history and impact summary verified
- [x] TypeScript strict check passed
- [x] Expo lint passed
- [x] Expo Doctor passed 18/18 checks
- [x] Android production bundle exported successfully
- [x] Real-phone Profile, watch-zone, radius, notification permission, live FoodDrop alert, and alert-inbox flow passed
- [ ] Notification tap-to-detail retest after the Phase 3 detail route is integrated

The live backend verification intentionally leaves two terminal test rescue records as audit evidence and cancels its near/far alert test drops.

## Integration instructions

1. Merge the completed Phase 3 branch into `main` before merging Phase 4.
2. Merge the updated `main` into `phase/4-retention` and resolve the known overlapping files deliberately.
3. In `mobile/package.json`, preserve Phase 3 camera/update dependencies and Phase 4 `expo-notifications` plus both verification scripts.
4. In `mobile/app.json`, preserve the camera plugin/permission, the foreground-location wording, and the notifications plugin.
5. In `mobile/src/app/_layout.tsx`, preserve Phase 3's detail/scan/result routes and Phase 4's `AlertProvider`.
6. In `mobile/src/services/location/foreground-location.ts`, expose a combined interface supporting Phase 3 distance/discovery helpers and Phase 4's NUS fallback/watch-zone flow.
7. In `mobile/src/domain/types.ts`, preserve all Phase 3 collection/discovery contracts and the Phase 4 retention additions.
8. Regenerate `mobile/package-lock.json` from the reconciled package manifest if Git cannot merge it safely.
9. Retest alert tap-to-detail, scan success, points, streak, history, stock reduction, and duplicate handling together before the Phase 4 PR is merged.

## Machine-readable summary

```json
{
  "phase": 4,
  "branch": "phase/4-retention",
  "contractVersion": "1.0.0",
  "status": "implementation_complete_and_device_validated",
  "tablesCreated": ["points_ledger", "watch_zones", "alert_deliveries"],
  "pointsPerScoredRescue": 100,
  "pointsCalendarTimezone": "Asia/Singapore",
  "pointsFrequency": "first_verified_rescue_per_user_per_calendar_day",
  "streakUnit": "consecutive_monday_to_sunday_weeks",
  "watchRadiusMeters": {"minimum": 50, "maximum": 2000, "default": 250},
  "backgroundLocation": false,
  "notificationBaseline": "running_app_realtime_to_local_notification",
  "closedAppRemotePushRequired": false,
  "backendVerification": "15/15 behavioural groups passed",
  "physicalDeviceValidation": "passed",
  "remainingIntegrationTest": "notification_tap_to_phase3_detail_and_full_rescue_flow"
}
```

## Known limitations

- Expo Go does not provide the production closed-app remote-push path used by a custom development build.
- V1 stores only the user's latest approved watch point; it does not follow movement in the background.
- Notification delivery is advisory. Persisted FoodDrop stock, deadline, and status remain authoritative.
- Phase 3 owns the alert destination screen, so the final tap-through test is deferred until that branch is integrated.

