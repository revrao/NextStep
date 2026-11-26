# AI-use and implementation log

## November 25, 2026 · Codex-assisted implementation
Request: autonomously implement the supplied NextStep educational prototype, preserve the full specification, test the feedback loop and safety controls, push validated milestones, prepare Vercel instructions, and leave deployment to the owner. The supplied request is preserved in `SPEC.md`; no private course materials beyond the explicitly requested project specification were added.

Decisions: use the requested Next.js stack, local-only persistence, original vector illustrations, strict structured inputs, synthetic fictional profiles, a compact 40-activity library, and constrained IDs/reason codes rather than unrestricted AI-generated instructions. Four source ideas were checked against UNICEF; other scenarios remain labeled synthetic. Google official model/pricing/structured-output docs were checked before selecting configurable `gemini-3.5-flash-lite`.

Alternatives considered: open-ended chat rejected because the central job is constrained recommendation; model-written instructions rejected because safety-sensitive steps must remain grounded; persistent cloud database/auth and simulated caregiver roles omitted as unnecessary scope/security ambiguity; public live endpoint with memory throttle alone rejected as insufficient serverless control; automatic retries rejected for reliability/cost containment. Turbopack was attempted, failed worker port binding in this sandbox, and was replaced with a successful webpack build.

Implementation assistance: generated application code, activity fixture drafts, eval fixtures, transport tests, and documentation. No subagents or complex multi-agent runtime were used. No AI-created clinical review, customer interviews, testimonials, pilots, or live Gemini test results were fabricated.

Validation: deterministic/adversarial evaluations and mocked transport tests are distinct from actual Gemini API evaluation. Browser QA caught and corrected an origin comparison bug; rendered review prompted larger text. Exact final checks are in `docs/validation.md`. Logs contain no actual credentials or real child information.


## Live activation preparation · Phase 1
Owner approved the visual prototype and obtained an AI Studio key. Reviewed existing integration and current official Google model/pricing/rate-limit documentation. Retained gemini-3.5-flash-lite instead of automatically moving to a larger free-tier Flash model; actual quality remains to be evaluated. Prepared an ignored owner-only local environment file with a blank key and generated classroom code. Website live gates remain disabled. Documented manual key insertion and the bounded validation/reporting continuation. No real API request was performed, no credentials were exposed, and no live acceptance result was invented.
