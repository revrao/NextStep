import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { versions } from "../src/lib/engine";
import {
  pendingLiveCases,
  retry503,
  retryDelayMs,
} from "../src/lib/live-resume";
import type { EvalBatch } from "../src/lib/evaluation-report";
import development from "../evals/development-v1.json";
import heldout from "../evals/heldout-v1.json";
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const cases = [...development, ...heldout].filter(
  (c) =>
    !("rawOutput" in c) &&
    !("reject" in c.expected && c.expected.reject) &&
    !("abstain" in c.expected && c.expected.abstain),
);
const batches: EvalBatch[] = fs
  .readdirSync("evals/live")
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(fs.readFileSync(`evals/live/${f}`, "utf8")));
const pending = pendingLiveCases(cases, batches, model, versions);
if (pending.length > 16)
  throw Error(
    "Resume is capped at 16 outstanding cases; inspect model/version coverage before a larger run.",
  );
const session = {
  date: new Date().toISOString(),
  model,
  versions,
  planned: pending.map((c) => c.id),
  attempts: 0,
  retries: 0,
  completed: [] as string[],
  stopReason: null as string | null,
};
try {
  console.log(
    `Resuming ${pending.length} outstanding cases only; single-request batches, maximum 22 requests, 2 retries/case and 6 retries/session.`,
  );
  for (const c of pending) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (session.attempts >= 22) {
        session.stopReason = "session_request_budget";
        break;
      }
      if (attempt) {
        const ms = retryDelayMs(attempt - 1);
        console.log(
          `HTTP 503 backoff ${ms / 1000}s before bounded retry of ${c.id}.`,
        );
        await delay(ms);
        session.retries++;
      }
      const attemptStarted = Date.now();
      const child = spawnSync(
        process.execPath,
        [
          "--import",
          "tsx",
          "scripts/evaluate.ts",
          "--live",
          "--limit=1",
          `--offset=${c.offset}`,
        ],
        { env: process.env, stdio: "inherit" },
      );
      const b = JSON.parse(fs.readFileSync("evals/latest-live.json", "utf8"));
      const row = b.results?.[0];
      if (
        Date.parse(b.date) < attemptStarted ||
        b.scope !== "acceptance" ||
        b.batchOffset !== c.offset ||
        row?.case !== c.id
      ) {
        session.stopReason = "missing_or_stale_report";
        break;
      }
      session.attempts++;
      if (child.status === 0 && row.pass && row.resultMode === "live") {
        session.completed.push(c.id);
        break;
      }
      if (!retry503(row.rawProviderFailure, attempt, session.retries)) {
        session.stopReason =
          row.rawProviderFailure === "provider_http_503"
            ? "persistent_provider_503"
            : (row.rawProviderFailure ??
              row.failureCategory ??
              "runner_failure");
        break;
      }
    }
    if (session.stopReason) break;
  }
} finally {
  fs.mkdirSync("evals/sessions", { recursive: true });
  fs.writeFileSync(
    `evals/sessions/${Date.now()}-resume.json`,
    JSON.stringify(session, null, 2) + "\n",
  );
  console.log(JSON.stringify(session, null, 2));
}
if (session.stopReason) process.exitCode = 1;
