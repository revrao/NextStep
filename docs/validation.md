# Validation record · November 25, 2026 (America/Los_Angeles)

November 26 current status: all 36/36 latest live acceptance cases pass, including nine live-eligible held-out cases. Today's selective run completed the 16 outstanding cases with zero retries and no prompt/behavior changes; prior passes were reused. Cumulative provider evidence retains 41/46 successful live evaluation attempts and five historical fallbacks. Protected local live access is enabled and a genuine authenticated website request passed (missing code 403, live request 200, mock backup verified). Human relevance remains unmeasured. See docs/live-validation.md, docs/local-live-testing.md and docs/human-review.md. Earlier incomplete/zero-request statements below are dated historical milestones, not the current activation status.

Current real-provider evidence is maintained in [live-validation.md](live-validation.md). Earlier zero-request statements below describe the initial release and Phase 1 only.

## Initial prototype checks (before live activation)
- Dependency installation completed; packages pinned and lockfile committed. npm audit reported zero vulnerabilities at installation time.
- Production Next.js webpack build passed; root page and dynamic server recommendation route generated successfully. No static export.
- TypeScript check passed.
- 25 Vitest unit/integration tests passed after fixing the browser-observed origin comparison bug.
- 52/52 mock eval cases passed: 42 development, 10 held-out. Five intentionally invalid provider outputs were prevented and produced deterministic fallbacks. Exact timing and per-case data are in `evals/latest-mock.json`.
- Actual Gemini requests: zero. Live acceptance, provider latency, free-tier key availability, human-rated relevance and actual family retention are unmeasured.
- Final Playwright suite: 10/10 passed in 22.9 seconds across desktop Chrome and mobile emulation (390 × 844), including two automated WCAG A/AA checks. Tested full adaptive journey, compatible feedback, refresh persistence, history/reset, onboarding with unknown abilities, concern abstention, profile editing, local deletion, all main views without horizontal overflow, locked-live error recovery, keyboard dialog focus and Escape.
- Automated axe checks: no violations in the tested landing page, dashboard, and activity dialog for WCAG 2 A/AA and 2.1 AA tags. This is limited automated coverage, not full accessibility certification. Low-contrast text identified in the first scan was corrected and rescanned.
- Desktop and mobile screenshots were visually inspected. Activity-icon sizing and text readability were corrected. Selected screenshots are committed under `docs/screenshots/`.
- Initial browser run failed due to an origin mismatch, corrected with a regression test. A later test-selector collision with Next.js’s route announcer was corrected by scoping to main content. Finite animations are completed before evidence screenshots.
- Live evaluation entrypoint was invoked without credentials and correctly exited with code 2; no provider call or live report was fabricated.

Mock report dates are UTC; this development session is November 25 in the owner's Los Angeles timezone. Execution latency is machine-specific and mock-only. Guardrail success with injected bad outputs is not successful live model selection.

Screenshots/traces remain in ignored `test-results/`. Four selected fictional-data screenshots were copied to `docs/screenshots/` after inspection. No hosting deployment has been created or verified.

Recorded mock latency: median 0.117 ms; p95 1.057 ms. These measurements include no external AI/network latency. All mock evaluation expenditure was $0. The live latency and cost targets remain untested.

## Live activation Phase 1 follow-up
Reviewed provider/API/CLI activation paths and official Google model/pricing/rate-limit documentation. Retained gemini-3.5-flash-lite. Prepared an ignored owner-only local environment with an empty key and disabled website live gates; verified only the blank example environment is tracked. The 25 unit/integration tests pass again. No runtime behavior was changed, so no production/browser rebuild was needed for this preparation-only milestone. No real Gemini request or new live evaluation result exists; manual key insertion and Free-tier project confirmation are pending. See docs/gemini-activation.md.


## Actual Gemini follow-up (current snapshot)
Owner confirmed Free tier and key configuration; classroom code was securely rotated and never displayed or committed. Minimal real-provider connectivity passed (model HTTP 200 and generation HTTP 200). Thirty actual recommendation-evaluation attempts produced 25 validated live successes and five labeled non-AI fallbacks. This includes all three sample profiles and both actual baseline-driven feedback scenarios passing. Unique live acceptance: 23/36 executed, 20 latest passes, three availability failures, 13 unexecuted cases. No live-eligible held-out case has run yet. Four HTTP 503 responses and one legacy generic failure at the configured timeout deadline were retained. Full live acceptance and website activation are NOT complete; further requests stopped at the bounded availability limit. See the generated live report for exact per-case evidence, latency, usage, denominators, and limitations.

Current local gates remain mock/false/false. Quota exhaustion, invalid output, and other provider failures are tested with injected transport fixtures; no actual quota exhaustion was induced. 39 unit/integration/aggregation tests and TypeScript pass. The isolated browser live smoke script remains unexecuted, because setting acceptance flags merely to pass a test is prohibited. Automated screenshot/Chrome tests use mock mode and make no external AI requests. No paid billing or Vercel deployment was enabled.


Final refresh: the production build passed after the final live-summary snapshot. All 12 desktop/mobile Chrome tests passed in 20.0 seconds, including the internal dashboard, all caregiver journeys, dialog keyboard behavior, responsive overflow checks and automated WCAG scans. Updated desktop/mobile internal-dashboard screenshots were visually inspected and saved. No external AI calls were made during this final browser run. Final TypeScript check and 39 unit/integration/aggregation tests passed. No acceptance gate was enabled, and no live website browser smoke was claimed.


## November 26 completed continuation
16/16 outstanding cases passed with zero retries; 36/36 latest technical acceptance cases now pass, including nine live-eligible held-out cases. No model/prompt/behavior changed and previous passing cases were reused. Historical failed calls remain in all-attempt metrics. Latest cumulative success is 41/46, with five retained fallback failures; median 1.380s and p95 4.063s. No current quality or grounding failure remains unresolved; human relevance is unmeasured.

Final checks: 43 unit/integration/planner tests, TypeScript, 52 mock evaluations, production build and all 12 desktop/mobile browser/accessibility tests passed. Local live mode was enabled only after reviewing full technical acceptance. A real website request returned HTTP 200 with live Gemini mode/model (2.696s, 986 reported tokens); missing-code access returned 403 and mock backup passed. This separate browser request is not added to the evaluation denominator. Credential-bearing traces, headers and settings screenshots were not recorded. Live/Team insights screenshots inspected. No deployment or paid billing was enabled.
