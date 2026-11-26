# Safety, privacy, and failure modes · rules-v1

This educational prototype is restricted to fictional profiles and simulated use. It is unreviewed and not suitable for actual child-development decisions. It supplements the idea of professional guidance; it does not assess or replace it.

## Implemented constraints
Strict enum-based profile observations replace free-text clinical input. Nicknames allow letters/spaces only, and real names cannot be reliably detected: fictional use remains a user obligation. No real dates of birth, photos, contacts, addresses, medical records, or family narratives are requested. Nothing is logged to a third-party analytics service.

Concern/emergency selections stop recommendations and provider calls, with qualified-professional or urgent-assistance guidance. Because there is no unrestricted text input, the system does not claim to detect unexpressed emergencies or interpret medical narratives.

Eligibility is deterministic and evaluated before generation. Model IDs, uniqueness, reason codes, feedback references, and uncertainty flags are rechecked afterward. Unsafe extra text is rejected by the strict schema. Templates avoid diagnostic or unsupported model prose. Instructions and safety notes are rendered only from the local library. Provider failures, incomplete outputs, timeouts, malformed JSON, foreign IDs, and unsupported reasons generate a labeled non-AI fallback. A concern never generates a fallback activity.

Struggle lowers the permitted same-skill complexity; enjoyment does not independently escalate it. Mastery requires repeated structured observations across dates before level 3 is eligible. These are conservative prototype heuristics, not clinical evidence or validated progression.

## Live endpoint protection
Mock is default. Live needs a >=16-character code, timing-safe comparison, server key, `AI_MODE=live`, and manually reviewed `LIVE_EVAL_PASSED=true`. Hosted requests require `CLASSROOM_DEPLOYMENT_PROTECTED=true` **and actual externally configured deployment protection**. Do not set this flag on an unprotected public deployment. If Hobby cannot provide adequate protection for a production URL, keep that URL mock-only and use local live demonstration. Per-instance three-requests/minute throttling is supplemental, resets with instance lifecycle, and is not a global quota. The route rejects cross-origin browser requests, large declared/actual JSON bodies, and invalid schemas. These checks do not constitute production authorization or complete denial-of-service protection.

## Residual risks
Unreviewed library instructions and metadata may be inappropriate. Caregiver reports can be mistaken; repeated entries can game mastery. Rule validation is not proof of safety. Local storage has no encryption or account isolation and can be edited by anyone using that browser. Hosted protection is operational configuration, not remotely verified by code. Provider free-tier terms may allow data improvement use; only minimized fictional data is permitted. Cost cannot be programmatically guaranteed if an owner supplies a billed key; use an unbilled project and never enable billing. There is no production-grade consent, retention policy, auth, sharing, durable abuse prevention or clinical review.

Delete local profiles/history/events in Settings. A live request sends structured fictional age, focus, abilities, duration, materials, preferences and recent structured feedback; nickname/profile ID, timestamps and rationale prose are excluded. Code and key are not saved in local storage. No raw provider errors, API keys, or prompts are shown to caregivers.
