# PorsiPas 2–3 minute demo script

Status: rehearsal draft. Anything marked “verify after merge” must be removed or adapted if it is not working on the final build.

## Roles and setup

- Presenter/host: Phone A, already signed in with a recognisable display name.
- Rescuer: Phone B, already signed in with a different display name.
- Narrator/timekeeper: keeps the explanation moving and skips optional beats when the timer calls for it.
- Both phones use the same final build and Supabase project.
- Prepare one well-lit food photo and a real demo pickup point.
- Start with stable internet, sufficient battery, notifications/permissions in the desired test state, and no stale active demo drops.

Never repair data manually during the judged demo. If a step fails, use the app's visible retry/recovery path or move to the honest fallback noted below.

## Timed script

### 0:00–0:20 — Problem and promise

Narrator:

> Campus events often end with safe, unserved food, while nearby students may never hear about it in time. PorsiPas turns that surplus into live meteorite FoodDrops that students can find and rescue before pickup ends.

Show the PorsiPas home screen and PorsiPal briefly. Do not spend time explaining the mascot before the behaviour.

### 0:20–0:55 — Host creates a FoodDrop

On Phone A:

1. Open **Create**.
2. Add the prepared photo.
3. Enter a short title, pickup instructions, a deadline, and stock of at least 2.
4. Publish and open the management screen.
5. Show the generated QR code.

Narrator:

> Anyone can act as a host or rescuer. Posting is intentionally quick, and this stock is shared live rather than buried in a chat message.

### 0:55–1:25 — Rescuer discovers the drop (verify after Phase 3 merge)

On Phone B:

1. Open the map/list.
2. Point out the meteorite marker and distance ordering.
3. Open the new FoodDrop and show stock, deadline, pickup instructions, and host.

Narrator:

> Location is used while the app is open to help sort nearby drops; PorsiPas does not continuously track the phone in the background or expose a student's location to hosts.

If location permission is denied, demonstrate the intended fallback rather than changing device settings on stage.

### 1:25–1:55 — QR-verified rescue (verify after Phase 3 merge)

On Phone B, scan Phone A's QR code and confirm collection.

Keep both phones visible long enough to show:

- the server-confirmed PorsiPal success state on Phone B;
- remaining stock reduced by exactly one;
- the host view reflecting the authoritative remaining stock.

Narrator:

> The celebration appears only after the backend confirms the collection. A duplicate, expired, depleted, cancelled, or invalid scan does not award success.

### 1:55–2:20 — Return loop and impact (verify after Phase 4 merge)

On Phone B, show the profile/history and weekly streak. Show nearby alert preferences only if real notification behaviour is implemented and tested.

Narrator:

> PorsiPas makes the action sticky with weekly streaks and a personal rescue history. We count verified portions, not invented carbon estimates. Alerts are optional and user-controlled.

### 2:20–2:40 — Close

Narrator:

> One host, one nearby student, one verified rescue. PorsiPas makes saving surplus food fast, trustworthy, and fun enough to repeat.

End on the active map or confirmed rescue—not a settings screen.

## Optional ten-second craft beat

Use only if rehearsal is under time: briefly show a low-stock or ending-soon badge and explain that status is communicated with text and symbols, not colour alone.

## Honest fallback ladder

1. **Tunnel/local connection fails before judging:** restart Expo early and reconnect both devices before the slot. Do not begin the timed demo until both show live data.
2. **Phone B cannot use the camera:** use a tested in-app manual-token fallback only if Phase 3 actually implements one. Otherwise move to a pre-recorded collection clip and state that the live camera path could not be demonstrated.
3. **Realtime refresh is delayed:** use the app's refresh action. Never edit Supabase rows from the dashboard during the demo.
4. **Push notification is unavailable:** say it is deferred or foreground-only and demonstrate discovery from the map/list. Never show a simulated notification as if it were live.
5. **One phone fails entirely:** use a rehearsed recording of the complete two-phone path while keeping the working app available for questions.

## Recording requirements

- Record a clean 2–3 minute backup video after the final two-device regression passes.
- Keep passwords, API keys, QR secret payload text, browser tabs, and Supabase dashboards out of frame.
- Use readable zoom and captions; avoid fast cuts during the stock change.
- Record room audio once, then replace it with clear narration if needed.
