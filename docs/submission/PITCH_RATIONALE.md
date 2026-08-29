# PorsiPas pitch rationale

Status: device-validated Phase 6–8 candidate rationale. Final evidence is recorded in the combined completion handoff.

## One-line pitch

PorsiPas turns time-sensitive surplus food into nearby “meteorite” FoodDrops that students can discover and verify with a QR scan before the food becomes waste.

## The audience and behaviour

The first audience is a campus community:

- Hosts are caterers, event organisers, clubs, or students with safe, unserved surplus food.
- Rescuers are nearby students who can collect a portion during the stated pickup window.
- The target behaviour is a completed, responsible food rescue—not merely opening an alert, taking a photo, earning a point, or expressing an intention.

NUS's existing “buffet response” Telegram workflow is qualitative evidence that students already coordinate around surplus food. PorsiPas is a standalone product rather than a Telegram integration. It focuses the workflow, keeps stock visible, and adds a verified end to each rescue.

## Core loop

1. A host signs in anonymously with a display name and posts a FoodDrop with a photo, pickup point, deadline, and number of portions.
2. A rescuer discovers an active FoodDrop on the map or list and checks its live stock and pickup details.
3. At the pickup point, the rescuer scans the FoodDrop QR code.
4. The backend atomically confirms at most one portion for that request and returns the authoritative remaining stock.
5. Only a server-confirmed success triggers points, streak progress, impact totals, the PorsiPal celebration, weekly mission progress, ranks, and badges.
6. A rescuer may open the phone's native share sheet with a privacy-safe rescue message; the app never includes a pickup location, account identifier, or QR payload. Profile sharing may include the user's chosen display name.

The product does not continuously track a phone in the background. Location is used while the app is open to help sort nearby FoodDrops. Exact user locations are not shown to other users.

## Why the concept fits the judging rubric

| Category | Weight | Product response | Evidence to show judges |
|---|---:|---|---|
| Fun and engagement | 40% | FoodDrops land as meteorites; PorsiPal turns verified rescues into cosmic ranks, a weekly mission, and unlockable badges; a privacy-safe share moment makes the rescue tellable. | Show the meteor marker, server-confirmed celebration, PorsiPal Cosmic Journey, one unlocked badge, and the native share sheet. |
| Behaviour change | 20% | The unit of progress is a QR-verified collected portion. Live stock makes the sustainable action concrete for host and rescuer. | Create a drop, scan once, and show stock fall by exactly one. Explain that an error or duplicate never shows success. |
| Stickiness | 20% | Live campus supply, nearby alerts, a three-rescue weekly mission, daily first-rescue status, ranks, badges, history, and impact create reasons to return without punishing users for days when no food is available. | Show the mission moving only after collection, the next-rank progress, and the private watch-zone controls. |
| Craft and usability | 20% | One app supports both roles; posting is compact; a 30-second tour explains the loop; permission, offline, empty, and terminal states explain the next safe action; reduced-motion settings are respected. | Complete the main path on a physical phone, open the judge tour, and deliberately show one recovery state if time permits. |

## Responsible design choices

- Rescue first, gamification second. Rewards never manufacture stock or confirm a collection.
- One collection equals one portion. Users should take only food they intend to eat.
- Live truth matters more than animation. Depleted, expired, and cancelled drops cannot be presented as collectible.
- “Ending soon” is a presentation label for an active drop with 20 minutes or less before its deadline. It does not mutate backend status.
- “Low stock” means three portions or fewer remain. Terminal states always take precedence.
- PorsiPas records meals rescued, not kilograms of food or carbon avoided. Those conversions require evidence the V1 does not collect.
- Ranks, badges, and weekly missions are views over server-verified collection history. They do not create rewards or modify stock.
- Native sharing contains only a generic rescue message or the user's chosen display name, verified meal count, rank, and streak. It never contains coordinates or QR material.
- Hosts remain responsible for food safety, accurate descriptions, and pickup conditions. PorsiPas is a coordination tool, not a food-safety certification.

## Current truth boundary

Phases 1–5 are merged and device-validated. Anonymous onboarding, host creation and management, live list/map discovery, physical QR collection, atomic stock updates, daily points, weekly streaks, history, impact, private watch zones, the running-app alert baseline, PorsiPal, and resilient states are implemented. The device-validated Phase 6–8 branch adds derived progression, privacy-safe sharing, and the judge tour without a backend migration or collection-contract change.

Expo Go V1 supports persisted in-app alerts and local notifications while the application is running. Production closed-app remote push requires a development build and push-token service and is explicitly deferred.

## Closing line

PorsiPas makes the sustainable option feel immediate and delightful while keeping the meaningful event simple: one real surplus portion, found and collected before it becomes waste.
