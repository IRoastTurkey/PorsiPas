# PorsiPas 2–3 minute demo script

Status: device-validated Phase 6–8 rehearsal script. Rehearse twice and record the backup video before judging.

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

Show the PorsiPas home screen and briefly point to the 30-second tour. Do not open it during the timed happy path unless a judge asks how verification or privacy works.

### 0:20–0:55 — Host creates a FoodDrop

On Phone A:

1. Open **Create**.
2. Add the prepared photo.
3. Enter a short title, pickup instructions, a deadline, and stock of at least 2.
4. Publish and open the management screen.
5. Show the generated QR code.

Narrator:

> Anyone can act as a host or rescuer. Posting is intentionally quick, and this stock is shared live rather than buried in a chat message.

### 0:55–1:25 — Rescuer discovers the drop

On Phone B:

1. Open the map/list.
2. Point out the meteorite marker and distance ordering.
3. Open the new FoodDrop and show stock, deadline, pickup instructions, and host.

Narrator:

> Location is used while the app is open to help sort nearby drops; PorsiPas does not continuously track the phone in the background or expose a student's location to hosts.

If location permission is denied, demonstrate the intended fallback rather than changing device settings on stage.

### 1:25–1:55 — QR-verified rescue

On Phone B, scan Phone A's QR code and confirm collection.

Keep both phones visible long enough to show:

- the server-confirmed PorsiPal success state on Phone B;
- remaining stock reduced by exactly one;
- the host view reflecting the authoritative remaining stock.

Narrator:

> The celebration appears only after the backend confirms the collection. A duplicate, expired, depleted, cancelled, or invalid scan does not award success.

### 1:55–2:25 — Return loop, progression, and social hook

On Phone B, open Profile and show the PorsiPal Cosmic Journey, weekly three-rescue mission, next rank, one badge, history, and private watch-zone radius. Tap **Share my rescue journey** just far enough to show the native share sheet, then dismiss it without posting. Describe notifications as the tested running-app baseline, not closed-app remote push.

Narrator:

> PorsiPas makes the action sticky with a weekly mission, ranks, badges, and personal history—all derived from verified collections. Sharing is optional and never includes a FoodDrop location or QR. We count real portions, not invented carbon estimates.

### 2:25–2:45 — Close

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
6. **Native share sheet is slow or unavailable:** skip it. Sharing is an optional social hook and never blocks or changes the verified rescue.

## Recording requirements

- Record a clean 2–3 minute backup video after the final two-device regression passes.
- Keep passwords, API keys, QR secret payload text, browser tabs, and Supabase dashboards out of frame.
- Use readable zoom and captions; avoid fast cuts during the stock change.
- Record room audio once, then replace it with clear narration if needed.
