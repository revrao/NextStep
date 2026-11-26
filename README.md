# NextStep

**Small steps. Meaningful progress.** A functional educational prototype of feedback-informed developmental activity selection for caregivers of fictional children ages 0–5 (0–71 months). Prepared for a UCLA Anderson Product Management classroom demonstration. Not clinical guidance; no real child data.

## Run locally

Use Node 22.9+ or 24 LTS and npm. Dependencies are pinned; use the committed lockfile.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No API key is required. Select **Explore with fictional Milo**, then **Find activities**. The entire feedback journey works in labeled mock mode. Data persists in this browser; Settings deletes or resets it. Production: `npm run build` then `npm start`.

## Validate

```sh
npm run typecheck
npm test
npm run eval:mock
npm run build
npm run test:e2e
```

Browser tests run against the production build. On macOS they use installed Google Chrome; on Linux install the free Chromium runtime once with `npx playwright install chromium`. Do not run browser tests against an outdated build. Screenshots/traces are in ignored `test-results/`.

Recorded results and limitations: [validation](docs/validation.md) and [live Gemini evidence](docs/live-validation.md). Mock results are not Gemini performance evidence. Evals regenerate `evals/latest-mock.json` and the UI's compact `src/data/evaluation-summary.json`; rebuild after changing them.

## Activate Gemini

The owner has configured a key and confirmed an unbilled Free-tier project. Current measured results, including failures and coverage, are in [live validation](docs/live-validation.md). November 26 continuation completed **36/36 latest live acceptance cases**, including **9/9 live-eligible held-out cases**. **Protected local live access is enabled in this owner checkout**, and a real authenticated website request passed. Fresh clones remain mock by default. [Local testing instructions](docs/local-live-testing.md) explain private code entry and fallback. The internal **Team insights** view distinguishes live and mock evidence; human-rated relevance remains unmeasured. Historical failures remain in cumulative metrics; human relevance is unmeasured.

Phase 1 has prepared a local, ignored `.env.local` in this checkout. Follow [the activation handoff](docs/gemini-activation.md) to insert your key manually and confirm the Free tier before testing. Do not overwrite an existing local environment file.

For a fresh clone:

1. Copy `.env.example` to `.env.local` only if it does not already exist. Keep this file out of Git.
2. Create a Gemini Developer API key on a **free-tier, unbilled** Google project. Set `GEMINI_API_KEY`, and retain or verify `GEMINI_MODEL=gemini-3.5-flash-lite`.
3. Leave `LIVE_EVAL_PASSED=false`. Run a small direct provider evaluation: `npm run eval:live -- --limit=3 --offset=0`. This evaluation bypasses the application gate to test the model, but still applies all engine eligibility and output checks. No automatic retries or paid-provider switching occur.
4. Run subsequent small batches with offsets 3, 6, etc., respecting the current free-tier quota. Review all applicable development and held-out results plus the unit guardrail suite. Every live batch is saved under `evals/live/`. A three-case batch is **not** complete acceptance evidence. Any critical failure keeps live mode disabled until fixed and retested. Human relevance review remains separate.
5. After reviewing full acceptance coverage, set `AI_MODE=live`, `LIVE_EVAL_PASSED=true`, and a random `DEMO_ACCESS_CODE` of at least 16 characters. Restart Next.js. In Settings choose Live Gemini and enter the classroom code. The code stays only in memory.
6. On Vercel, live calls additionally require actual hosting-layer deployment protection and `CLASSROOM_DEPLOYMENT_PROTECTED=true`. This variable attests to protection; it does not implement it. If protected production access is unavailable on your Hobby account, leave the public deployment mock-only and demonstrate live AI locally. Do not upgrade or enable billing.

The UI reports the actual result mode: simulated, live Gemini ranking, or deterministic non-AI fallback. Invalid or unavailable AI never gets labeled a successful live recommendation. API keys and nicknames are not sent in model content.

## Deployment

Ready for a **new, separate** NextStep Vercel Hobby project; no deployment has been performed. Full owner instructions: [deployment guide](docs/deployment.md). Import `revrao/NextStep`, production branch `main`, Next.js framework, `npm ci`, `npm run build`, Node 24, and default output settings. Start in mock mode. Never touch Procurement Audit Planner or Community Hub.

## Architecture and evidence

- `src/lib/engine.ts`: eligibility, conservative feedback rules, ranking, output validation, rationale templates.
- `src/lib/gemini.ts` and `src/app/api/recommend/route.ts`: server provider and guarded API boundary.
- `src/data/activities.json`: 40 unreviewed fixtures; 4 verified-source idea adaptations, 36 synthetic scenarios.
- `src/components/`: caregiver experience, onboarding, original SVG illustrations.
- `src/lib/storage.ts`: versioned, validated browser-local usage data; no analytics service.
- `prompts/`, `evals/`, `tests/`: versioned behavior instructions, separate evaluation data, transport/adversarial/unit/browser tests.
- [Architecture and scope](docs/architecture.md), [content provenance](docs/content.md), [risks and guardrails](docs/safety.md), [metrics](docs/metrics.md), [two-minute demo](docs/demo.md), [prototype evidence](docs/prototype-evidence.md), [AI-use log](docs/ai-use-log.md).

Read `SPEC.md` for the complete supplied project request and `PROGRESS.md` for current status. `AGENTS.md` and `CLAUDE.md` provide matching continuation guidance. No production authentication, cross-device sharing, professional content review, real-family trial, or demonstrated Gemini performance is claimed.


## Bounded live evaluation and reporting

- `npm run ai:check`: one model metadata check and one minimal generation smoke request, no retries.
- `npm run eval:live -- --limit=3 --offset=0`: up to three real acceptance calls, 22-second pacing, stop on failure. Maximum batch size is three.
- `npm run eval:live -- --samples --limit=3`: the three fictional sample profiles.
- `npm run eval:feedback`: two follow-up scenarios against an activity chosen in a previously passing real Gemini Milo sample. Stops on failure.
- `npm run eval:summary`: no external requests; regenerates compatible live aggregate, internal dashboard data and the measured live-validation document. Original failed batches remain preserved.

Live website mode remains a separate gated decision. Acceptance results, runtime fault-injection tests, and human relevance are distinct. Never rerun the live commands continuously to obtain a better score. Free-tier 429 exhaustion is a reason to stop, not enable billing. The rotated classroom code is only in the ignored `.env.local`; retrieve it privately for local UI use and never include it in screenshots, logs or Git.


November 26 resume: `npm run eval:resume` selects only compatible missing/unresolved cases, skips passed cases and applies 30/60-second HTTP 503 backoff (max two retries/case, six/session, 22 requests). It makes no provider calls when no cases are pending. No model/prompt change occurred, so the previous passing cases were reused. The [human-review checklist](docs/human-review.md) is the remaining manual relevance assessment; no ratings have been fabricated.
