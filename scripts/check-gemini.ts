import fs from "node:fs";
const key = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
if (!key) {
  console.error("API key missing; no request made.");
  process.exit(2);
}
const started = performance.now();
const report: {
  date: string;
  model: string;
  mode: string;
  freeTier: string;
  modelHttpStatus?: number;
  generationHttpStatus?: number;
  connected: boolean;
  latencyMs?: number;
  tokenUsage?: unknown;
  failureCategory?: string;
} = {
  date: new Date().toISOString(),
  model,
  mode: "live-connectivity",
  freeTier: "Owner confirmed unbilled Free tier; no billing changes made",
  connected: false,
};
try {
  const metadata = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`,
    { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(12000) },
  );
  report.modelHttpStatus = metadata.status;
  if (!metadata.ok) throw Error(`model_http_${metadata.status}`);
  const info = await metadata.json();
  if (!info.supportedGenerationMethods?.includes("generateContent"))
    throw Error("generation_not_supported");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Reply with exactly OK." }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 128 },
      }),
    },
  );
  report.generationHttpStatus = response.status;
  if (!response.ok) throw Error(`generation_http_${response.status}`);
  const body = await response.json();
  const text = body.candidates?.[0]?.content?.parts
    ?.filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  report.connected =
    text === "OK" && body.candidates?.[0]?.finishReason === "STOP";
  report.tokenUsage = body.usageMetadata ?? null;
  if (!report.connected) report.failureCategory = "unexpected_smoke_response";
} catch (error) {
  report.failureCategory =
    error instanceof Error &&
    /^((model|generation)_http_\d+|generation_not_supported)$/.test(
      error.message,
    )
      ? error.message
      : "connectivity_or_timeout_failure";
}
report.latencyMs = performance.now() - started;
fs.mkdirSync("evals/connectivity", { recursive: true });
if (fs.existsSync("evals/connectivity-live.json")) {
  const old = JSON.parse(
    fs.readFileSync("evals/connectivity-live.json", "utf8"),
  );
  const path = `evals/connectivity/${old.date.replaceAll(":", "-")}.json`;
  if (!fs.existsSync(path))
    fs.copyFileSync("evals/connectivity-live.json", path);
}
fs.writeFileSync(
  `evals/connectivity/${report.date.replaceAll(":", "-")}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
fs.writeFileSync(
  "evals/connectivity-live.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
if (!report.connected) process.exitCode = 1;
