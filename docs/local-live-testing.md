# Protected local Gemini testing

November 26 status: protected local live access is enabled in this owner checkout after completed technical acceptance, passing regression/build checks and a successful real browser request. See `evals/live-summary.json` and `docs/live-validation.md`; incomplete coverage must keep live access disabled. No Vercel deployment is authorized.

After activation is confirmed in the final progress entry:

1. In the NextStep project directory run `npm run dev`, then open http://127.0.0.1:3000. If a NextStep server was already running before the environment update, stop and restart it so it loads the current configuration.
2. Select fictional Milo (or another sample). Open **Profile & settings**, choose **Live Gemini · classroom access required**.
3. Privately open the local `.env.local` in your editor and copy the value of `DEMO_ACCESS_CODE` into the masked classroom access field. Do not send it to chat, print it in terminal commands, or include the file/field in screenshots. The API key stays server-side; never paste it into the website.
4. Return to **Your day** and deliberately request activities. Check the result says **Live Gemini ranking**. The “Live mode requested” badge alone is not proof of a successful provider response. A fallback explicitly says it is non-AI.
5. Open an activity, check instructions/materials/rationale, record **Enjoyed + Struggled**, save, then request new recommendations. Look for gentler same-skill practice and an explanation referencing the actual observation. Try **Not interested** in a separate/reset journey to check a different format.
6. Review history and **Team insights**. The dashboard is a snapshot of measured evaluations, separate from local browser interactions. Use the [human review checklist](human-review.md) to record actual relevance judgments.

The local endpoint requires the rotated classroom code and limits live calls to three per minute per server instance. Wait at least a minute after a rate-limit response. It makes no automatic provider retries. A timeout, quota failure, unavailable provider, or rejected output produces a labeled deterministic fallback. Choose **Simulated · deterministic demo** in Settings for reliable backup without a key or external request.

Only fictional profiles and observations are permitted. All activity content and progression rules remain unreviewed prototype assumptions. No clinical or real-family decisions should be made from this demonstration.

The mode and access code are held in browser memory, so after a page refresh reselect live mode and enter the code again. History/profiles persist locally until reset or deleted. Live recommendations run only on deliberate actions. No key or classroom code is stored in browser local storage.

Server configuration after legitimate local activation is `AI_MODE=live` and `LIVE_EVAL_PASSED=true`; `CLASSROOM_DEPLOYMENT_PROTECTED=false` remains unchanged. Public hosted live use remains disabled without separately established hosting protection. To disable all local live calls, set `AI_MODE=mock` in the local file and restart NextStep. No paid billing or deployment is needed.
