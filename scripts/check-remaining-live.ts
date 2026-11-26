import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { versions } from "../src/lib/engine";
import development from "../evals/development-v1.json";
import heldout from "../evals/heldout-v1.json";
const cases = [...development, ...heldout].filter(
  (c) =>
    !("rawOutput" in c) &&
    !("reject" in c.expected && c.expected.reject) &&
    !("abstain" in c.expected && c.expected.abstain),
);
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const executed = new Set<string>();
for (const name of fs
  .readdirSync("evals/live")
  .filter((n) => n.endsWith(".json"))) {
  const b = JSON.parse(fs.readFileSync(`evals/live/${name}`, "utf8"));
  if (
    b.scope !== "acceptance" ||
    !Object.entries(versions).every(([k, v]) => b.versions[k] === v)
  )
    continue;
  for (const r of b.results) if (r.model === model) executed.add(r.case);
}
const missing = cases
  .map((c, offset) => ({ id: c.id, offset }))
  .filter((c) => !executed.has(c.id));
if (missing.length > 20)
  throw Error(
    "This finite continuation is capped at 20 unexecuted cases; inspect coverage first.",
  );
let calls = 0,
  availabilityFailures = 0;
for (let i = 0; i < missing.length;) {
  const first = missing[i];
  let limit = 1;
  while (
    limit < 3 &&
    i + limit < missing.length &&
    missing[i + limit].offset === first.offset + limit
  )
    limit++;
  console.log(
    `Single-pass coverage: ${first.id}, up to ${limit} unexecuted requests; no failed case is retried.`,
  );
  const run = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "scripts/evaluate.ts",
      "--live",
      `--limit=${limit}`,
      `--offset=${first.offset}`,
    ],
    { env: process.env, stdio: "inherit" },
  );
  const report = JSON.parse(fs.readFileSync("evals/latest-live.json", "utf8"));
  if (
    report.scope !== "acceptance" ||
    report.batchOffset !== first.offset ||
    !report.results.length
  )
    throw Error("Missing or stale batch report; stop.");
  calls += report.results.length;
  i += report.results.length;
  if (run.status !== 0) {
    const last = report.results.at(-1);
    const reason = last.rawProviderFailure;
    if (
      ![
        "provider_http_503",
        "provider_http_500",
        "provider_timeout",
        "provider_network_failure",
      ].includes(reason)
    ) {
      console.error(
        "Stopped on quota, acceptance, or output-validation failure; no criteria relaxed.",
      );
      process.exit(1);
    }
    availabilityFailures++;
    if (availabilityFailures >= 2) {
      console.error(
        "Stopped after two further availability failures; failed cases remain failed and no retries occur.",
      );
      process.exit(1);
    }
    console.log(
      "Availability failure recorded. Cooling down 60 seconds before DIFFERENT, unexecuted cases; no retry.",
    );
    await delay(60000);
  }
  if (calls >= 20) break;
}
console.log(
  `Finite coverage pass finished after ${calls} new requests. Inspect aggregate; failed attempts are not successes.`,
);
