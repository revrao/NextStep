import fs from "node:fs";
import { summarizeLive, type EvalBatch } from "../src/lib/evaluation-report";
import { versions } from "../src/lib/engine";
import development from "../evals/development-v1.json";
import heldout from "../evals/heldout-v1.json";
const expected = [...development, ...heldout]
  .filter(
    (c) =>
      !("rawOutput" in c) &&
      !("reject" in c.expected && c.expected.reject) &&
      !("abstain" in c.expected && c.expected.abstain),
  )
  .map((c) => c.id);
const dir = "evals/live";
const batches: EvalBatch[] = fs.existsSync(dir)
  ? fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8")))
  : [];
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const summary = summarizeLive(batches, expected, model, versions);
fs.writeFileSync(
  "src/data/live-evaluation-summary.json",
  JSON.stringify(summary, null, 2) + "\n",
);
fs.writeFileSync(
  "evals/live-summary.json",
  JSON.stringify(summary, null, 2) + "\n",
);
console.log(JSON.stringify({ ...summary, recentCases: undefined }, null, 2));
const mock = JSON.parse(fs.readFileSync("evals/latest-mock.json", "utf8"));
const smoke = fs.existsSync("evals/connectivity-live.json")
  ? JSON.parse(fs.readFileSync("evals/connectivity-live.json", "utf8"))
  : null;
const pct = (n: number | null) =>
  n === null ? "Not measured" : `${(n * 100).toFixed(1)}%`;
const secs = (n: number | null) =>
  n === null ? "Not measured" : `${(n / 1000).toFixed(3)} s`;
const text = `# Live Gemini validation · actual measured evidence

Generated ${new Date().toISOString()} (UTC). Model: ${summary.model}. Version bundle: ${Object.values(versions).join(", ")}. Report format: v2. Synthetic fictional profiles only.

## Status and coverage
${summary.acceptanceReady ? "Technical live acceptance coverage is complete." : "Technical acceptance is incomplete; keep website live gates disabled."} Human-reviewed relevance has not been measured. No claim of clinical validation or real-family engagement is made.

- Unique live acceptance cases executed: ${summary.coverage.executed}/${summary.coverage.expected}; latest passing: ${summary.coverage.passed}/${summary.coverage.expected}.
- Held-out live cases executed: ${summary.coverage.heldoutExecuted}. Held-out cases have not been used for prompt tuning.
- Sample-profile attempts: ${summary.samples.passed}/${summary.samples.attempts} passed (${summary.samples.profiles.join(", ") || "none"}).
- Actual feedback-journey steps: ${summary.feedbackJourney.passed}/${summary.feedbackJourney.attempts} passed. Their baseline activity was selected by a real prior Gemini sample request, not a hardcoded mock sequence.
- Unexecuted acceptance cases: ${summary.coverage.missing.join(", ") || "none"}.
- Unresolved latest failures: ${summary.coverage.failing.join(", ") || "none"}.

## Live outcomes (all attempts, not just passing rechecks)
${summary.successful}/${summary.attempts} successful live recommendation attempts (${pct(summary.successRate)}). ${summary.fallbacks}/${summary.attempts} deterministic non-AI fallbacks (${pct(summary.fallbackRate)}). ${summary.transportFailures} classified provider transport/availability failures, ${summary.unclassifiedFailures} legacy unclassified failures, and ${summary.invalidOutputsPrevented} invalid model outputs prevented. A fallback never counts as Gemini success. Compatible reports include samples and feedback journeys, in addition to the acceptance suite; unique acceptance coverage is reported separately.

Latency across all ${summary.latencySamples} attempts, including timeouts/failures and excluding deliberate pacing: median ${secs(summary.medianLatencyMs)}, p95 ${secs(summary.p95LatencyMs)}. Successful-response-only median ${secs(summary.successfulMedianLatencyMs)}, p95 ${secs(summary.successfulP95LatencyMs)}. Targets remain median <=5 seconds and p95 <=15 seconds. These small-sample engineering measurements do not predict production uptime or latency.

Reported usage: ${summary.tokenUsage.input} input, ${summary.tokenUsage.output} output, ${summary.tokenUsage.thinking} thinking; ${summary.tokenUsage.total} total tokens accounted for, across ${summary.tokenUsage.requestsWithUsage}/${summary.attempts} attempts with usage metadata. Missing timeout/error usage is unknown, not a zero-token claim. Estimated API cost: ${summary.estimatedCostUsd === null ? "unmeasured" : "$" + summary.estimatedCostUsd.toFixed(2)} under the owner-confirmed unbilled Free tier; this is not an independent billing audit. No paid billing, provider switching, paid tools, or Vercel deployment was enabled.

Connectivity smoke (separate from recommendation denominators): ${smoke?.connected ? "passed" : "not verified"}; model HTTP ${smoke?.modelHttpStatus ?? "not measured"}, generation HTTP ${smoke?.generationHttpStatus ?? "not measured"}, ${smoke?.tokenUsage?.totalTokenCount ?? "unknown"} total tokens. Model-reported versions in recommendation evidence: ${summary.providerModelVersions.join(", ") || "not yet recorded"}.

## Deterministic and injected guardrail evidence
Mock acceptance ${mock.passed}/${mock.cases}; invalid provider-output fixtures safely blocked ${mock.safety.injectedOutputs.passed}/${mock.safety.injectedOutputs.cases}; invalid input rejections ${mock.safety.inputRejections.passed}/${mock.safety.inputRejections.cases}; expected abstentions ${mock.safety.abstentions.passed}/${mock.safety.abstentions.cases}. These tests do not involve actual unsafe Gemini output. Unit/integration tests separately inject HTTP 429/500/503, malformed JSON, blocked/truncated output and timeouts without consuming live quota.

## Observed failures and limitations
The first age-6 attempt fell back at the unchanged ~12-second timeout deadline with a legacy generic diagnostic code; one bounded recheck passed. That legacy diagnostic remains unclassified in the category counters rather than being relabeled after the fact. The first age-11 attempt received HTTP 503; one bounded recheck after cooldown passed. Root cause inside Google's service or the network was not independently established. Original failures remain in immutable batch files and rate/latency denominators. A later focus-cognitive request also returned HTTP 503 and remains failed unless separately rechecked. The initial continuation stopped. A separate single pass collects only unexecuted cases (maximum 20), never retries a failed case, and stops on quota/output/acceptance failure or two further availability failures. This changes coverage collection only; fallback results remain failed live recommendations and all acceptance assertions stay unchanged. No safety threshold, eligibility rule, prompt or held-out expectation was weakened to improve scores.

Failure history: ${summary.failureHistory.map((r) => r.case + " (" + r.category + ")").join(", ") || "none"}.

Raw batches: evals/live/*.json. Aggregate: evals/live-summary.json. Mock: evals/latest-mock.json. Connectivity: evals/connectivity-live.json. Regenerate with npm run eval:summary; rebuild the app to refresh the imported internal dashboard snapshot. Relevance ratings require a real human review and remain unmeasured. All content remains professionally unreviewed classroom material.
`;
fs.writeFileSync("docs/live-validation.md", text);
