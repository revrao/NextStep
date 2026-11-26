import { describe, it, expect } from "vitest";
import {
  summarizeLive,
  type EvalRow,
  type EvalBatch,
} from "../src/lib/evaluation-report";
const versions = { prompt: "p", schema: "s", rules: "r", library: "l" };
const row = (patch: Partial<EvalRow> = {}): EvalRow => ({
  case: "one",
  split: "development",
  pass: true,
  resultMode: "live",
  fallback: false,
  failureCategory: null,
  rawProviderFailure: null,
  guardrailPrevented: false,
  latencyMs: 1000,
  tokenUsage: { input: 10, output: 5, total: 15 },
  executionDate: "2026-11-25T10:00:00Z",
  ...patch,
});
const batch = (rows: EvalRow[], patch: Partial<EvalBatch> = {}): EvalBatch => ({
  date: "2026-11-25",
  mode: "live",
  scope: "acceptance",
  versions,
  results: rows,
  ...patch,
});
describe("honest evaluation aggregation", () => {
  it("retains failures in attempt denominator and latency after a passing recheck", () => {
    const s = summarizeLive(
      [
        batch([
          row({
            pass: false,
            resultMode: "fallback",
            fallback: true,
            rawProviderFailure: "provider_timeout",
            latencyMs: 12000,
            tokenUsage: null,
          }),
          row({ executionDate: "2026-11-25T10:01:00Z" }),
        ]),
      ],
      ["one"],
      "model",
      versions,
    );
    expect(s.attempts).toBe(2);
    expect(s.successful).toBe(1);
    expect(s.successRate).toBe(0.5);
    expect(s.coverage.passed).toBe(1);
    expect(s.coverage.executed).toBe(1);
    expect(s.p95LatencyMs).toBe(12000);
    expect(s.invalidOutputsPrevented).toBe(0);
    expect(s.transportFailures).toBe(1);
  });
  it("does not count a fallback as live success even when its case passed", () => {
    const s = summarizeLive(
      [batch([row({ resultMode: "fallback", fallback: true })])],
      ["one"],
      "model",
      versions,
    );
    expect(s.successful).toBe(0);
    expect(s.coverage.passed).toBe(0);
    expect(s.acceptanceReady).toBe(false);
  });
  it("separates unsafe-output prevention from availability errors", () => {
    const s = summarizeLive(
      [
        batch([
          row({
            pass: false,
            resultMode: "fallback",
            fallback: true,
            rawProviderFailure: "ineligible_id",
          }),
          row({
            pass: false,
            resultMode: "fallback",
            fallback: true,
            rawProviderFailure: "provider_http_429",
          }),
        ]),
      ],
      ["one"],
      "model",
      versions,
    );
    expect(s.invalidOutputsPrevented).toBe(1);
    expect(s.transportFailures).toBe(1);
  });
  it("excludes mock reports and mismatched behavior versions", () => {
    const s = summarizeLive(
      [
        batch([row()], { mode: "mock" }),
        batch([row()], { versions: { ...versions, prompt: "other" } }),
      ],
      ["one"],
      "model",
      versions,
    );
    expect(s.attempts).toBe(0);
    expect(s.successRate).toBeNull();
    expect(s.estimatedCostUsd).toBeNull();
    expect(s.humanReviewedRelevance.reviewed).toBe(0);
  });
  it("requires missing-case coverage rather than extrapolating a small batch", () => {
    const s = summarizeLive(
      [batch([row()])],
      ["one", "two"],
      "model",
      versions,
    );
    expect(s.coverage.missing).toEqual(["two"]);
    expect(s.acceptanceReady).toBe(false);
  });
});

it("excludes other provider models even when a row omits model metadata", () => {
  const result = summarizeLive(
    [batch([row()], { model: "different-model" })],
    ["one"],
    "model",
    versions,
  );
  expect(result.attempts).toBe(0);
});
it("does not use repeated success on one sample as three-profile coverage", () => {
  const result = summarizeLive(
    [
      batch([row()]),
      batch(
        [
          row({ case: "sample-milo" }),
          row({ case: "sample-milo" }),
          row({ case: "sample-milo" }),
        ],
        { scope: "sample-profiles" },
      ),
      batch(
        [
          row({ case: "journey-enjoyed-and-struggled" }),
          row({ case: "journey-not-interested" }),
        ],
        { scope: "feedback-journey" },
      ),
    ],
    ["one"],
    "model",
    versions,
  );
  expect(result.coverage.passed).toBe(1);
  expect(result.acceptanceReady).toBe(false);
});
