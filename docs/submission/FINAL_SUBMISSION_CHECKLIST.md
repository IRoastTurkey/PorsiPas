# PorsiPas final submission checklist

Do not tick an item because its code exists. Tick it only after the stated build/device check passes on the final integrated branch.

## Devpost eligibility gate

- [ ] Submit exactly one team entry before the announced deadline.
- [ ] List every participating team member on that entry.
- [ ] Attach the working prototype, concise project description, repository URL, and demonstration material.
- [ ] Verify judges can access the private repository, or make it public if the event requires public access.
- [x] Third-party tools, libraries, APIs, generative AI use, and assets are disclosed in `ACKNOWLEDGEMENTS.md`.

## Integration gate

- [x] Phase 3 is reviewed, merged into `main`, and its completion handoff is read.
- [x] Phase 4 is based on the Phase 3-integrated `main`, reviewed, merged, and its completion handoff is read.
- [x] Phase 5 contains the Phase 4-integrated `main` before editing active screens.
- [x] Integration-contract deviations are documented and resolved deliberately.
- [x] `git status` contains only the intended Phase 5 integration changes.
- [x] Phase 6–8 begins from the device-validated Phase 5 merge on `main`.
- [x] Phase 6–8 requires no Supabase migration and does not alter collection authority.

## Build and automated checks

- [x] Parallel-safe Phase 5 components pass TypeScript on the Phase 2 base.
- [x] Final TypeScript check passes after wiring Phase 5 components.
- [x] Final lint passes with no newly introduced errors.
- [x] Expo Doctor passes 18/18 checks.
- [x] Android production export/bundle succeeds with both PorsiPal assets.
- [x] No `.env`, database password, service-role key, or QR secret is tracked by Git.

## End-to-end device run — pass 1

- [x] New user enters an accepted display name and reaches the app.
- [x] Host creates a FoodDrop with a photo, valid deadline, stock, and pickup information.
- [x] Host opens its management screen and QR code.
- [x] Rescuer sees the drop through Phase 3 discovery and can inspect its details.
- [x] Rescuer scans and confirms one portion.
- [x] Exactly one success state appears and remaining stock falls by exactly one.
- [x] Host and rescuer converge on the same remaining stock.
- [x] History, points, impact, and weekly streak reflect only the verified result.

## End-to-end device run — pass 2

- [ ] Repeat the complete path with a fresh FoodDrop and separate users/devices.
- [x] Duplicate collection is rejected without a second reward.
- [ ] A terminal drop cannot be collected.
- [ ] A network/retry scenario does not produce false success or double decrement.

## Discovery, alerts, and privacy

- [x] Distance sorting and location fallback behave as the Phase 3 handoff states.
- [x] Exact user location is not exposed to other users or hosts.
- [x] The app does not continuously track location in the background.
- [x] Notification radius/preferences match the Phase 4 handoff.
- [x] Closed-app push is either verified on-device or labelled deferred/foreground-only everywhere.

## Polish and accessibility

- [x] PorsiPal neutral and success assets render crisply without covering controls.
- [x] Meteor markers have at least a 44-point target and accessible labels.
- [ ] Low stock means 3 portions or fewer.
- [ ] Ending soon means 20 minutes or less and does not mutate backend status.
- [ ] Depleted, expired, and cancelled take precedence over visual urgency states.
- [ ] Loading, empty, error, offline, permission, and terminal states are reachable and recoverable.
- [ ] Reduce Motion disables non-essential Phase 5 entrance/spring animations.
- [ ] TalkBack or VoiceOver smoke test in `ACCESSIBILITY_QA.md` is completed.
- [ ] Larger device text does not hide critical actions or stock/status text.

## Phase 6–8 engagement regression

- [x] Phase 6–8 TypeScript and lint checks pass.
- [x] Deterministic engagement verifier passes Singapore-day/week, rank, mission, and badge boundaries.
- [x] Existing backend suites still pass 12/12 core checks and 15/15 retention groups.
- [x] Expo Doctor passes 18/18 and a fresh Android export includes the new route.
- [x] Profile shows the correct PorsiPal rank for the server-verified meal total.
- [x] Weekly mission count matches collection history for Monday–Sunday in Asia/Singapore.
- [x] Daily bonus says secured only when today's verified collection awarded points.
- [x] Locked and unlocked badges are announced with text, not colour alone.
- [x] A successful collection exposes **Share this rescue** and opens the native share sheet.
- [x] Profile sharing contains rank, verified meal total, and streak only.
- [x] Neither share path contains a venue, coordinates, FoodDrop ID, QR payload, or private alert data.
- [x] Cancelling sharing does not change points, stock, history, mission, or rescue success.
- [x] The 30-second tour is reachable from Discover and Profile and returns without trapping navigation.
- [x] Tour wording accurately describes verification, foreground location, alert limits, and food responsibility.

## Demo and claims

- [x] `PITCH_RATIONALE.md` matches the integrated implementation and foreground-alert boundary.
- [x] `DEMO_SCRIPT.md` contains no obsolete pre-merge labels or closed-app push claim.
- [ ] The live demo is rehearsed twice and fits within 2–3 minutes.
- [ ] A clean 2–3 minute backup video is recorded.
- [ ] No password, API key, private location, or QR secret appears in screenshots/video.
- [ ] Impact is described as verified portions rescued—not weight, emissions, or money unless separately evidenced.
- [ ] Food-safety responsibility and product limits can be explained honestly during Q&A.

## Submission package

- [ ] Final repository URL and exact commit are recorded.
- [ ] Repository access is tested from the account or visibility level judges will use.
- [ ] Setup instructions work for a teammate from a clean checkout.
- [ ] Required challenge form fields are complete.
- [ ] Demo video link permissions are tested in a private/incognito window.
- [ ] Screenshots, title, short description, team names, and contact details are final.
- [ ] `handoffs/PHASE_5_COMPLETION_HANDOFF.md` is complete and reviewed.
