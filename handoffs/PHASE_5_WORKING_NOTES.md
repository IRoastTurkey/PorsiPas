---
document: PHASE_5_WORKING_NOTES
status: parallel_preparation
phase: 5
branch: phase/5-polish-submission
base_commit: 69ecf72
base_scope: phase_2_integrated
created: 2026-08-30
integration_blocked_by:
  - phase_3_merge_and_completion_handoff
  - phase_4_merge_and_completion_handoff
---

# Phase 5 working notes

## Purpose

Phase 5 owns final presentation polish, resilient user-facing states, accessibility/reduced-motion treatment, submission material, and the final integration regression. This branch began from the Phase 2-integrated `main` while teammates build Phases 3 and 4. Until those phases merge, all changes stay in parallel-safe folders and do not modify active route files, dependencies, configuration, theme tokens, or Supabase resources.

## Parallel-safe work created

### Reusable states

Location: `mobile/src/components/states/`

- `LoadingState`
- `EmptyState`
- `ErrorState`
- `OfflineState`
- `PermissionState` for location, camera, and notifications
- `TerminalFoodDropState` for depleted, expired, and cancelled drops
- shared `StatePanel` and `StateAction` contract

These components accept callbacks and copy; they do not navigate or call Supabase directly.

### Polish components

Location: `mobile/src/components/polish/`

- `FoodDropStatusBadge`
- `resolveFoodDropVisualState`
- `MeteorMarker`
- `PorsiPal`
- `GentleAppear`
- `useReducedMotion`
- `RescueSuccess`

`RescueSuccess` renders only when `CollectFoodDropResult.code === 'success'`. Server-returned points, streak, and stock remain authoritative.

### Shared visual rules

- Low stock: remaining stock is 3 or fewer.
- Ending soon: an active FoodDrop is 20 minutes or less from its pickup deadline.
- Precedence: cancelled → depleted → expired → low stock → ending soon → active.
- The ending-soon rule is presentation-only; it must not update `food_drops.status`.
- Terminal drops should normally be removed from collectible map results and get an explanatory state if reached through an old link.
- Status never relies on colour alone.

### Motion rules

- Selected meteor markers may use a short spring.
- Rescue content may use a 280 ms entrance.
- Both effects are skipped when the operating system reports Reduce Motion.
- No looping, blocking, or essential animation is included.

## PorsiPal assets

Location: `mobile/assets/porsipas/`

- `porsipal-neutral.png` — 843,405 bytes
- `porsipal-success.png` — 856,049 bytes

Both are original 1536 × 1536 transparent PNGs generated specifically for this project with OpenAI's built-in ImageGen on 2026-08-30. No reference image or third-party character asset was used. Full generation and usage notes are in the asset folder's `README.md`.

## Submission documents

Location: `docs/submission/`

- `PITCH_RATIONALE.md`
- `DEMO_SCRIPT.md`
- `FINAL_SUBMISSION_CHECKLIST.md`
- `ACCESSIBILITY_QA.md`

The documents distinguish implemented, pending, and deferred behaviour. They must be edited after integration so they describe the final build rather than the intended build.

## Proposed integration points after Phase 3/4

These are proposals, not authorization to guess another phase's route structure:

- Discovery/map: `MeteorMarker`, `FoodDropStatusBadge`, `LoadingState`, `EmptyState`, `ErrorState`, `OfflineState`, and location `PermissionState`.
- FoodDrop detail/scanner: status badge, camera permission state, terminal state, safe retry copy.
- Collection result: `RescueSuccess`, receiving the exact service result; never reconstruct a success from local assumptions.
- Profile/history/alerts: neutral empty/error states and notification permission state.
- Onboarding or home: PorsiPal only where it does not delay the core task.

Before wiring anything, read the Phase 3 and Phase 4 completion handoffs and inspect their final service/result contracts. Prefer adapters or prop changes inside Phase 5 components over rewriting teammate code.

## Current verification

- TypeScript: passed on base commit `69ecf72` with the parallel-safe components present.
- Visual asset inspection: neutral and success variants are transparent, consistent, readable at app scale, and contain no words/logos/watermarks.
- Device integration: not yet possible because Phase 3 and Phase 4 are not integrated.
- Lint, Expo Doctor, Android production export, full regression, and two-pass device demo: pending final integration.

## Known risks and decisions

- Closed-app push is desired but not a V1 hard gate. Claims must match Phase 4's tested result.
- The integration contract names the legacy anonymous-key variable while Phase 2 prefers the publishable-key variable with a legacy fallback. Treat this as an existing documented deviation during final integration; do not expose or commit either real value.
- PorsiPal images are intentionally under 1 MB each but remain large-source PNGs. If actual device performance is poor, optimise them with an approved image pipeline during integration without changing their visual identity.
- Emoji rendering varies across devices. Essential UI meaning must remain in text; Phase 5 polish should prefer code-native symbols or existing icon dependencies where practical.

## Remaining Phase 5 work

1. Wait for Phase 3 and Phase 4 to merge in the agreed order.
2. Rebase/refresh this branch on the integrated `main` without overwriting teammate work.
3. Wire components into real screens based on actual completion handoffs.
4. Resolve type/lint/build issues and test permission/offline/terminal paths.
5. Run the complete two-device flow twice.
6. Reconcile pitch, demo script, checklist, and README with final truth.
7. Create `handoffs/PHASE_5_COMPLETION_HANDOFF.md` with exact commits, tests, deviations, and known limitations.
8. Ask the human operator to review before any commit or push.
