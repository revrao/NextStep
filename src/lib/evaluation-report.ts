import { outputFailureCodes } from "./provider-error";
export interface EvalRow {
  model?: string;
  case: string;
  split: string;
  pass: boolean;
  resultMode?: string;
  fallback: boolean;
  failureCategory: string | null;
  rawProviderFailure: string | null;
  guardrailPrevented: boolean;
  latencyMs: number;
  tokenUsage: {
    input: number;
    output: number;
    total?: number;
    thinking?: number;
  } | null;
  providerModelVersion?: string | null;
  executionDate: string;
}
export interface EvalBatch {
  date: string;
  mode: string;
  scope?: string;
  model?: string;
  versions: Record<string, string>;
  results: EvalRow[];
}
const percentile = (values: number[], p: number) =>
  values.length ? values[Math.max(0, Math.ceil(values.length * p) - 1)] : null;
export function summarizeLive(
  batches: EvalBatch[],
  expectedIds: string[],
  model: string,
  versions: Record<string, string>,
) {
  const compatible = batches.filter(
    (b) =>
      b.mode === "live" &&
      (b.model === undefined || b.model === model) &&
      Object.entries(versions).every(([k, v]) => b.versions[k] === v),
  );
  const rows = compatible
    .flatMap((b) =>
      b.results.map((row) => ({ ...row, scope: b.scope ?? "acceptance" })),
    )
    .filter(
      (r) =>
        (r as EvalRow & { model?: string }).model === undefined ||
        (r as EvalRow & { model?: string }).model === model,
    )
    .sort((a, b) => a.executionDate.localeCompare(b.executionDate));
  const acceptance = rows.filter((r) => r.scope === "acceptance");
  const latest = new Map<string, (typeof rows)[number]>();
  for (const r of acceptance) latest.set(r.case, r);
  const covered = expectedIds.filter((id) => latest.has(id));
  const passed = covered.filter(
    (id) => latest.get(id)?.pass && latest.get(id)?.resultMode === "live",
  );
  const samples = rows.filter((r) => r.scope === "sample-profiles");
  const journeys = rows.filter((r) => r.scope === "feedback-journey");
  const sampleLatest = new Map(samples.map((r) => [r.case, r]));
  const journeyLatest = new Map(journeys.map((r) => [r.case, r]));
  const valid = rows.filter((r) => r.resultMode === "live");
  const successful = rows.filter((r) => r.resultMode === "live" && r.pass);
  const latency = rows.map((r) => r.latencyMs).sort((a, b) => a - b);
  const successfulLatency = valid.map((r) => r.latencyMs).sort((a, b) => a - b);
  const usage = rows.filter((r) => r.tokenUsage !== null);
  const sum = (field: "input" | "output" | "thinking") =>
    usage.reduce((n, r) => n + (r.tokenUsage?.[field] ?? 0), 0);
  const failures = rows.filter((r) => r.rawProviderFailure);
  const prevented = failures.filter((r) =>
    outputFailureCodes.has(r.rawProviderFailure!),
  );
  return {
    model,
    versions,
    updatedAt: rows.at(-1)?.executionDate ?? null,
    attempts: rows.length,
    successful: successful.length,
    acceptedResponses: valid.length,
    successRate: rows.length ? successful.length / rows.length : null,
    fallbacks: rows.filter((r) => r.fallback).length,
    fallbackRate: rows.length
      ? rows.filter((r) => r.fallback).length / rows.length
      : null,
    transportFailures: failures.length - prevented.length,
    invalidOutputsPrevented: prevented.length,
    medianLatencyMs: percentile(latency, 0.5),
    p95LatencyMs: percentile(latency, 0.95),
    latencySamples: latency.length,
    successfulMedianLatencyMs: percentile(successfulLatency, 0.5),
    successfulP95LatencyMs: percentile(successfulLatency, 0.95),
    tokenUsage: {
      input: sum("input"),
      output: sum("output"),
      thinking: sum("thinking"),
      total: usage.reduce(
        (n, r) =>
          n +
          (r.tokenUsage?.total ??
            (r.tokenUsage?.input ?? 0) +
              (r.tokenUsage?.output ?? 0) +
              (r.tokenUsage?.thinking ?? 0)),
        0,
      ),
      requestsWithUsage: usage.length,
    },
    estimatedCostUsd: rows.length ? 0 : null,
    costBasis:
      "Owner-confirmed unbilled Free tier; estimate, not a billing audit",
    coverage: {
      expected: expectedIds.length,
      executed: covered.length,
      passed: passed.length,
      missing: expectedIds.filter((id) => !latest.has(id)),
      failing: covered.filter((id) => !passed.includes(id)),
      heldoutExecuted: [...latest.values()].filter((r) => r.split === "heldout")
        .length,
    },
    samples: {
      attempts: samples.length,
      passed: samples.filter((r) => r.pass).length,
      profiles: [...new Set(samples.map((r) => r.case))],
    },
    feedbackJourney: {
      attempts: journeys.length,
      passed: journeys.filter((r) => r.pass).length,
    },
    providerModelVersions: [
      ...new Set(
        rows.flatMap((r) =>
          r.providerModelVersion ? [r.providerModelVersion] : [],
        ),
      ),
    ],
    recentCases: rows
      .slice(-12)
      .reverse()
      .map((r) => ({
        case: r.case,
        scope: r.scope,
        pass: r.pass,
        mode: r.resultMode ?? "unknown",
        latencyMs: r.latencyMs,
        failure: r.failureCategory,
      })),
    humanReviewedRelevance: { status: "Not measured", reviewed: 0 },
    acceptanceReady:
      expectedIds.length > 0 &&
      passed.length === expectedIds.length &&
      ["sample-milo", "sample-luna", "sample-robin"].every(
        (id) =>
          sampleLatest.get(id)?.pass &&
          sampleLatest.get(id)?.resultMode === "live",
      ) &&
      ["journey-enjoyed-and-struggled", "journey-not-interested"].every(
        (id) =>
          journeyLatest.get(id)?.pass &&
          journeyLatest.get(id)?.resultMode === "live",
      ),
  };
}
