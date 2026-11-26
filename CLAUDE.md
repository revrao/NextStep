# NextStep engineering guidance

Read `PROGRESS.md`, `README.md`, and `SPEC.md` before continuing. This repository is exclusively `https://github.com/revrao/NextStep`; do not change other repositories or hosting projects. `CLAUDE.md` mirrors these instructions.

## Working contract
- Work autonomously within the supplied specification. Keep a functional mock journey available without keys. No paid services, billing, deployments, force pushes, branch deletion, or unrelated changes.
- The owner must create the initial separate Vercel project. Never modify Procurement Audit Planner or Netlify Community Hub.
- Use fictional data exclusively; do not commit secrets, `.env.local`, private course materials, generated builds, or browser traces.
- Commit validated milestones and push to origin when authorized; record blockers honestly rather than inventing success.

## Architecture
Next.js App Router + React + TypeScript + Tailwind, pinned npm dependencies and lockfile. Use Node 22.9+ or 24. webpack avoids observed sandbox worker-bind issues. `src/lib/engine.ts` owns rules independent of UI. `src/lib/gemini.ts` owns transport. The API is server-only; never expose secrets with NEXT_PUBLIC variables. Zod validates inputs, stored data, and provider outputs. Activity instructions always originate in the local library.

## Safety invariants
No diagnosis, clinical scores, treatment, milestone comparisons, or inferred prerequisites. All content is unreviewed demo content; only four idea adaptations have verified UNICEF links. Never fabricate review, attribution, field data, interviews, evals, cost, or Gemini performance.

Keep concern/emergency abstention before provider calls. Strict candidate ID/reason/reference checks and deterministic fallback stay enabled. A fallback is not a live success. Enjoyed + struggled is compatible; mastered + struggled and enjoyed + not-interested are not. Struggle simplifies; disinterest changes format; progression needs repeated supporting observations and explicit prerequisites.

Live remains locked unless credentials, a >=16-character classroom code, reviewed live acceptance, and hosted external protection are present. In-memory rate limits are not durable global controls. Public Hobby deployments should remain mock-only if adequate free protection is unavailable. Never set protection/evaluation flags merely to make a test pass.

## Validation and continuity
Run `npm run typecheck`, `npm test`, `npm run eval:mock`, `npm run build`, and `npm run test:e2e` for relevant behavior changes. Browser tests use Chrome on macOS and Chromium elsewhere. Rebuild before production browser tests. Inspect representative desktop/mobile screenshots, not just compile output. If a change is documentation-only, avoid unnecessary builds.

Evaluation splits: 42 development cases and 10 held-out cases in versioned files. Do not tune prompts against held-out examples. Preserve raw provider failure/fallback distinctions. `npm run eval:live -- --limit=3 --offset=0` needs an unbilled key and is a partial batch, never full acceptance. Never automatically enable live after mock tests. Keep prompt/schema/rules/library/cases/report versions and `docs/behavior-changelog.md` synchronized. Update progress, evidence, and AI-use log with actual work and remaining limitations. No automatic prompt self-modification.


## Live validation continuity
The key is configured locally and the owner confirmed unbilled Free tier. Never print, commit, screenshot, or open the local credential file for presentation. The classroom code was rotated after an exposed screenshot. Keep `.env.local` ignored and mode 0600. November 26 technical acceptance is complete (36/36 latest passes, including nine live-eligible held-out cases). Protected local live mode is enabled and real-browser verified; historical HTTP 503 failures remain in evidence. Read `docs/live-validation.md` and `docs/live-resume.md` before any more evaluation requests; do not repeat prior passes unnecessarily.

`npm run eval:summary` is offline and updates live aggregate JSON, dashboard snapshot, and the measured report. Aggregation includes failed attempts/rechecks in rates and latency and uses latest compatible cases only for unique coverage. `scripts/check-remaining-live.ts` is an explicitly bounded coverage-only pass, never an automatic failed-case retry. Stop on quota/output/safety issues; do not change thresholds to enable live. Local gates were enabled only after full technical coverage, passing regressions/build, and successful authenticated browser verification. Keep hosted protection false. Human relevance is unmeasured; use docs/human-review.md for actual ratings. The selective npm run eval:resume skips prior passes and retries only HTTP 503 with bounded 30/60-second backoff, two retries/case, six/session, 22 requests. Do not create a deployment or enable paid billing to resolve service availability.


## Explicit live access flow
Settings now requires the server-verified Unlock Live AI button or Enter. POST /api/live-access validates the same constant-time code/configuration/hosted guards as recommendations and never invokes Gemini. Native form data reads the visible field, including autofill without React events. Draft/verified codes remain only in root-component memory; never add local/session storage or cookie persistence. Navigation retains verified state, but editing/locking/mode changes/reload/rejection invalidate it; ignore stale in-flight verification. Every recommendation rechecks the server and uses only the verified code header. Keep mismatched-code versus missing/disabled-config errors distinct, actionable, and secret-free. Browser regressions use explicit fixture credentials; real-code checks must use the trace-free standalone script with no credential settings screenshots. No model or acceptance criteria changed for this access-flow fix.
