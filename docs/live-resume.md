# Resume live validation after service availability improves

The current run intentionally stopped after repeated HTTP 503 responses. No API key change, paid billing, automatic model switching, or acceptance relaxation is required. Mock mode remains usable. Live website access stays disabled.

## Actual remaining coverage
Latest failed cases (provider HTTP 503, not invalid activity selections):

- `focus-cognitive` — live offset 15. A later deliberate single recheck is `npm run eval:live -- --limit=1 --offset=15`. This consumes one new request and preserves earlier failures.
- `unknown-abilities` — live offset 17. A later deliberate single recheck is `npm run eval:live -- --limit=1 --offset=17`. This consumes one new request and preserves earlier failures.
- `enjoyed` — live offset 22. A later deliberate single recheck is `npm run eval:live -- --limit=1 --offset=22`. This consumes one new request and preserves earlier failures.

Unexecuted cases:

- `not-interested` — offset 23.
- `single-mastery` — offset 24.
- `supported-mastery` — offset 25.
- `same-day-mastery` — offset 26.
- `held-age-2` — offset 27.
- `held-age-9` — offset 28.
- `held-age-21` — offset 29.
- `held-age-33` — offset 30.
- `held-age-47` — offset 31.
- `held-age-59` — offset 32.
- `held-age-70` — offset 33.
- `held-combined-constraints` — offset 34.
- `held-unknown-mastery` — offset 35.

## Controlled continuation
Only run new calls after reviewing service availability and remaining project quota. Prefer small explicit batches with `npm run eval:live -- --limit=3 --offset=23` for the next unexecuted case, then subsequent offsets, stopping again on failure. `scripts/check-remaining-live.ts` can collect a finite pass over only unexecuted cases, capped at 20 requests, with no failed-case retries; it stops at quota/output violations or two availability failures. Do not launch both approaches concurrently or run them continuously. The original failed calls must stay in reports and in attempt-based success/fallback/latency metrics.

Run `npm run eval:summary` without external requests to update the aggregate, evidence document and internal dashboard snapshot, then rebuild. Compare full latest unique-case coverage with retained failure history. Existing profile and feedback evidence need not be rerun just to improve the score. Human-rated relevance remains separate and unmeasured.

Only after the complete technical acceptance coverage is legitimately reviewed and fault-injection tests still pass may local `AI_MODE=live` and `LIVE_EVAL_PASSED=true` be set. Keep hosted protection false and do not deploy. The isolated `scripts/check-live-browser.ts` then performs one real local UI request without traces/header dumps/settings screenshots and checks mock backup. It is currently unexecuted; a prepared script is not validation evidence.

## Availability interpretation
Google documents HTTP 503 UNAVAILABLE among transient errors for bounded backoff: https://aistudio.google.com/docs/troubleshooting#retry-strategy. This run recorded response status codes, not an independently confirmed global incident or precise internal root cause. Do not claim quota exhaustion or solve 503 responses by enabling paid billing. All current explicit retries are bounded and retained; the coverage-only pass never converts a fallback into a successful Gemini response.
