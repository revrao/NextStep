# Live Gemini validation · actual measured evidence

Generated 2026-11-26T05:44:06.769Z (UTC). Model: gemini-3.5-flash-lite. Version bundle: prompt-v1, schema-v1, rules-v1, library-v1. Report format: v2. Synthetic fictional profiles only.

## Status and coverage
Technical acceptance is incomplete; keep website live gates disabled. Human-reviewed relevance has not been measured. No claim of clinical validation or real-family engagement is made.

- Unique live acceptance cases executed: 23/36; latest passing: 20/36.
- Held-out live cases executed: 0. Held-out cases have not been used for prompt tuning.
- Sample-profile attempts: 3/3 passed (sample-milo, sample-luna, sample-robin).
- Actual feedback-journey steps: 2/2 passed. Their baseline activity was selected by a real prior Gemini sample request, not a hardcoded mock sequence.
- Unexecuted acceptance cases: not-interested, single-mastery, supported-mastery, same-day-mastery, held-age-2, held-age-9, held-age-21, held-age-33, held-age-47, held-age-59, held-age-70, held-combined-constraints, held-unknown-mastery.
- Unresolved latest failures: focus-cognitive, unknown-abilities, enjoyed.

## Live outcomes (all attempts, not just passing rechecks)
25/30 successful live recommendation attempts (83.3%). 5/30 deterministic non-AI fallbacks (16.7%). 4 classified provider transport/availability failures, 1 legacy unclassified failures, and 0 invalid model outputs prevented. A fallback never counts as Gemini success. Compatible reports include samples and feedback journeys, in addition to the acceptance suite; unique acceptance coverage is reported separately.

Latency across all 30 attempts, including timeouts/failures and excluding deliberate pacing: median 1.545 s, p95 3.355 s. Successful-response-only median 1.586 s, p95 3.171 s. Targets remain median <=5 seconds and p95 <=15 seconds. These small-sample engineering measurements do not predict production uptime or latency.

Reported usage: 22259 input, 2942 output, 0 thinking; 25201 total tokens accounted for, across 25/30 attempts with usage metadata. Missing timeout/error usage is unknown, not a zero-token claim. Estimated API cost: $0.00 under the owner-confirmed unbilled Free tier; this is not an independent billing audit. No paid billing, provider switching, paid tools, or Vercel deployment was enabled.

Connectivity smoke (separate from recommendation denominators): passed; model HTTP 200, generation HTTP 200, 6 total tokens. Model-reported versions in recommendation evidence: gemini-3.5-flash-lite.

## Deterministic and injected guardrail evidence
Mock acceptance 52/52; invalid provider-output fixtures safely blocked 5/5; invalid input rejections 7/7; expected abstentions 4/4. These tests do not involve actual unsafe Gemini output. Unit/integration tests separately inject HTTP 429/500/503, malformed JSON, blocked/truncated output and timeouts without consuming live quota.

## Observed failures and limitations
The first age-6 attempt fell back at the unchanged ~12-second timeout deadline with a legacy generic diagnostic code; one bounded recheck passed. That legacy diagnostic remains unclassified in the category counters rather than being relabeled after the fact. The first age-11 attempt received HTTP 503; one bounded recheck after cooldown passed. Root cause inside Google's service or the network was not independently established. Original failures remain in immutable batch files and rate/latency denominators. A later focus-cognitive request also returned HTTP 503 and remains failed unless separately rechecked. The initial continuation stopped. A separate single pass collects only unexecuted cases (maximum 20), never retries a failed case, and stops on quota/output/acceptance failure or two further availability failures. This changes coverage collection only; fallback results remain failed live recommendations and all acceptance assertions stay unchanged. No safety threshold, eligibility rule, prompt or held-out expectation was weakened to improve scores.

Failure history: age-6 (provider_or_schema_failure), age-11 (provider_http_503), focus-cognitive (provider_http_503), unknown-abilities (provider_http_503), enjoyed (provider_http_503).

Raw batches: evals/live/*.json. Aggregate: evals/live-summary.json. Mock: evals/latest-mock.json. Connectivity: evals/connectivity-live.json. Regenerate with npm run eval:summary; rebuild the app to refresh the imported internal dashboard snapshot. Relevance ratings require a real human review and remain unmeasured. All content remains professionally unreviewed classroom material.
