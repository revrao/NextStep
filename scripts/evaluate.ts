import fs from "node:fs";
import {
  recommend,
  eligible,
  progressionAllowed,
  versions,
} from "../src/lib/engine";
import { activityById } from "../src/lib/library";
import { requestSchema, type Result } from "../src/lib/schema";
import { geminiProvider } from "../src/lib/gemini";
import development from "../evals/development-v1.json";
import heldout from "../evals/heldout-v1.json";
const live = process.argv.includes("--live");
if (live && !process.env.GEMINI_API_KEY) {
  console.error(
    "Live evaluations not executed: GEMINI_API_KEY is required. Mock results are not Gemini evidence.",
  );
  process.exit(2);
}
const batchArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = batchArg ? Number(batchArg.split("=")[1]) : live ? 3 : Infinity;
if (!(limit > 0)) {
  throw Error("Use a positive --limit.");
}
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const items = [
  ...development.map((c) => ({ ...c, split: "development" })),
  ...heldout.map((c) => ({ ...c, split: "heldout" })),
];
const offsetArg = process.argv.find((a) => a.startsWith("--offset="));
const offset = offsetArg ? Number(offsetArg.split("=")[1]) : 0;
if (!Number.isInteger(offset) || offset < 0)
  throw Error("Use a non-negative integer --offset.");
let eligibleIndex = 0;
let liveCalls = 0;
const rows = [];
for (const item of items) {
  const c = item as typeof item & { rawOutput?: unknown };
  const e = c.expected as Record<string, unknown>;
  if (live && (c.rawOutput !== undefined || e.reject || e.abstain)) continue;
  if (live && eligibleIndex++ < offset) continue;
  if (live && liveCalls >= limit) break;
  const started = performance.now();
  let result: Result | undefined;
  let failure: string | undefined;
  let validationRejected = false;
  try {
    const provider = live
      ? geminiProvider({ key: process.env.GEMINI_API_KEY!, model })
      : c.rawOutput !== undefined
        ? {
            name: "adversarial-fixture",
            select: async () => ({ output: c.rawOutput }),
          }
        : undefined;
    if (live) liveCalls++;
    result = await recommend(
      { profile: c.profile, history: c.history, mode: live ? "live" : "mock" },
      provider,
    );
  } catch {
    validationRejected = true;
  }
  try {
    const check = (condition: unknown, message: string) => {
      if (!condition) throw Error(message);
    };
    if (e.reject) {
      check(validationRejected, "expected input rejection");
    } else {
      check(!validationRejected && result, "unexpected input rejection");
      const r = result!;
      const p = requestSchema.parse({
        profile: c.profile,
        history: c.history,
      }).profile;
      const pool = eligible(p, c.history as never);
      check(
        r.recommendations.every((s) => pool.some((a) => a.id === s.activityId)),
        "grounding_or_eligibility",
      );
      check(
        new Set(r.recommendations.map((s) => s.activityId)).size ===
          r.recommendations.length,
        "duplicate",
      );
      if (e.abstain) check(!r.recommendations.length, "expected abstention");
      else check(r.recommendations.length > 0, "unexpected abstention");
      if (e.messageContains)
        check(
          r.message.includes(String(e.messageContains)),
          "missing safety message",
        );
      const selected = r.recommendations.map((s) =>
        activityById(s.activityId)!,
      );
      if (e.category)
        check(
          selected.every((a) => a.category === e.category),
          "category",
        );
      if (e.noPrerequisites)
        check(
          selected.every((a) => !a.prerequisites.length),
          "prerequisites",
        );
      if (e.noMaterials)
        check(
          selected.every((a) => !a.materials.length),
          "materials",
        );
      if (e.maxMinutes)
        check(
          selected.every((a) => a.minutes <= Number(e.maxMinutes)),
          "duration",
        );
      if (e.maxDifficulty)
        check(
          selected.every((a) => a.difficulty <= Number(e.maxDifficulty)),
          "progression",
        );
      if (e.excludeFormat)
        check(
          selected.every((a) => a.format !== e.excludeFormat),
          "disinterest",
        );
      if (e.firstReason)
        check(
          r.recommendations[0]?.reason === e.firstReason,
          "feedback_adaptation",
        );
      if (e.uncertain)
        check(
          r.recommendations.every((s) => s.uncertain),
          "uncertainty",
        );
      if (e.progressEligible)
        check(
          pool.some(
            (a) =>
              a.difficulty === 3 &&
              progressionAllowed(p, c.history as never, a.category),
          ),
          "supported progression missing",
        );
      if (e.maxCategoryDifficulty) {
        const [category, max] = e.maxCategoryDifficulty as [string, number];
        check(
          selected
            .filter((a) => a.category === category)
            .every((a) => a.difficulty <= max),
          "difficulty_after_struggle",
        );
      }
      if (e.fallback)
        check(r.mode === "fallback", "expected guardrail fallback");
      if (live) check(r.mode === "live", "raw_provider_failed_or_fallback");
    }
  } catch (error) {
    failure = error instanceof Error ? error.message : "unknown";
  }
  rows.push({
    case: c.id,
    split: c.split,
    expected: e,
    actual: validationRejected ? "input rejected" : result?.recommendations,
    pass: !failure,
    failureCategory: failure ?? null,
    rawProviderFailure: result?.providerFailure ?? null,
    guardrailPrevented: !!result?.providerFailure || !!e.reject,
    fallback: result?.mode === "fallback",
    model: live ? model : (result?.model ?? "deterministic-v1"),
    versions,
    caseVersion: "cases-v1",
    latencyMs: performance.now() - started,
    tokenUsage: result?.usage ?? null,
    cost: live ? "Unverified; free-tier project required" : "$0 · local only",
    executionDate: new Date().toISOString(),
    mode: live ? "live" : "mock",
  });
  if (live && failure) {
    console.error(
      "Live acceptance failure. Keep LIVE_EVAL_PASSED=false; remediate and retest.",
    );
    break;
  }
}
const latency = rows.map((r) => r.latencyMs).sort((a, b) => a - b);
const report = {
  batchOffset: offset,
  batchLimit: Number.isFinite(limit) ? limit : null,
  date: new Date().toISOString(),
  mode: live ? "live" : "mock",
  versions,
  cases: rows.length,
  passed: rows.filter((r) => r.pass).length,
  failed: rows.filter((r) => !r.pass).length,
  rawProviderFailures: rows.filter((r) => r.rawProviderFailure).length,
  fallbacks: rows.filter((r) => r.fallback).length,
  medianLatencyMs: latency[Math.floor(latency.length / 2)] ?? null,
  p95LatencyMs:
    latency[
      Math.min(latency.length - 1, Math.ceil(latency.length * 0.95) - 1)
    ] ?? null,
  subjectiveRelevance: "Not measured; human review required",
  liveModelTested: live,
  results: rows,
};
fs.writeFileSync(
  `evals/latest-${live ? "live" : "mock"}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
if (live) {
  fs.mkdirSync("evals/live", { recursive: true });
  fs.writeFileSync(
    `evals/live/${Date.now()}-offset-${offset}.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
}
if (!live)
  fs.writeFileSync(
    "src/data/evaluation-summary.json",
    JSON.stringify({ ...report, results: undefined }, null, 2) + "\n",
  );
console.log(JSON.stringify({ ...report, results: undefined }, null, 2));
if (report.failed) process.exitCode = 1;
