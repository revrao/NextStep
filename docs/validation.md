# Validation record · November 25, 2026 (America/Los_Angeles)

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
