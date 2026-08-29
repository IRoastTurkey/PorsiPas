# PorsiPas mobile app

Android-first Expo/React Native application for discovering, hosting, and verifying campus surplus-food rescues.

## Requirements

- Node.js LTS (the current team machine also works with Node 24)
- Expo Go on the Android test phone
- Access to the team Supabase project

## First-time setup

From PowerShell in this folder:

```powershell
npm install
Copy-Item .env.example .env
```

Add the team project’s public values to `.env`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Never use a Supabase service-role key in the mobile app. Enable anonymous sign-ins in the project and run `../supabase/migrations/202608290001_phase2_foundation.sql` once before opening the app.

## Run on Android

Tunnel mode is the simplest option across campus networks:

```powershell
npm run start:tunnel -- --clear
```

Open Expo Go and scan the terminal QR. If the phone and computer are on the same trusted network, `npm start` is faster. Press `Ctrl+C` when finished.

## Phase 2 host flow

1. A new installation signs in anonymously.
2. Enter a required display name.
3. Open **Create**.
4. Add a current food photo, positive stock, pickup details, deadline, allergen information, and safety confirmation.
5. Confirm the pickup pin with foreground location or by tapping the map.
6. Publish and display the generated QR at pickup.
7. Use the management screen to correct stock, extend by 30 minutes, or cancel.

## Quality checks

```powershell
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform android
```

See `../docs/PHASE_2_HANDOFF.md` for backend operations, security decisions, integration boundaries, and the full validation checklist.
