# PorsiPas final submission checklist

Do not tick an item because its code exists. Tick it only after the stated build/device check passes on the final integrated branch.

## Integration gate

- [ ] Phase 3 is reviewed, merged into `main`, and its completion handoff is read.
- [ ] Phase 4 is rebased on the Phase 3-integrated `main`, reviewed, merged, and its completion handoff is read.
- [ ] Phase 5 is rebased on the Phase 4-integrated `main` before editing active screens.
- [ ] Integration-contract deviations are documented and resolved deliberately.
- [ ] `git status` is clean except for the intended Phase 5 changes.

## Build and automated checks

- [x] Parallel-safe Phase 5 components pass TypeScript on the Phase 2 base.
- [ ] Final TypeScript check passes.
- [ ] Final lint passes with no newly introduced errors.
- [ ] Expo Doctor passes.
- [ ] Android production export/bundle succeeds.
- [ ] No `.env`, database password, service-role key, or QR secret is tracked by Git.

## End-to-end device run — pass 1

- [ ] New user enters an accepted display name and reaches the app.
- [ ] Host creates a FoodDrop with a photo, valid deadline, stock, and pickup information.
- [ ] Host opens its management screen and QR code.
- [ ] Rescuer sees the drop through Phase 3 discovery and can inspect its details.
- [ ] Rescuer scans and confirms one portion.
- [ ] Exactly one success state appears and remaining stock falls by exactly one.
- [ ] Host and rescuer converge on the same remaining stock.
- [ ] History, points, impact, and weekly streak reflect only the verified result.

## End-to-end device run — pass 2

- [ ] Repeat the complete path with a fresh FoodDrop and separate users/devices.
- [ ] Duplicate collection is rejected without a second reward.
- [ ] A terminal drop cannot be collected.
- [ ] A network/retry scenario does not produce false success or double decrement.

## Discovery, alerts, and privacy

- [ ] Distance sorting and location fallback behave as the Phase 3 handoff states.
- [ ] Exact user location is not exposed to other users or hosts.
- [ ] The app does not continuously track location in the background.
- [ ] Notification radius/preferences match the Phase 4 handoff.
- [ ] Closed-app push is either verified on-device or labelled deferred/foreground-only everywhere.

## Polish and accessibility

- [ ] PorsiPal neutral and success assets render crisply without covering controls.
- [ ] Meteor markers have at least a 44-point target and accessible labels.
- [ ] Low stock means 3 portions or fewer.
- [ ] Ending soon means 20 minutes or less and does not mutate backend status.
- [ ] Depleted, expired, and cancelled take precedence over visual urgency states.
- [ ] Loading, empty, error, offline, permission, and terminal states are reachable and recoverable.
- [ ] Reduce Motion disables non-essential Phase 5 entrance/spring animations.
- [ ] TalkBack or VoiceOver smoke test in `ACCESSIBILITY_QA.md` is completed.
- [ ] Larger device text does not hide critical actions or stock/status text.

## Demo and claims

- [ ] `PITCH_RATIONALE.md` matches the final implementation.
- [ ] `DEMO_SCRIPT.md` contains no unverified feature claim or obsolete fallback.
- [ ] The live demo is rehearsed twice and fits within 2–3 minutes.
- [ ] A clean 2–3 minute backup video is recorded.
- [ ] No password, API key, private location, or QR secret appears in screenshots/video.
- [ ] Impact is described as verified portions rescued—not weight, emissions, or money unless separately evidenced.
- [ ] Food-safety responsibility and product limits can be explained honestly during Q&A.

## Submission package

- [ ] Final repository URL and exact commit are recorded.
- [ ] Setup instructions work for a teammate from a clean checkout.
- [ ] Required challenge form fields are complete.
- [ ] Demo video link permissions are tested in a private/incognito window.
- [ ] Screenshots, title, short description, team names, and contact details are final.
- [ ] `handoffs/PHASE_5_COMPLETION_HANDOFF.md` is complete and reviewed.
