# Prototype evidence summary

## Hypothesis and implemented stories
Caregivers continuing at-home practice after professional counseling may return more often when recommendations reflect what they noticed last time. The implementation demonstrates this mechanism, not retention or clinical effectiveness.

Implemented: fictional profile onboarding and uncertainty; three sample profiles; explicit recommendation requests; approximately three eligible activity suggestions with rationale; fixed instructions/materials/safety/provenance; attempted/completed status; compatible feedback; adapted subsequent ranking; history and descriptive activity counts; editing/switching/reset/deletion; local event insights; clear mock/live/fallback labels; structured concern abstention; server Gemini integration.

## AI behavior and grounding
Gemini, when activated, ranks a deterministically eligible subset of the local 40-item library. It returns IDs and validated reason/reference/uncertainty fields. It cannot rewrite activity instructions. Application templates turn validated codes into explanations tied to reported observations. The current classroom default is deterministic mock selection. A transport fixture proves adapter plumbing under tests; it does not prove actual provider behavior.

Feedback is stored separately from the library and eval data. Struggle favors less complex same-skill practice, enjoyment favors a related interest, disinterest changes format, and a single mastery observation cannot unlock level 3. Repeated reported mastery across dates plus explicit prerequisites may admit one higher level. These are unvalidated demonstration rules.

Four idea sources were actually verified against UNICEF; 36 activities remain synthetic. All 40 are professionally unreviewed. Versioned provenance and assumptions are visible in activity details and documented in `docs/content.md`.

## Acceptance and measured results
The acceptance specification was created before the engine. Fifty-two synthetic cases run with `npm run eval:mock`: 42 development, 10 held-out. All 52 passed in the recorded mock report. Five deliberately invalid model fixtures were rejected and converted to fallback; raw provider failures are explicitly reported separately from protected outputs. Cases cover age/focus/prerequisites/materials/time, compatible/incompatible feedback, conservative progression, uncertainty, concerns/emergency, no candidates, injection/invalid input and invalid model outputs.

Twenty-five unit/integration tests cover eligibility across all month values, schema/storage validation, cross-profile isolation, structured transport success, quota/server error handling, blocked/truncated/malformed/timeout behavior, and API access gates. See `docs/validation.md` for the final production/browser checks and exact measured latency.

**Actual Gemini API evaluation: not executed; no key supplied.** No live latency, token usage, cost verification or subjective personalization success rate is claimed. Mock rule pass rates do not establish Gemini quality, real-world safety, or the target 90% human-reviewed relevance. Prototype targets remain targets.

## Observed failures and guardrails
An initial browser run exposed legitimate requests being rejected because of a Next.js internal URL/original host mismatch; the corrected comparison and regression test now preserve same-origin access. Turbopack hit a local sandbox worker-binding limitation; webpack built successfully. Deliberately malformed/invented/duplicate/unsupported model selections were rejected, confirming the tested guardrail behavior. HTTP failures and timeouts were tested with network-free transport fixtures, not actual provider outages.

Safety constraints run before live exposure. Concerns abstain, candidate eligibility is deterministic, strict structured output is checked, explanations are constrained templates, instructions are library-owned, live access fails closed, and fallbacks are clearly non-AI. These mechanisms cannot guarantee universally safe content.

## Proposed success metrics and next validation
North Star: weekly completed recommended activities per active family. The app instruments local demo events; definitions and denominator limitations are in `docs/metrics.md`. No interviews, professional review, pilot results, actual family engagement, retention or commercial performance were obtained.

Before field use: recruit consented families in the intended post-counseling segment; complete professional content/rule review and privacy/security assessment; test human-rated relevance and caregiver comprehension; compare feedback-informed selection with a reasonable baseline; measure repeat usage and activity completion over a defined multiweek window; examine burden, accessibility, inappropriate progression, abstention and subgroup failure patterns. Validate any go-to-market counseling partnerships and willingness to pay separately. This document supplies prototype evidence, not the team's final PRD.
