# Run and evaluate PorsiPas

This folder contains the Expo SDK 54 mobile app. The simplest evaluation path is the team's live two-phone demo. The steps below reproduce it from a checkout.

## Requirements

- Node.js LTS and npm
- Expo Go on an Android or iOS phone
- Internet access for the shared Supabase demo project

## 1. Install

For judges and teammates, run this once from the repository root:

```powershell
npm.cmd --prefix mobile run judge
```

It installs the locked dependencies when needed and starts a cleared Expo tunnel. Scan the displayed QR with Expo Go. No Supabase account, `.env`, database migration, or demo login is required.

## 2. Optional Supabase override

The shared hackathon project's public URL and `sb_publishable_...` client key are bundled into the app. Supabase publishable keys are intended for public mobile clients; Auth and Row Level Security enforce access to the database.

Developers who want to use a different Supabase project can create `.env` in this `mobile` folder and add only its mobile-safe public values:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

Never use a database password or Supabase service-role key in the mobile app.

For a fresh independent Supabase project:

1. Enable **Anonymous Sign-Ins** under Authentication settings.
2. Open the SQL editor.
3. Run these migrations once, in order:
   - `../supabase/migrations/202608290001_phase2_foundation.sql`
   - `../supabase/migrations/202608290002_phase2_collection_anon_result.sql`
   - `../supabase/migrations/202608300001_phase4_retention.sql`
4. Confirm the migrations complete without errors. They create the required tables, storage configuration, Row Level Security policies, and server functions.

The bundled team project is already migrated. Do not rerun setup SQL against it during judging.

## 3. Manual Expo start

Across different networks, use the temporary tunnel:

```powershell
npm run start:tunnel -- --clear
```

On the same trusted network, `npm start` is faster. Scan the displayed QR with Expo Go and press `Ctrl+C` when finished.

If Expo Go opens a stale project, clear its app cache/data and scan the new QR instead of selecting a recent entry.

## 4. Evaluate with two phones

1. Open PorsiPas on both phones and choose different display names.
2. On Phone A, create and publish a FoodDrop with stock of at least two.
3. On Phone B, discover the FoodDrop and inspect its current details.
4. Display the host QR on Phone A and scan it through PorsiPas on Phone B.
5. Confirm one success, one stock decrement, verified history, mission progress, and privacy-safe sharing.
6. Scan again and confirm duplicate rejection with no second reward or stock change.

No email, password, or seeded demo account is required; the app uses Supabase anonymous authentication.

## Verification commands

```powershell
npm run typecheck
npm run lint
npm run verify:engagement
npm run verify:backend
npm run verify:retention
npx expo-doctor
npx expo export --platform android
```

The backend verification scripts create terminal audit records in the configured project. Run them only when that behaviour is acceptable.

## Expo Go limitation

The V1 alert baseline is in-app and foreground/running-app behaviour. Android remote push is not available in Expo Go on SDK 54; production closed-app push requires a development build and push-token service.
