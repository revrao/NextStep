# Behavior changelog

## v1 · November 25, 2026
Version bundle: prompt-v1, schema-v1, rules-v1, library-v1, cases-v1.

Initial release: structured fictional profiles, 40 unreviewed activities, deterministic candidate filtering, feedback-conditioned ranking, conservative mastery gate, unknown-prerequisite abstention, concern/emergency stops, Gemini JSON ID/code selection, reason-reference validation, and explicit labeled fallback. Instructions remain fixed library content. Voice is warm, encouraging, nonjudgmental, concise, conservative about uncertainty, and respectful of caregiver choice.

Measured acceptance: 52/52 mock cases (42 development, 10 held-out); 5 adversarial provider outputs prevented and converted to fallback. No actual Gemini results. Automated relevance assertions are narrow rule checks, not 90% human-reviewed personalization evidence. See `evals/latest-mock.json` for exact execution metadata.

Browser QA identified an internal Next.js URL versus original Host discrepancy in origin validation. The API now compares the browser origin's host to the actual Host header, preserving cross-origin rejection; a regression test covers the internal-URL case. Caregiver-facing text sizes were increased during rendered review.

## Improvement process
Caregiver usage → structured feedback → recommendation failure identification → new development evaluation cases → reviewed rule/prompt changes → re-evaluation, including untouched held-out coverage. This describes a proposed human-reviewed data flywheel. No automatic learning, prompt rewriting, or data upload is implemented. Refresh held-out cases independently when an evaluated version is promoted or existing cases become tuning inputs.
