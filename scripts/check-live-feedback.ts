import fs from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { samples } from "../src/data/profiles";
import { activityById } from "../src/lib/library";
import { recommend, eligible, versions } from "../src/lib/engine";
import { geminiProvider } from "../src/lib/gemini";
import { outputFailureCodes } from "../src/lib/provider-error";
import type { History, Recommendation } from "../src/lib/schema";
const key = process.env.GEMINI_API_KEY;
if (!key) throw Error("Configure the local API key before live validation.");
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const reports = fs
  .readdirSync("evals/live")
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(`evals/live/${f}`, "utf8")));
const baseline = reports
  .filter((b) => b.scope === "sample-profiles")
  .flatMap((b) => b.results)
  .filter(
    (r) =>
      r.case === "sample-milo" &&
      r.pass &&
      r.resultMode === "live" &&
      r.model === model,
  )
  .at(-1);
if (!baseline)
  throw Error(
    "A passing actual Gemini Milo baseline is required; no requests made.",
  );
const selected =
  (baseline.actual as Recommendation[]).find(
    (r) =>
      activityById(r.activityId)?.category === "language" &&
      activityById(r.activityId)?.difficulty === 2,
  ) ??
  (baseline.actual as Recommendation[]).find(
    (r) => activityById(r.activityId)?.difficulty === 2,
  );
if (!selected)
  throw Error(
    "Baseline has no level-2 activity to exercise simplification; do not invent an outcome.",
  );
const p = samples[0];
const a = activityById(selected.activityId)!;
const rows = [];
for (const kind of ["enjoyed-and-struggled", "not-interested"] as const) {
  const event: History = {
    id: `live-journey-${kind}`,
    profileId: p.id,
    activityId: a.id,
    date: new Date().toISOString(),
    status: "completed",
    feedback:
      kind === "enjoyed-and-struggled"
        ? ["enjoyed", "struggled"]
        : ["not-interested"],
    rationale: selected.rationale,
    mode: "live",
  };
  console.log(`Waiting 22 seconds before feedback scenario ${kind}…`);
  await delay(22000);
  const started = performance.now();
  const result = await recommend(
    { profile: p, history: [event], mode: "live" },
    geminiProvider({ key, model }),
  );
  const allEligible = result.recommendations.every((r) =>
    eligible(p, [event]).some((a) => a.id === r.activityId),
  );
  const adapted =
    kind === "enjoyed-and-struggled"
      ? result.recommendations[0]?.reason === "simplify" &&
        activityById(result.recommendations[0].activityId)!.difficulty <
          a.difficulty
      : result.recommendations.every(
          (r) =>
            activityById(r.activityId)!.format !== a.format &&
            r.reason === "variety",
        );
  const referenced = result.recommendations
    .filter(
      (r) =>
        r.reason ===
        (kind === "enjoyed-and-struggled" ? "simplify" : "variety"),
    )
    .every((r) => r.feedbackId === event.id && r.rationale.includes(a.title));
  const pass = result.mode === "live" && allEligible && adapted && referenced;
  rows.push({
    case: `journey-${kind}`,
    split: "sample-journey",
    expected: {
      genuineLive: true,
      eligible: true,
      adapted: true,
      groundedFeedbackReference: true,
    },
    baseline: { activityId: a.id, rationale: selected.rationale, mode: "live" },
    feedback: event.feedback,
    actual: result.recommendations,
    pass,
    failureCategory: pass
      ? null
      : result.mode !== "live"
        ? "raw_provider_failed_or_fallback"
        : "feedback_adaptation",
    rawProviderFailure: result.providerFailure ?? null,
    guardrailPrevented:
      !!result.providerFailure &&
      outputFailureCodes.has(result.providerFailure),
    resultMode: result.mode,
    fallback: result.mode === "fallback",
    model,
    providerModelVersion: result.providerModelVersion ?? null,
    versions,
    caseVersion: "live-journey-v1",
    latencyMs: performance.now() - started,
    tokenUsage: result.usage ?? null,
    cost: "$0 estimated · owner-confirmed unbilled Free tier",
    executionDate: new Date().toISOString(),
    mode: "live",
  });
  console.log(
    JSON.stringify({
      case: kind,
      pass,
      resultMode: result.mode,
      activityIds: result.recommendations.map((r) => r.activityId),
      providerFailure: result.providerFailure ?? null,
    }),
  );
  if (!pass) break;
}
const report = {
  date: new Date().toISOString(),
  mode: "live",
  scope: "feedback-journey",
  versions,
  results: rows,
};
fs.writeFileSync(
  `evals/live/${Date.now()}-feedback-journey.json`,
  JSON.stringify(report, null, 2) + "\n",
);
if (rows.length !== 2 || rows.some((r) => !r.pass)) process.exitCode = 1;
