# PorsiPas

> Catch the drop. Save the meal.

PorsiPas is a standalone campus food-rescue mobile application. Caterers and event organizers publish time-sensitive surplus meals as **FoodDrops**. Students discover nearby FoodDrops on a meteor-themed map, see live remaining stock, collect a portion by scanning an on-site QR code, and build a weekly rescue streak.

## Current status

PorsiPas is an Android-first hackathon prototype for the sustainability challenge. Phase 0 established the repository and product baseline. Phase 1 adds the Expo TypeScript application foundation under `mobile/`.

## Core flow

1. A host creates a FoodDrop with a photo, stock, pickup location, and deadline.
2. The FoodDrop appears as a meteorite on the map.
3. Eligible users receive an alert or discover it manually.
4. A user travels to the pickup point and scans its QR code.
5. The server verifies the collection and decreases live stock by one.
6. The user's points and weekly rescue streak update.

## V1 boundaries

V1 includes:

- Standalone mobile app
- Student and host actions in one account
- Anonymous authentication with a required display name
- FoodDrop creation with a required photo
- Map and list discovery
- Distance sorting and user-selected alert radius
- Live remaining stock
- One-portion QR verification
- Points and weekly rescue streaks
- Android-first physical-device demo

V1 intentionally excludes:

- Telegram integration
- Continuous background location tracking
- Food-image analysis or calorie estimation
- Reservations, delivery, and payments
- Team scores and leaderboards
- Caterer ratings and production-grade host verification

## Project documents

- [PorsiPas V1 product and engineering handoff](./PorsiPasV1_HANDOFF.md)
- [PorsiPas V1 parallel-work integration contract](./docs/INTEGRATION_CONTRACT_V1.md)
- [Hackathon challenge brief](./Lifehacks%20sharing_Ecovolt%20Presentation.pdf)

The handoff is the working source of truth for requirements, decisions, acceptance criteria, risks, and unresolved questions.

## Planned technical direction

- React Native with Expo and TypeScript
- Supabase Auth, Postgres, Storage, and Realtime
- QR verification through an atomic server-side database operation
- Expo location, camera, and notification capabilities

## Development setup

Install Node.js LTS and Expo Go on the Android test phone, then run:

```powershell
cd mobile
npm install
npm run start:tunnel
```

The project intentionally uses Expo SDK 54 so it opens in the Expo Go version distributed through the Play Store and App Store. Scan the displayed QR code from Expo Go and press `Ctrl+C` after testing to close the temporary tunnel. See [mobile/README.md](./mobile/README.md) for the complete development commands, local-network alternative, and Phase 1 boundaries.

## Repository practices

- Keep `main` in a runnable state.
- Use short-lived feature branches for substantial work.
- Commit small, coherent changes with descriptive messages.
- Review `git status` and staged changes before every commit.
- Never commit `.env` files, service-role keys, signing credentials, or personal tokens.

This is currently a private hackathon project. No public software license has been selected.
