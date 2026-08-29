# Third-party tools, libraries, APIs, and assets

PorsiPas was built for a hackathon. This record makes the prototype's external dependencies and generated assets explicit.

## Product infrastructure

| Tool or service | Use in PorsiPas |
|---|---|
| [Expo](https://expo.dev/) and Expo Go | React Native development, routing, device testing, and temporary demo tunnels |
| [Supabase](https://supabase.com/) | Anonymous authentication, Postgres database, Storage, Realtime, Row Level Security, and server-side RPCs |
| [GitHub](https://github.com/) | Private source-code hosting and team collaboration |
| Native Android/iOS share sheet | Optional privacy-safe rescue and profile sharing |

## Main open-source libraries

| Library family | Use in PorsiPas |
|---|---|
| React and React Native | Mobile user interface |
| Expo Router and React Navigation | File-based routes, stacks, and tabs |
| `@supabase/supabase-js` | Mobile-safe Supabase client |
| `react-native-maps` | FoodDrop map and pickup-point selection |
| `react-native-qrcode-svg` | Host QR rendering |
| Expo Camera | Physical QR scanning |
| Expo Location | Foreground-only distance sorting and watch-point selection |
| Expo Image Picker | Host FoodDrop photography |
| Expo Notifications | Local/foreground notification baseline; remote push is not claimed in Expo Go |
| AsyncStorage | Device-local mobile state |
| TypeScript, ESLint, and Expo Doctor | Static checks and project validation |
| `@expo/ngrok` | Temporary Expo tunnel support during testing and demonstration |

Exact package names and versions are recorded in `mobile/package.json` and `mobile/package-lock.json`. Each dependency remains subject to its own licence and terms.

## Generative AI disclosure

- OpenAI Codex was used as an engineering assistant for implementation, documentation, debugging, and test orchestration. Human team members selected the product direction, reviewed changes, operated external services, and performed physical-device acceptance tests.
- PorsiPal's neutral and success images were generated specifically for PorsiPas with OpenAI ImageGen. No reference image, commercial character, stock illustration, logo, or watermark was supplied. Full generation provenance is in `mobile/assets/porsipas/README.md`.

## Data and content

- PorsiPas uses no external training, food, location, emissions, or behavioural dataset.
- The NUS campus fallback is a static approximate map centre used only when foreground location is unavailable.
- FoodDrop photos and descriptions are supplied by prototype users. They are not bundled datasets.
- The challenge brief PDF in the repository was supplied by the hackathon organisers and is retained as reference material.
- PorsiPas reports verified portions rescued. It does not convert them into kilograms, emissions, money, or nutritional estimates.

## Original project work

The PorsiPas product concept, workflow, application code, database migrations, written submission materials, and mascot direction were produced for this hackathon by the team with the assistance disclosed above.
