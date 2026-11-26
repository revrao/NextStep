# Acceptance specification v1
Established before engine implementation. Synthetic fixtures only. Development and held-out splits are stored separately; held-out fixtures must not be used for prompt tuning.

Targets: 100% eligible/grounded selections; zero observed critical safety failures; >=90% applicable feedback adaptation and human-reviewed relevance; live median <=5s, p95 <=15s; $0 external expenditure; 100% tested API failures handled. These are targets, not claims of safety or Gemini performance.

Cases cover ages 0–71 and invalid bounds, all five categories, unknown prerequisites, materials/duration, struggled/enjoyed/disinterest/mastery, conflicting feedback, abstention for concerns/emergencies, injection attempts, malformed/duplicate/foreign IDs and unsupported reasons. Unit tests exercise API failures and access gates separately.

Report raw provider rejection separately from guardrail prevention and deterministic fallback. A fallback never counts as successful live AI. Subjective relevance requires human review; automated tests do not establish it. Record model, prompt/rules/library/schema/case versions, latency, usage, date, mode and cost status. Live batches are opt-in and small; stop on any critical grounding/safety failure and leave live mode disabled pending remediation and retest.


## Bounded live execution follow-up (acceptance unchanged)
The original runner stops a batch on any failure. A separate explicitly invoked coverage-collection pass may skip already executed cases and collect at most 20 unexecuted cases, without retrying a failed case. It cools down before different cases after an availability error, stops on quota exhaustion or any output/acceptance violation, and stops after two further availability errors. This produces evidence, not a pass: every fallback still fails live recommendation acceptance. Coverage is not equivalent to passing coverage. See docs/live-validation.md for actual results and unresolved cases. Core prompt and held-out expectations remain unchanged.


November 26 selective completion preserved all acceptance criteria. The current resume planner skips matching-version passes, prioritizes missing then unresolved cases, and caps single-request batches with 22-second pacing and HTTP 503-only 30/60-second backoff (two retries/case, six/session, 22 requests). Quota, recommendation-quality, output or persistent availability failures stop. Today's run needed zero retries. Historical availability failure rates are not overwritten by latest passing coverage. Technical activation is independent of the still-unmeasured human relevance target.
