# Behavior changelog

## v1 · November 25, 2026
Version bundle: prompt-v1, schema-v1, rules-v1, library-v1, cases-v1.

Initial release: structured fictional profiles, 40 unreviewed activities, deterministic candidate filtering, feedback-conditioned ranking, conservative mastery gate, unknown-prerequisite abstention, concern/emergency stops, Gemini JSON ID/code selection, reason-reference validation, and explicit labeled fallback. Instructions remain fixed library content. Voice is warm, encouraging, nonjudgmental, concise, conservative about uncertainty, and respectful of caregiver choice.

Measured acceptance: 52/52 mock cases (42 development, 10 held-out); 5 adversarial provider outputs prevented and converted to fallback. No actual Gemini results. Automated relevance assertions are narrow rule checks, not 90% human-reviewed personalization evidence. See `evals/latest-mock.json` for exact execution metadata.

Browser QA identified an internal Next.js URL versus original Host discrepancy in origin validation. The API now compares the browser origin's host to the actual Host header, preserving cross-origin rejection; a regression test covers the internal-URL case. Caregiver-facing text sizes were increased during rendered review.

## Improvement process
Caregiver usage → structured feedback → recommendation failure identification → new development evaluation cases → reviewed rule/prompt changes → re-evaluation, including untouched held-out coverage. This describes a proposed human-reviewed data flywheel. No automatic learning, prompt rewriting, or data upload is implemented. Refresh held-out cases independently when an evaluated version is promoted or existing cases become tuning inputs.


## Live validation and report-format v2 · November 25, 2026
Prompt-v1/schema-v1/rules-v1/library-v1 are unchanged: no acceptance threshold, candidate eligibility, progression rule, or held-out fixture was relaxed. Added sanitized transport error categories, provider-reported model version, optional total/thinking/cache usage, and retained usage on rejected model JSON. These are diagnostics changes, not new model instructions.

Bounded live runners cap batches at three, pace requests by 22 seconds, stop on failure/quota, and never retry automatically. Actual live sample profiles and baseline-driven enjoyed+struggled/disinterest scenarios are separate scopes. The aggregate excludes incompatible model/version reports, keeps failed attempts/rechecks in rate and latency denominators, and deduplicates only latest acceptance coverage. The internal Team insights view replaces the previous mixed mock-only presentation without changing the caregiver design. Actual results and unresolved coverage are regenerated in docs/live-validation.md. Human relevance remains unmeasured.

The exposed classroom code was rotated in local ignored configuration. No credential value was displayed, stored in reports or committed. Website activation still requires completed reviewed technical live coverage and access gates; no hosted protection flag was enabled.


Final measured outcome of this run: 25/30 live recommendation attempts succeeded; five non-AI fallbacks remain in denominators (four HTTP 503 responses and one legacy generic failure at the 12-second deadline). Unique live coverage is 23/36 executed and 20 latest passes; three latest availability failures and 13 unexecuted cases, including all nine live-eligible held-out cases, remain. The finite coverage-only pass reached its explicit availability stop. All three sample profiles and both actual feedback journeys passed. No prompt/eligibility/acceptance threshold changed. Website live gates remain disabled; the isolated real-browser smoke remains unexecuted. Final local checks: production build, TypeScript, 39 unit/integration/aggregation tests, 52 mock evals, and 12 desktop/mobile browser/accessibility checks pass. Exact usage and latency are in the generated live report.

## Selective live continuation · November 26, 2026
Added an evaluation-only resume planner: missing cases first, then unresolved cases; prior passing cases are not repeated when model/prompt/rules/library match. HTTP 503 backoff is capped at 30/60 seconds, two retries per case, six per session and 22 requests. Quota or recommendation-quality/guardrail failures stop immediately. All attempts retain their original outcomes and usage. No model prompt, recommendation behavior, eligibility constraint, safety rule, acceptance threshold or held-out fixture changed. Technical readiness and human-reviewed relevance remain separate. Actual final results are regenerated in docs/live-validation.md; local activation is conditional on reviewed technical completion and regressions.


November 26 completion: the 13 missing cases and three unresolved cases passed in 16 requests with no retries. Latest unique acceptance is 36/36, including nine live held-out cases; the tenth held-out fixture remains a pre-provider concern abstention and passes locally. All previous failures remain; cumulative success is 41/46 with five fallback failures. Model/prompt/schema/rules/library and acceptance criteria are unchanged. Enabled code-protected local live mode only after complete technical coverage, passing 43-test regression suite, 52 mock evals, TypeScript and production build; a real local browser request verified genuine Gemini response and mock backup. No hosted flag or deployment was enabled. Human relevance remains unmeasured.


## Access-flow v2 · November 26, 2026
Explicit same-origin server-verified Unlock Live AI and Enter submission replace implicit use of a password field. Native form data supports autofill that did not update React state. Locked/checking/unlocked feedback, manual locking, actionable mismatch/configuration errors, memory-only verified-code retention and revocation handling are implemented. POST /api/live-access uses the same constant-time authorization/configuration guards as recommendations and never calls Gemini. Every recommendation still checks server state, code, access restrictions and quota control. No prompt/schema/rules/library/evaluation acceptance version changed; full live acceptance remains valid and was not unnecessarily rerun for this authentication UX fix.
