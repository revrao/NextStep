# Live Gemini validation · actual measured evidence

Generated 2026-11-26T23:11:35.433Z (UTC). Model: gemini-3.5-flash-lite. Version bundle: prompt-v1, schema-v1, rules-v1, library-v1. Report format: v2. Synthetic fictional profiles only.

## Status and coverage
Technical live acceptance coverage is complete. Human-reviewed relevance has not been measured. No claim of clinical validation or real-family engagement is made.

- Unique live acceptance cases executed: 36/36; latest passing: 36/36.
- Held-out live cases executed: 9. Held-out cases have not been used for prompt tuning.
- Sample-profile attempts: 3/3 passed (sample-milo, sample-luna, sample-robin).
- Actual feedback-journey steps: 2/2 passed. Their baseline activity was selected by a real prior Gemini sample request, not a hardcoded mock sequence.
- Unexecuted acceptance cases: none.
- Unresolved latest failures: none.

## Live outcomes (all attempts, not just passing rechecks)
41/46 successful live recommendation attempts (89.1%). 5/46 deterministic non-AI fallbacks (10.9%). 4 classified provider transport/availability failures, 1 legacy unclassified failures, and 0 invalid model outputs prevented. A fallback never counts as Gemini success. Compatible reports include samples and feedback journeys, in addition to the acceptance suite; unique acceptance coverage is reported separately.

Latency across all 46 attempts, including timeouts/failures and excluding deliberate pacing: median 1.380 s, p95 4.063 s. Successful-response-only median 1.398 s, p95 3.355 s. Targets remain median <=5 seconds and p95 <=15 seconds. These small-sample engineering measurements do not predict production uptime or latency.

Reported usage: 38936 input, 4847 output, 0 thinking; 43783 total tokens accounted for, across 41/46 attempts with usage metadata. Missing timeout/error usage is unknown, not a zero-token claim. Estimated API cost: $0.00 under the owner-confirmed unbilled Free tier; this is not an independent billing audit. No paid billing, provider switching, paid tools, or Vercel deployment was enabled.

Connectivity smoke (separate from recommendation denominators): passed; model HTTP 200, generation HTTP 200, 6 total tokens. Model-reported versions in recommendation evidence: gemini-3.5-flash-lite.

## Protected local activation and website verification
Local live enabled: yes, with the classroom access code required. Hosted protection flag remains false; no deployment is authorized. Actual browser smoke: passed; unauthenticated HTTP 403, authenticated HTTP 200, result mode live, mock backup mock. Browser request latency 1.679 s, reported total tokens 986. Browser/connectivity requests are excluded from recommendation-evaluation denominators. Credentials are not present in reports or screenshots. Private manual testing: docs/local-live-testing.md.

## Deterministic and injected guardrail evidence
Mock acceptance 52/52; invalid provider-output fixtures safely blocked 5/5; invalid input rejections 7/7; expected abstentions 4/4. These tests do not involve actual unsafe Gemini output. Unit/integration tests separately inject HTTP 429/500/503, malformed JSON, blocked/truncated output and timeouts without consuming live quota.

## Observed failures and limitations
Historical availability failures remain in immutable batch files and attempt/latency denominators, even after a passing recheck. The November 25 session included four HTTP 503 responses and a legacy generic failure at the configured ~12-second deadline. The legacy diagnostic remains unclassified rather than being relabeled after the fact. The exact provider/network root cause was not independently established.

On November 26, continuation selects only missing or unresolved cases from matching model/behavior versions. Single-request batches retain 22-second pacing. Only HTTP 503 may receive bounded exponential backoff (30 then 60 seconds), at most two retries per case, six retries and 22 requests per resumed session. Quota, recommendation-quality, output-validation or persistent availability failures stop the session. Every retry is a separate measured attempt; no previously passed case is repeated merely to improve the score. No prompt, eligibility rule, safety constraint or held-out expectation has been weakened. Current unresolved cases are listed above; historical failures below do not imply those cases remain unresolved.


Failure history: age-6 (provider_or_schema_failure), age-11 (provider_http_503), focus-cognitive (provider_http_503), unknown-abilities (provider_http_503), enjoyed (provider_http_503).

Human review checklist: docs/human-review.md. Protected local manual test instructions: docs/local-live-testing.md.

Raw batches: evals/live/*.json. Aggregate: evals/live-summary.json. Mock: evals/latest-mock.json. Connectivity: evals/connectivity-live.json. Regenerate with npm run eval:summary; rebuild the app to refresh the imported internal dashboard snapshot. Relevance ratings require a real human review and remain unmeasured. All content remains professionally unreviewed classroom material.
