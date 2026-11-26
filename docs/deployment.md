# Owner deployment guide · Vercel Hobby

Prepared November 26, 2026. **No Vercel project or deployment has been created by the agent.** The owner performs the steps below in a new NextStep project. Leave Procurement Audit Planner and Community Hub untouched; do not change workspace-wide defaults.

## Free protection decision

Vercel's [September 9, 2026 announcement](https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan) makes Vercel Authentication for **All Deployments**, including production, free on every plan. Visitors need a Vercel account with project access. This supports a private owner/classroom demonstration without a paid service; it is not anonymous caregiver access.

[Deployment Protection](https://vercel.com/docs/deployment-protection) distinguishes All Deployments from Standard Protection, which leaves production domains public. Use All Deployments, with no public exceptions, shareable bypass links or automation bypass secrets. Password Protection is not available on Hobby. Existing same-origin browser API requests carry the Vercel authentication cookie automatically; the separate classroom code remains required by the application.

[WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) currently includes one Hobby rule within three custom rules, one million allowed requests, fixed windows of 10 seconds–10 minutes and IP/JA4 keys. Counters are per region, not a global Gemini quota. Configure one API rule as described below. The application's memory throttle (three live requests/minute per running instance) is supplemental, not durable serverless protection.

The [WAF pricing page](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing) also lists metered pricing; use only the Hobby inclusion, decline paid upgrades and stop if the dashboard requires a paid purchase. [Hobby](https://vercel.com/docs/plans/hobby) is for personal non-commercial use; excess usage generally requires waiting for the limit to reset. Keep this an educational prototype. Monitor shared workspace usage without changing other projects. No absolute cross-region/provider request cap is implemented: restrict access, use short manual sessions and stop on quota errors.

## 1. Import and first deploy in mock mode

1. Sign into your existing **Hobby** workspace. Choose **Add New → Project**, import **revrao/NextStep** from GitHub (personal repository), and select branch **main**. Grant repository access only as needed.
2. Create a **new** project named `nextstep` or another available NextStep-specific name. Do not select an existing project. Decline Pro trials, paid add-ons and billing changes.
3. Select **Next.js**, root directory **repository root (`./`)**, Node **24.x**, install command **`npm ci`**, build command **`npm run build`**, and framework-default output directory. No static export or custom start command. Routes use Node functions; recommendation duration is 20 seconds and provider timeout is 12 seconds.
4. Add the following non-secret variables for **Production** only: `AI_MODE=mock`, `GEMINI_MODEL=gemini-3.5-flash-lite`, `LIVE_EVAL_PASSED=false`, `CLASSROOM_DEPLOYMENT_PROTECTED=false`. Leave `GEMINI_API_KEY` and `DEMO_ACCESS_CODE` absent. Do not upload `.env.local` wholesale. Leave Preview/Development without live credentials.
5. Click **Deploy** yourself. Use the default free `vercel.app` domain. This first deployment cannot call Gemini, even if someone selects Live Gemini in Settings. Verify the mock journey, feedback, history/refresh, mobile layout and deletion. Localhost and Vercel have separate browser storage.

## 2. Establish and verify protection while still mock-only

1. In the **NextStep project only**, open **Settings → Deployment Protection** (some dashboard layouts expose this under Security). Enable **Vercel Authentication**, choose **All Deployments**, and save. Do not change team defaults or create public exceptions/bypass links. Confirm no existing project bypass settings are enabled.
2. Open **Firewall → Configure → New Rule**, name it `NextStep API throttle`. Match **Request Path starts with `/api/`**. Action: **Rate Limit**, strategy **Fixed Window**, window **60 seconds**, request limit **6**, counting key **IP**, enforcement **Too Many Requests (429)**. Do not use Log-only mode or response conditions. Save, Review Changes, then Publish. Confirm the Hobby inclusion and no paid upgrade before continuing. One combined rule covers unlock and recommendation endpoints; shared classroom IPs share its allowance. Slow manual requests accordingly.
3. In an unsigned-in private browser, open both the production alias and generated deployment URL. Both must require Vercel authentication. Verify direct requests to `/api/live-access` and `/api/recommend` on both hosts are intercepted by Vercel too. A Vercel login redirect or access-denied response is expected; the app's own 403 alone is not proof of platform protection.
4. While Gemini credentials are still absent, sign in with your authorized Vercel account and verify the app works. To verify the firewall without provider usage, make seven sequential harmless GET requests to `/api/live-access` within one minute from the same IP; the route normally returns 405, then the edge rule should return 429. Check Firewall traffic for this rule and wait at least a minute before continuing. Do not load test. If protection or the rule cannot be verified for free, **stop here and keep hosted mock mode**; local live remains available.

## 3. Exact live environment settings, only after step 2 passes

In **NextStep → Settings → Environment Variables**, select **Production only**. Add/edit these exact server-side names:

- `AI_MODE` = `live`
- `GEMINI_MODEL` = `gemini-3.5-flash-lite` (the evaluated model; no migration)
- `GEMINI_API_KEY` = privately paste your existing Google AI Studio **unbilled Free-tier** key value. Do not paste it into the website or chat.
- `DEMO_ACCESS_CODE` = privately paste the current rotated classroom code value from your ignored local configuration. It must be at least 16 characters; preserve its case and omit variable names/quotes. Never reuse the screenshot-exposed old code.
- `LIVE_EVAL_PASSED` = `true` (36/36 technical acceptance already reviewed for this unchanged behavior)
- `CLASSROOM_DEPLOYMENT_PROTECTED` = `true` **only after verifying the actual Vercel protection and firewall above**. This is an operator attestation, not a control that enables protection itself.

Mark key/code Sensitive if offered. Never prefix secrets with `NEXT_PUBLIC_`. Vercel supplies `VERCEL` itself; do not set it manually. No database, KV, OAuth client, bypass token, AI Gateway, billing account, additional provider or public environment variable is required. Keep Preview/Development unconfigured for live (mock defaults). Local `.env.local` is unchanged.

Environment changes apply to new deployments. **Manually redeploy the latest main commit** from this project's Deployments page after saving. Old deployments remain behind All Deployments authentication. Do not roll back to an old live deployment as a disable mechanism.

## 4. Hosted smoke test and rollback

1. Repeat the unsigned-in host/API protection checks after redeployment. Sign in to Vercel using an account that already has project access; do not buy collaborator seats or create public bypasses for a demo.
2. Use only a fictional profile. In Profile & settings choose Live Gemini, privately enter the classroom code, then **Unlock Live AI** or Enter. The success indicator confirms authentication, not provider availability. Code stays only in tab memory; refresh/edit/Lock/mode change relocks it.
3. Request recommendations once. Confirm **Live Gemini ranking**, actual provider usage in the correct AI Studio project, and no fallback label. A deterministic fallback is not live success. Use the [human review checklist](human-review.md) if recording new relevance evidence. Do not rerun the full evaluation suite or photograph credentials/request headers.
4. Verify mock backup and history. Check NextStep function errors and AI Studio quota without logging raw keys, codes, headers or child context. On 429/503, stop requests and use mock; no unlimited retries or billing upgrade. Hosted readiness is not hosted verification: record actual results only after these manual checks.
5. To disable hosted live, set Production `AI_MODE=mock`, `LIVE_EVAL_PASSED=false`, `CLASSROOM_DEPLOYMENT_PROTECTED=false`, remove Production key/code, and manually redeploy. Keep All Deployments protection. Earlier live deployments retain their environment snapshots: delete those **NextStep-only** deployments or revoke/rotate the provider key privately if immediate shutdown is needed. Merely changing environment settings does not stop old deployments. Never disable protection while any live deployment remains reachable.

For a public demonstration, keep production mock-only with no live credentials; use localhost for live. Do not turn off All Deployments on a project containing retained live deployments. No public live path is approved by this guide.

## Troubleshooting

- Build: confirm Node 24, root, lockfile, default Next.js output and webpack build command.
- Vercel login required: expected for private live. Classroom code does not grant Vercel project access.
- App 403: missing/mismatched classroom code; paste value alone privately and unlock again.
- App 503: mode/key/acceptance/protection gate absent. Check Production scope and redeploy; never set flags to bypass missing protection.
- Edge 429: shared-IP API allowance exceeded; wait a minute, then use small manual batches. Provider quota may require a longer stop. No paid upgrade.
- History missing: storage belongs to the browser and origin. There is no cross-device or localhost-to-host sync.
