# PorsiPas mobile app

This folder contains the Android-first PorsiPas app built with Expo, React Native, and TypeScript.

The project intentionally targets Expo SDK 54 because it matches the Expo Go builds distributed through the Google Play Store and Apple App Store. Do not upgrade the Expo SDK during the hackathon without also planning how every test device will receive a compatible client.

## Phase 1 scope

Phase 1 establishes a runnable mobile foundation:

- PorsiPas application identity and colour system
- Discover, Create, and Profile tab navigation
- Honest placeholders for features that require the backend
- Environment-variable template for Phase 2
- A low-friction Expo Go workflow for Android testing

It deliberately contains no authentication, database, map, QR scanning, or fake live data. Those features are added in later phases.

## First-time setup

Install the current Node.js LTS release on the development computer and Expo Go on the Android phone. Then open PowerShell in the repository and run:

```powershell
cd mobile
npm install
Copy-Item .env.example .env
```

The empty Phase 1 environment values are expected. Real Supabase values will be added in Phase 2.

## Run on Android with the fewest steps

Keep the computer and phone online, then run:

```powershell
npm run start:tunnel
```

On the phone:

1. Open Expo Go.
2. Scan the QR code shown in PowerShell.
3. Wait for the JavaScript bundle to finish loading.

Tunnel mode is the default team workflow because it usually works even when the phone and computer cannot communicate directly on campus Wi-Fi. It routes the temporary development connection through Expo's tunnel provider, so use it only while testing and press `Ctrl+C` when finished. If both devices can communicate on the same trusted local network, `npm start` keeps the connection local and is usually faster.

## Quality checks

Run these before sharing a branch:

```powershell
npm run typecheck
npm run lint
```

## Expected Phase 1 result

The phone should show three working tabs:

- **Discover** — explains the future FoodDrop map and rescue flow
- **Create** — previews the three-step host flow
- **Profile** — previews display name, points, alert preferences, and weekly streaks

All values are intentionally static in this phase. The application should start without a red error screen and switching tabs should not crash.
