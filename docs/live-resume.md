# Live evaluation continuation status · November 26, 2026

All 36 latest acceptance cases now pass, including the nine live-eligible held-out cases. Today's selective continuation ran only the 13 previously unexecuted cases and three unresolved cases: 16/16 passed, with no retries. Prior passes were reused; historical failures were not removed. There are no outstanding technical acceptance offsets.

The tenth held-out fixture is a concern-abstention case verified locally without making an external provider request. Full mock, unit, eligibility, grounding, access-control and failure-handling checks remain separate from live provider outcomes. Human relevance remains unmeasured.

`npm run eval:resume` is now a no-op for external calls while model/prompt/rules/library and passing coverage remain unchanged. For a future deliberately resumed incomplete run it prioritizes missing cases then unresolved ones, paces single-request batches by 22 seconds, retries HTTP 503 only with 30/60-second backoff, and caps retries at two/case and six/session plus 22 requests. Quota, quality/guardrail or persistent availability failure stops the session. Do not run parallel/continuous retries or repeat successful cases to improve metrics. A behavior/model change needs an explicit full evaluation plan rather than the capped selective continuation.

Protected local live AI is enabled after full technical review, and authenticated browser verification passed. Follow [private local testing instructions](local-live-testing.md) and the [human-review checklist](human-review.md). The existing rotated classroom code stays local; never display it in chat, logs, Git or presentation screenshots. Hosted protection remains false and Vercel deployment is not authorized.

Evidence: [measured report](live-validation.md), `evals/live-summary.json`, immutable `evals/live/*.json`, session plans in `evals/sessions/`, archived connectivity checks in `evals/connectivity/`, and actual browser verification in `evals/browser/`. Latest passing coverage is distinct from cumulative provider reliability: earlier timeouts/503s remain real failed live attempts with labeled fallback.
