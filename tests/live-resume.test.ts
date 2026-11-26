import { it, expect } from "vitest";
import {
  pendingLiveCases,
  retry503,
  retryDelayMs,
} from "../src/lib/live-resume";
import type { EvalBatch, EvalRow } from "../src/lib/evaluation-report";
const versions = { prompt: "v1" };
const row = (
  id: string,
  pass = true,
  date = "2026-11-25T00:00:00Z",
): EvalRow => ({
  case: id,
  split: "development",
  pass,
  resultMode: pass ? "live" : "fallback",
  fallback: !pass,
  rawProviderFailure: pass ? null : "provider_http_503",
  failureCategory: pass ? null : "availability",
  guardrailPrevented: false,
  latencyMs: 1,
  tokenUsage: null,
  executionDate: date,
  model: "model",
});
const batch = (results: EvalRow[]): EvalBatch => ({
  date: "2026-11-25",
  mode: "live",
  scope: "acceptance",
  versions,
  results,
});
it("prioritizes unexecuted cases, then unresolved failures, skipping passed cases", () => {
  expect(
    pendingLiveCases(
      [{ id: "passed" }, { id: "failed" }, { id: "new" }],
      [batch([row("passed"), row("failed", false)])],
      "model",
      versions,
    ).map((c) => [c.id, c.offset]),
  ).toEqual([
    ["new", 2],
    ["failed", 1],
  ]);
});
it("uses latest compatible outcomes while preserving historical failures", () => {
  const b = batch([
    row("one", false),
    row("one", true, "2026-11-26T00:00:00Z"),
  ]);
  expect(pendingLiveCases([{ id: "one" }], [b], "model", versions)).toEqual([]);
  expect(b.results).toHaveLength(2);
  expect(
    pendingLiveCases(
      [{ id: "one" }],
      [{ ...b, versions: { prompt: "different" } }],
      "model",
      versions,
    ),
  ).toHaveLength(1);
});
it("never retries quota exhaustion or recommendation validation failures", () => {
  for (const code of [
    "provider_http_429",
    "ineligible_id",
    "unsupported_reason",
    "schema_validation_failed",
    null,
  ])
    expect(retry503(code, 0, 0)).toBe(false);
});
it("bounds transient retries by case and session and uses exponential delay", () => {
  expect(retry503("provider_http_503", 0, 0)).toBe(true);
  expect(retry503("provider_http_503", 2, 0)).toBe(false);
  expect(retry503("provider_http_503", 0, 6)).toBe(false);
  expect([retryDelayMs(0), retryDelayMs(1)]).toEqual([30000, 60000]);
});
