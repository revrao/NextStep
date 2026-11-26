# Gemini activation and live-validation handoff

## Phase 1 status · November 25, 2026
The server provider, API access gates, environment handling, and existing live runner were reviewed. A local `.env.local` has been created with owner-only permissions (0600), an empty API key, a randomly generated classroom access code, and the existing conservative gates. No API request has been made during activation preparation.

### Model selection
Retain `gemini-3.5-flash-lite`: its structured-output support and emphasis on low latency fit selection of a few eligible IDs and reason codes. This is an engineering choice, not measured NextStep model quality. [Google model documentation](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite).

The current standard text pricing lists free input/output for `gemini-3.5-flash-lite`, `gemini-3.6-flash`, and `gemini-3.8-flash`. The latter two remain alternatives for later explicit evaluation; the application does not automatically switch models. [Google pricing](https://aistudio.google.com/docs/pricing). Older 2.5 API access is restricted to existing users; avoid that dependency for this new key. [Model availability](https://aistudio.google.com/docs/models).

Documentation eligibility does not confirm this particular project's model access, usage tier, region, or available quota. Limits are project-specific; check active limits in AI Studio before requests. [Google rate limits](https://aistudio.google.com/docs/rate-limits). Do not enable paid billing or attach a billed project to complete this demonstration.

### Manual input required now
1. Open the project-root `.env.local` in a local text editor. Its absolute path is `/Users/revanthrao/Documents/NextStep/.env.local`. Hidden files may require the editor's Open File command.
2. Find the line `GEMINI_API_KEY=` and paste your key immediately after `=` on that single line. Do not paste it into chat, terminal commands, screenshots, GitHub, or documentation. Save the file.
3. Confirm in Google AI Studio that the key belongs to the intended **Free tier** project and paid billing is disabled. Creating an AI Studio key alone does not prove the associated project is unbilled.
4. Leave `GEMINI_MODEL=gemini-3.5-flash-lite`, `AI_MODE=mock`, `LIVE_EVAL_PASSED=false`, and `CLASSROOM_DEPLOYMENT_PROTECTED=false` unchanged. Keep the generated access code local.
5. Tell the agent only that the key has been configured and the Free tier has been confirmed. No key value is needed in the conversation.

`.gitignore` excludes `.env*` except the blank `.env.example`; `.env.local`, production/test/development local variants, and an `.env.local.backup` were checked. The only tracked environment file is the credential-free `.env.example`. Never force-add an ignored environment file. The API key is read only by server/CLI code, never a `NEXT_PUBLIC_` variable. The existing unrelated Next.js-generated `next-env.d.ts` change was preserved and excluded from the activation commit.

## Planned Phase 2 · starts after owner confirmation
- Inspect configuration presence without printing credential values; verify model availability and one minimal generation request. Keep usage tied to the unbilled project. Do not claim connectivity until an actual successful response is received.
- Run constrained recommendation requests for the fictional samples and compare before/after feedback. Check actual mode and provider result; `fallback` does not count as Gemini success.
- Run the existing live cases in bounded sequential batches (up to three calls per batch, smaller if quota requires), pacing to the project's actual limits. Stop on quota exhaustion or failure; no unlimited retries or automatic model substitution. Preserve raw failed outputs as safe structured metadata without secrets and investigate before further calls.
- Keep acceptance criteria unchanged. Test errors, invalid outputs, and quota handling with injected transport fixtures wherever actual API calls add no useful evidence. Reuse mock mode as backup.
- The live runner intentionally bypasses the website acceptance flag while retaining eligibility and output checks; it does not activate the website. The website remains gated until sufficient reviewed live acceptance evidence exists. A small passing batch is not full acceptance.
- Do not deploy. Keep local server binding on 127.0.0.1, classroom code required, and hosted protection disabled. After acceptance, activate local website live mode deliberately; never mark hosted protection true without real protection.

## Planned Phase 3 · reports actual evidence only
Update the existing Insights page as an internal product-team/evaluation view, preserving the caregiver design. Separate mock cases, actual provider results, prevented unsafe/invalid outputs, live successes, fallbacks, latency and usage; show cost as a free-tier estimate only when justified. Human-reviewed relevance stays unmeasured unless an actual documented review is completed. Aggregate batches by compatible model and behavior versions; distinguish unique case coverage from retries. Update evaluation reports, evidence, validation, behavior changelog and progress together. No existing mock report should be relabeled live.
