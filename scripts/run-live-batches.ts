import { spawnSync } from "node:child_process";
// Explicit finite continuation, never automatic retries. Each child caps itself at three calls.
const arg = process.argv.find((a) => a.startsWith("--start-offset="));
const start = arg ? Number(arg.split("=")[1]) : 0;
if (!Number.isInteger(start) || start < 0 || start > 35)
  throw Error("Use a start offset from 0 to 35.");
const offsets = Array.from(
  { length: Math.ceil((36 - start) / 3) },
  (_, i) => start + i * 3,
);
for (const offset of offsets) {
  console.log(
    `Acceptance batch offset ${offset}: up to 3 paced requests; abort on failure.`,
  );
  const child = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "scripts/evaluate.ts",
      "--live",
      "--limit=3",
      `--offset=${offset}`,
    ],
    { stdio: "inherit", env: process.env },
  );
  if (child.status !== 0) {
    console.error(
      "Bounded run stopped; no automatic retry. Investigate the saved batch.",
    );
    process.exit(child.status ?? 1);
  }
}
