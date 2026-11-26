import fs from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "@playwright/test";
import { samples } from "../src/data/profiles";
const summary = JSON.parse(fs.readFileSync("evals/live-summary.json", "utf8"));
if (
  !summary.acceptanceReady ||
  process.env.AI_MODE !== "live" ||
  process.env.LIVE_EVAL_PASSED !== "true" ||
  !process.env.DEMO_ACCESS_CODE
) {
  console.error(
    "Live browser smoke not run: reviewed complete technical acceptance and local live gates are required.",
  );
  process.exit(2);
}
const url = "http://127.0.0.1:3010";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3010",
  ],
  { env: process.env, stdio: "ignore" },
);
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
const report: {
  date: string;
  passed: boolean;
  mode?: string;
  httpStatus?: number;
  providerModelVersion?: string;
  providerFailure?: string;
  latencyMs?: number;
  tokenUsage?: unknown;
  unauthenticatedStatus?: number;
  mockBackupMode?: string;
  failureCategory?: string;
} = { date: new Date().toISOString(), passed: false };
try {
  let ready = false;
  for (let i = 0; i < 30; i++) {
    if (server.exitCode !== null) throw Error("server_start_failure");
    try {
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await delay(500);
  }
  if (!ready) throw Error("server_start_failure");
  browser = await chromium.launch({
    channel: process.platform === "darwin" ? "chrome" : undefined,
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  // Standalone context: no trace, HAR, video, header dumps, or settings screenshots.
  await page.goto(url);
  await page
    .getByRole("button", { name: "Explore with fictional Milo" })
    .click();
  const unauthorized = await page.request.post(`${url}/api/recommend`, {
    data: { profile: samples[0], history: [], mode: "live" },
  });
  report.unauthenticatedStatus = unauthorized.status();
  if (unauthorized.status() !== 403) throw Error("access_control_failure");
  await page
    .getByRole("link", { name: "Profile & settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Mode", exact: true })
    .selectOption("live");
  await page
    .locator('input[type="password"]')
    .fill(process.env.DEMO_ACCESS_CODE!);
  await page.getByRole("link", { name: "Your day", exact: true }).click();
  const responsePromise = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/recommend") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Find activities", exact: true })
    .click();
  const response = await responsePromise;
  const result = await response.json();
  report.httpStatus = response.status();
  report.mode = result.mode;
  report.providerFailure = result.providerFailure;
  report.providerModelVersion = result.providerModelVersion;
  report.latencyMs = result.latencyMs;
  report.tokenUsage = result.usage ?? null;
  if (
    response.status() !== 200 ||
    result.mode !== "live" ||
    !result.recommendations?.length
  )
    throw Error("live_result_not_verified");
  await page
    .getByText(
      "Live Gemini ranking · instructions and explanations remain library-grounded.",
      { exact: true },
    )
    .waitFor();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "docs/screenshots/desktop-live-gemini.png",
    fullPage: true,
    animations: "disabled",
  });
  const mock = await page.request.post(`${url}/api/recommend`, {
    data: { profile: samples[0], history: [], mode: "mock" },
  });
  report.mockBackupMode = (await mock.json()).mode;
  if (report.mockBackupMode !== "mock") throw Error("mock_backup_failure");
  report.passed = true;
} catch (error) {
  const allowed = [
    "server_start_failure",
    "access_control_failure",
    "live_result_not_verified",
    "mock_backup_failure",
  ];
  report.failureCategory =
    error instanceof Error && allowed.includes(error.message)
      ? error.message
      : "browser_check_failed_details_redacted";
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
fs.mkdirSync("evals/browser", { recursive: true });
fs.writeFileSync(
  `evals/browser/${report.date.replaceAll(":", "-")}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
fs.writeFileSync(
  "evals/local-browser-live.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
