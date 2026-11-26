import { timingSafeEqual } from "node:crypto";
export type LiveAccessFailure = {
  status: 403 | 503;
  error: string;
  code:
    | "access_denied"
    | "live_not_configured"
    | "live_not_ready"
    | "hosted_not_protected";
};
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const url = new URL(origin);
    return (
      /^https?:$/.test(url.protocol) &&
      url.host === (request.headers.get("host") ?? new URL(request.url).host)
    );
  } catch {
    return false;
  }
}
// Same check for preflight and every recommendation. UI unlock state never authorizes a request.
export function checkLiveAccess(
  headers: Headers,
  env: Readonly<Record<string, string | undefined>> = process.env,
): LiveAccessFailure | null {
  const expected = env.DEMO_ACCESS_CODE?.trim();
  const provided = (headers.get("x-demo-access") ?? "").trim();
  if (!provided)
    return {
      status: 403,
      code: "access_denied",
      error:
        "Live classroom access is locked. Enter the classroom access code in Profile & settings, then select Unlock Live AI.",
    };
  if (!expected || expected.length < 16)
    return {
      status: 503,
      code: "live_not_configured",
      error:
        "This running server has no valid classroom access code configured. Check local configuration and restart NextStep.",
    };
  if (
    provided.length > 256 ||
    Buffer.byteLength(provided) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  )
    return {
      status: 403,
      code: "access_denied",
      error:
        "The classroom access code was not recognized by this running server. Copy only the code value, without the variable name or quotes. If the code changed after startup, restart NextStep and try again.",
    };
  if (
    env.AI_MODE !== "live" ||
    env.LIVE_EVAL_PASSED !== "true" ||
    !env.GEMINI_API_KEY
  )
    return {
      status: 503,
      code: "live_not_ready",
      error:
        "Live AI is disabled on this running server. Credentials and reviewed live acceptance must be configured. Restart NextStep after configuration changes, or use mock mode.",
    };
  if (env.VERCEL && env.CLASSROOM_DEPLOYMENT_PROTECTED !== "true")
    return {
      status: 503,
      code: "hosted_not_protected",
      error:
        "Hosted live AI requires a protected classroom deployment. Public visitors must use mock mode.",
    };
  return null;
}
