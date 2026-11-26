import { it, expect, afterEach, vi } from "vitest";
import { checkLiveAccess } from "../src/lib/live-access.server";
import { POST } from "../src/app/api/live-access/route";
const fixture = "fixture-classroom-access-only";
const env = {
  DEMO_ACCESS_CODE: fixture,
  AI_MODE: "live",
  LIVE_EVAL_PASSED: "true",
  GEMINI_API_KEY: "fixture-provider-key",
};
const headers = (code = fixture) => new Headers({ "x-demo-access": code });
function configure() {
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  vi.stubEnv("VERCEL", "");
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("accepts exact and surrounding-whitespace codes while preserving case and quote checks", () => {
  expect(checkLiveAccess(headers(), env)).toBeNull();
  expect(checkLiveAccess(headers("  " + fixture + "  "), env)).toBeNull();
  expect(checkLiveAccess(headers(fixture.toUpperCase()), env)?.status).toBe(
    403,
  );
  expect(checkLiveAccess(headers('"' + fixture + '"'), env)?.status).toBe(403);
});
it("reports a missing server code distinctly without exposing input", () => {
  const failure = checkLiveAccess(headers(), { ...env, DEMO_ACCESS_CODE: "" });
  expect(failure?.status).toBe(503);
  expect(failure?.code).toBe("live_not_configured");
  expect(failure?.error).toContain("restart");
  expect(failure?.error).not.toContain(fixture);
});
it.each(["AI_MODE", "LIVE_EVAL_PASSED", "GEMINI_API_KEY"])(
  "does not unlock with %s missing or disabled",
  (key) => {
    expect(checkLiveAccess(headers(), { ...env, [key]: "" })?.code).toBe(
      "live_not_ready",
    );
  },
);
it("continues to deny unprotected hosted requests", () => {
  expect(
    checkLiveAccess(headers(), {
      ...env,
      VERCEL: "1",
      CLASSROOM_DEPLOYMENT_PROTECTED: "false",
    })?.code,
  ).toBe("hosted_not_protected");
});
it("revokes rotated codes even if a client previously unlocked", () => {
  expect(checkLiveAccess(headers(), env)).toBeNull();
  expect(
    checkLiveAccess(headers(), {
      ...env,
      DEMO_ACCESS_CODE: "different-fixture-access-code",
    })?.status,
  ).toBe(403);
});
it("verifies access without provider requests, persistent sessions, secrets, or cacheable responses", async () => {
  configure();
  const fetcher = vi.fn(() => {
    throw Error("Must not call provider");
  });
  vi.stubGlobal("fetch", fetcher);
  const r = await POST(
    new Request("http://localhost/api/live-access", {
      method: "POST",
      headers: headers(),
    }),
  );
  expect(r.status).toBe(200);
  expect(await r.json()).toMatchObject({ unlocked: true });
  expect(r.headers.get("cache-control")).toBe("no-store");
  expect(r.headers.get("set-cookie")).toBeNull();
  expect(fetcher).not.toHaveBeenCalled();
});
it("returns safe actionable denial and never accepts a code through URL parameters", async () => {
  configure();
  const r = await POST(
    new Request("http://localhost/api/live-access", {
      method: "POST",
      headers: headers("incorrect-fixture"),
    }),
  );
  const text = await r.text();
  expect(r.status).toBe(403);
  expect(text).toContain("restart");
  expect(text).not.toContain("incorrect-fixture");
  expect(text).not.toContain(fixture);
  expect(r.headers.get("cache-control")).toBe("no-store");
  const query = await POST(
    new Request("http://localhost/api/live-access?code=" + fixture, {
      method: "POST",
    }),
  );
  expect(query.status).toBe(403);
});
it("rejects cross-origin or malformed Origin preflight requests", async () => {
  configure();
  for (const origin of ["https://unrelated.test", "not-a-url"]) {
    const r = await POST(
      new Request("http://localhost/api/live-access", {
        method: "POST",
        headers: { ...Object.fromEntries(headers()), origin },
      }),
    );
    expect(r.status).toBe(403);
  }
});
