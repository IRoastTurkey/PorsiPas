# PorsiPas

> **Catch the drop. Save the meal.**

PorsiPas is an Android-first campus food-rescue app. Hosts publish unserved surplus as time-sensitive **FoodDrops**; nearby students find them on a meteor map and verify one collection by scanning the host's physical QR code.

**Submission status:** working prototype, physically tested on two phones, and ready for live evaluation.

## Why it matters

Campus surplus is often announced too late, buried in chat messages, or collected without live stock. PorsiPas turns that informal process into one clear loop:

1. A host posts a photo, stock, pickup point, and deadline.
2. A rescuer discovers the FoodDrop in the live list or meteor map.
3. The rescuer travels to pickup and scans the host's QR.
4. Supabase verifies the collection and decreases stock exactly once.
5. The verified rescue advances points, history, weekly missions, ranks, and badges.

## What judges can evaluate

- One anonymous account can both host and rescue; no demo password is required.
- Live FoodDrop creation, list/map discovery, stock, deadlines, dietary and allergen information.
- Physical QR collection with duplicate, expired, cancelled, and depleted protection.
- Private foreground-location sorting and user-selected watch radius.
- Verified points, history, impact, weekly streaks, PorsiPal ranks, missions, and badges.
- Privacy-safe native sharing and a built-in 30-second product tour.

## Recommended 2–3 minute demo

Use two phones with different PorsiPas identities:

1. **Phone A:** create a FoodDrop with stock of at least two and display its QR.
2. **Phone B:** discover the meteor, open its details, and scan the QR.
3. Show the PorsiPal confirmation and stock falling by exactly one on both phones.
4. Scan again to show duplicate protection and no second reward.
5. Open Profile to show verified history, the weekly mission, rank, badges, watch radius, and privacy-safe sharing.

The full timed narration is in [the demo script](./docs/submission/DEMO_SCRIPT.md).

## Run the prototype

### Requirements

- Node.js LTS and npm
- Expo Go compatible with Expo SDK 54
- Android phone recommended; iOS is supported through Expo Go
- A configured Supabase project

### Quick start

```powershell
git clone https://github.com/IRoastTurkey/PorsiPas.git
cd PorsiPas\mobile
npm ci
Copy-Item .env.example .env
```

Add the Supabase **public project URL** and **publishable key** to `mobile/.env`, then run:

```powershell
npm run start:tunnel -- --clear
```

`npm ci` installs the exact versions in `package-lock.json`. Scan the QR with Expo Go. On Windows systems that block `npm.ps1`, use `npm.cmd` in place of `npm`. Press `Ctrl+C` to stop the temporary tunnel.

For a new Supabase project, migration order and complete setup instructions are in [mobile/README.md](./mobile/README.md). Never place a database password or service-role key in the app.

## Architecture and verification

- **Mobile:** React Native, Expo Router, TypeScript
- **Backend:** Supabase anonymous Auth, Postgres, Storage, Realtime, Row Level Security, and atomic RPCs
- **Verification:** 12/12 core backend checks, 15/15 retention groups, engagement/privacy assertions, TypeScript, ESLint, Expo Doctor 18/18, Android export, and physical two-phone regression

The server is authoritative for stock, collections, points, streaks, and impact. UI celebrations and progression never manufacture a rescue.

## Honest prototype boundaries

- Location is requested only while the app is open; there is no continuous background tracking.
- Expo Go provides in-app and running-app alert behaviour. Production closed-app remote push is deferred.
- One verified collection is reported as one rescued portion. We do not invent weight, emissions, or monetary conversions.
- PorsiPas coordinates surplus pickup; hosts remain responsible for descriptions, allergens, handling, and food safety.

## Submission materials

- [Project rationale](./docs/submission/PITCH_RATIONALE.md)
- [2–3 minute demo script](./docs/submission/DEMO_SCRIPT.md)
- [Final submission checklist](./docs/submission/FINAL_SUBMISSION_CHECKLIST.md)
- [Accessibility QA](./docs/submission/ACCESSIBILITY_QA.md)
- [Third-party tools and asset acknowledgements](./ACKNOWLEDGEMENTS.md)
- [Final Phase 6–8 implementation handoff](./handoffs/PHASE_6_8_ENGAGEMENT_HANDOFF.md)

Detailed engineering handoffs remain in `docs/` and `handoffs/` for reviewers who want the full implementation record.

## Repository

Source: [github.com/IRoastTurkey/PorsiPas](https://github.com/IRoastTurkey/PorsiPas)

This is currently a private hackathon project. Confirm judge access before the submission deadline. No public software licence has been selected.
