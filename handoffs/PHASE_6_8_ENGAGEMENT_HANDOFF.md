---
document: PorsiPas Phase 6-8 Engagement Handoff
version: 1.0.0
status: implementation_complete_and_device_validated
date: 2026-08-30
timezone: Asia/Singapore
phases: [6, 7, 8]
branch: phase/6-8-engagement
base_main_commit: 434dd1b
database_migrations: 0
collection_contract_changed: false
---

# PorsiPas Phase 6–8 — Engagement and judge-readiness handoff

This combined handoff records the ten-hour presentation sprint built on the merged and device-validated Phase 5 application. The objective is to improve the judging rubric's fun, stickiness, social-hook, and clarity dimensions without destabilising the verified host-to-rescue transaction.

## Guardrails

- Supabase remains the only authority for collections, stock, points, streaks, history, and impact.
- No database migration, new permission, background task, remote-push claim, or external account is introduced.
- Engagement state is derived from the existing authenticated user's verified collection history.
- Sharing uses the operating system share sheet and never includes venue, coordinates, FoodDrop ID, QR payload, watch-zone data, or alert data.
- A cancelled or failed share is informational only and cannot mutate product state.

## Phase 6 — PorsiPal Cosmic Journey

Profile now turns verified impact into an explicit return loop:

- Six rescue ranks from Meteor Newcomer to Rescue Legend.
- A progress bar to the next rank.
- A weekly mission to complete three verified rescues, calculated Monday–Sunday in Asia/Singapore.
- Daily first-rescue points status derived from today's collection history.
- Four labelled badges: First Catch, Rescue Trio, Week in Orbit, and Streak Spark.
- Locked/unlocked meaning is exposed in text and accessibility labels rather than colour alone.

Ranks and badges are presentation state. They do not award points, modify stock, or write to Supabase.

## Phase 7 — Privacy-safe social hook

- A successful server-confirmed rescue exposes **Share this rescue**.
- Profile exposes **Share my rescue journey**.
- The success message contains only the verified rescue event and server-returned points when awarded.
- The profile message contains only the chosen display name, derived rank, verified rescue count, and current streak.
- Both paths use React Native's native `Share` API with no new dependency.
- Sharing is never presented for a failed, duplicate, offline, expired, depleted, cancelled, or invalid collection.

## Phase 8 — Judge-ready clarity

- Discover and Profile link to a 30-second **Catch. Scan. Rescue.** tour.
- The tour explains live discovery, physical QR verification, progression, foreground-only location, the alert baseline, privacy, and food-safety responsibility.
- Pitch rationale and the 2–3 minute demo script now include the mission/rank/share loop without overstating environmental impact or notification capability.
- The final checklist and accessibility smoke test contain explicit Phase 6–8 acceptance items.

## Primary files

- `mobile/src/features/engagement/progression.ts`
- `mobile/src/features/engagement/share-rescue.ts`
- `mobile/src/components/engagement/rescue-journey-card.tsx`
- `mobile/src/app/how-it-works.tsx`
- `mobile/src/app/(tabs)/profile.tsx`
- `mobile/src/app/(tabs)/index.tsx`
- `mobile/src/app/rescue-result.tsx`
- `mobile/src/components/polish/rescue-success.tsx`
- `docs/submission/PITCH_RATIONALE.md`
- `docs/submission/DEMO_SCRIPT.md`
- `docs/submission/FINAL_SUBMISSION_CHECKLIST.md`

## Verification state

| Gate | Status |
|---|---|
| Phase 5 integrated base | Passed before branch creation |
| TypeScript | Passed after initial wiring |
| ESLint | Passed after initial wiring |
| Deterministic engagement verifier | Passed Singapore-day/week, rank, mission, and badge assertions |
| Phase 2 backend verifier | Passed 12/12 checks |
| Phase 4 backend verifier | Passed 15/15 behavioural groups |
| Expo Doctor | Passed 18/18 checks |
| Android export | Passed with 1,551 modules and both PorsiPal assets |
| Secret, conflict, and diff scan | Passed; `.env` ignored, zero sensitive tracked matches, zero conflict markers |
| Physical Android regression | Passed; human operator accepted the complete instructed matrix |

## Physical acceptance matrix

Result: **Passed on the final combined branch.** The human operator confirmed that the journey, mission, daily status, badges, both privacy-safe share paths, tour navigation, verified rescue/duplicate behaviour, and prior watch-zone flow worked as instructed.

1. Open Profile before any new rescue and confirm rank, total, weekly mission, daily status, and badges match the existing verified history.
2. Open and dismiss **Share my rescue journey**. Confirm the preview contains no venue, coordinates, identifier, or QR content.
3. Open the 30-second tour from Discover, read all three steps, return, then open it from Profile and return again.
4. Create a FoodDrop with stock of at least two on Phone A.
5. Discover, inspect, and scan it on Phone B. Confirm exactly one stock decrement and the existing success state.
6. Open **Share this rescue**, inspect the privacy-safe copy, and dismiss it.
7. Open Profile and confirm history, meal total, rank/next-rank progress, weekly mission, daily status, and any newly unlocked badge reflect the verified result.
8. Repeat the QR scan and confirm duplicate rejection produces neither success sharing nor engagement progress.
9. Confirm the private watch zone and foreground alert path still work.
10. Enable larger text or TalkBack for a smoke pass over the journey card, badges, sharing button, and tour.

## Machine-readable summary

```json
{
  "phases": [6, 7, 8],
  "branch": "phase/6-8-engagement",
  "status": "implementation_complete_pending_physical_validation",
  "baseMainCommit": "434dd1b",
  "databaseMigrations": 0,
  "newDependencies": 0,
  "collectionContractChanged": false,
  "progressSource": "verified_collection_history",
  "shareTransport": "react_native_native_share_sheet",
  "shareIncludesPrivateLocationOrQr": false,
  "typecheck": "passed",
  "lint": "passed",
  "engagementVerifier": "passed",
  "phase2Backend": "12/12 passed",
  "phase4Backend": "15/15 passed",
  "expoDoctor": "18/18 passed",
  "androidExport": "passed",
  "physicalValidation": "passed"
}
```

## Exact next steps

1. Review the final staged diff.
2. Commit and push the complete Phase 6–8 branch once.
3. Open one pull request into `main`, review it, and merge it once.
4. Pull the final `main`, record the exact commit, and complete the remaining rehearsal/video/submission-form checklist.
