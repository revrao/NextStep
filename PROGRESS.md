# NextStep progress

## Status
Foundation in progress. Repository verified: clean main at c8dab33, origin https://github.com/revrao/NextStep.git. No pre-existing application.

## Plan
1. Foundation: Next.js, versioned specification, acceptance cases, safety architecture.
2. Core: fictional onboarding, 40 synthetic library activities, constrained recommendations, feedback, Gemini adapter.
3. Supporting: history, local settings/deletion, instrumentation and insights.
4. Validation: unit/adversarial evals, production build, desktop/mobile browser journeys.
5. Delivery: deployment/evidence/handoff docs, GitHub synchronization.

## Decisions
- No deployment; owner creates a separate Vercel project after review.
- Mock default, no paid services. Live server endpoint fails closed until classroom access and acceptance gate are configured.
- Library is original synthetic, unreviewed demonstration content. No source or clinical endorsement is claimed.
- No free-form caregiver text is sent to Gemini; model selects IDs and validated reason codes only.

## Blockers
No Gemini credentials supplied; live model evaluation cannot be performed. Continue full mock implementation and transport tests.

## Core milestone (November 25, 2026)
Implemented Next.js/React/TypeScript/Tailwind app, warm responsive UI with original SVG illustrations, fictional onboarding and 3 samples, profile editing/switching, dashboard/library/detail dialogs, structured compatible feedback, adaptive ranking, persistent history, local settings/deletion and local insights.

Engine: strict Zod input/output schemas; age/focus/material/time/prerequisite checks; same-skill simplification; format avoidance; three supporting mastery observations over >=2 dates before level 3. Server-only Gemini REST adapter, 12-second timeout, no retries, minimized structured context, constrained reasons, candidate verification and explicit fallback. Live access fails closed without code, credentials, acceptance gate, and hosted protection attestation. In-memory rate limit is supplemental only.

Content: 40 unreviewed demo activities. Four original adaptations of verified UNICEF ideas; 36 synthetic fixtures. All metadata rules remain implementation assumptions. No clinical review claimed.

Validation so far: production build passes with webpack; 24 unit/integration tests pass; 52 mock cases pass (42 development, 10 held-out), including 5 injected provider failures safely falling back. No actual Gemini requests or subjective human review. Browser verification pending.

Environment decision: Turbopack's worker port binding fails under this sandbox even after escalation; webpack builds successfully. Package versions pinned and lockfile included.
