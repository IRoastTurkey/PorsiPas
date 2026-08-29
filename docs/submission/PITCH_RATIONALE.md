# PorsiPas pitch rationale

Status: submission-candidate rationale. Keep final device-test evidence in the Phase 5 completion handoff.

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
5. Only a server-confirmed success triggers points, streak progress, impact totals, and the PorsiPal celebration.

The product does not continuously track a phone in the background. Location is used while the app is open to help sort nearby FoodDrops. Exact user locations are not shown to other users.

## Why the concept fits the judging rubric

| Category | Weight | Product response | Evidence to show judges |
|---|---:|---|---|
| Fun and engagement | 40% | FoodDrops land as meteorites; urgency is readable; PorsiPal, points, and a restrained success moment reward a real rescue. | Show the meteor map marker, low-stock/ending-soon states, and the server-confirmed rescue celebration. |
| Behaviour change | 20% | The unit of progress is a QR-verified collected portion. Live stock makes the sustainable action concrete for host and rescuer. | Create a drop, scan once, and show stock fall by exactly one. Explain that an error or duplicate never shows success. |
| Stickiness | 20% | Live campus supply, optional nearby alerts, weekly streaks, history, and impact create reasons to return without punishing users for days when no food is available. | Show notification preferences only if implemented; then show weekly streak/history/profile after a verified collection. |
| Craft and usability | 20% | One app supports both roles; posting is compact; permission, offline, empty, and terminal states explain the next safe action; reduced-motion settings are respected. | Complete the main path on a physical phone and deliberately show one recovery state if time permits. |

## Responsible design choices

- Rescue first, gamification second. Rewards never manufacture stock or confirm a collection.
- One collection equals one portion. Users should take only food they intend to eat.
- Live truth matters more than animation. Depleted, expired, and cancelled drops cannot be presented as collectible.
- “Ending soon” is a presentation label for an active drop with 20 minutes or less before its deadline. It does not mutate backend status.
- “Low stock” means three portions or fewer remain. Terminal states always take precedence.
- PorsiPas records meals rescued, not kilograms of food or carbon avoided. Those conversions require evidence the V1 does not collect.
- Hosts remain responsible for food safety, accurate descriptions, and pickup conditions. PorsiPas is a coordination tool, not a food-safety certification.

## Current truth boundary

Phases 1–4 are integrated. Anonymous onboarding, host creation and management, live list/map discovery, physical QR collection, atomic stock updates, daily points, weekly streaks, history, impact, private watch zones, and the running-app alert baseline are implemented. The two-phone host/discover/scan/duplicate path and the Phase 4 watch-zone alert flow have passed physical testing; the final Phase 5 submission candidate still requires its closing regression run.

Expo Go V1 supports persisted in-app alerts and local notifications while the application is running. Production closed-app remote push requires a development build and push-token service and is explicitly deferred.

## Closing line

PorsiPas makes the sustainable option feel immediate and delightful while keeping the meaningful event simple: one real surplus portion, found and collected before it becomes waste.
