# ScamGuard AI

ScamGuard AI is an offline-first Expo mobile app for assessing suspicious links and messages, learning current scam patterns, and practicing awareness safely.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/scamguard-ai run dev` — run the Expo mobile preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/scamguard-ai/app/(tabs)/index.tsx` — mobile screens, navigation, and the offline game
- `artifacts/scamguard-ai/src/lib/analyze.ts` — local link and message risk rules
- `artifacts/scamguard-ai/src/context/AppContext.tsx` — AsyncStorage-backed history, trends, and connectivity state
- `artifacts/scamguard-ai/src/data/scams.ts` — locally stored scam-trend database
- `artifacts/api-server/src/routes/scam-trends.ts` — trusted-backend trend update endpoint
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

- Scans run locally first so link and message assessment, history, and the game continue to work without internet.
- Screenshot selection is real through the phone gallery, but the UI explicitly reports when OCR/image analysis is unavailable instead of inventing a result.
- Scam trends use a local fallback and a generated API hook for a trusted backend refresh; offline state is always visible.
- Scan history is capped at the 50 most recent items and stored only on-device with AsyncStorage.

## Product

- Home quick checks for links, messages, screenshots, current trends, history, and ScamGuard Bird.
- Local risk levels and reasons for suspicious indicators, with safety guidance and official reporting links.
- Expandable scam-trend advisories for digital arrest, investment, fake jobs, phishing, fake KYC, messaging, APK, RTO, courier, support, UPI, refund, and AI impersonation scams.
- Cyber Crime Helpline 1930 and the official cybercrime.gov.in portal are available from the emergency section.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
