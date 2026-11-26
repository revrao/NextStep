import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { requestSchema } from "../../../lib/schema";
import { recommend } from "../../../lib/engine";
import { geminiProvider } from "../../../lib/gemini";
export const runtime = "nodejs";
export const maxDuration = 20;
// Supplemental per-instance limit ONLY. Hosted live use additionally requires external deployment protection.
const limits = new Map<string, { time: number; count: number }>();
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (
      origin &&
      (!/^https?:$/.test(new URL(origin).protocol) ||
        new URL(origin).host !==
          (request.headers.get("host") ?? new URL(request.url).host))
    )
      return NextResponse.json(
        { error: "Cross-origin requests are not allowed." },
        { status: 403 },
      );
    if (Number(request.headers.get("content-length") ?? 0) > 100000)
      return NextResponse.json(
        { error: "Request is too large." },
        { status: 413 },
      );
    const text = await request.text();
    if (text.length > 100000)
      return NextResponse.json(
        { error: "Request is too large." },
        { status: 413 },
      );
    const parsed = requestSchema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Review the fictional profile and compatible feedback fields.",
        },
        { status: 400 },
      );
    let provider;
    if (parsed.data.mode === "live") {
      const code = process.env.DEMO_ACCESS_CODE,
        provided = request.headers.get("x-demo-access") ?? "";
      if (
        !code ||
        code.length < 16 ||
        Buffer.byteLength(provided) !== Buffer.byteLength(code) ||
        !timingSafeEqual(Buffer.from(provided), Buffer.from(code))
      )
        return NextResponse.json(
          {
            error:
              "Live classroom access is locked. Use mock mode or enter the configured classroom access code.",
          },
          { status: 403 },
        );
      if (
        process.env.AI_MODE !== "live" ||
        process.env.LIVE_EVAL_PASSED !== "true" ||
        !process.env.GEMINI_API_KEY
      )
        return NextResponse.json(
          {
            error:
              "Live AI is disabled until credentials and reviewed live acceptance tests are configured. Mock mode is ready.",
          },
          { status: 503 },
        );
      if (
        process.env.VERCEL &&
        process.env.CLASSROOM_DEPLOYMENT_PROTECTED !== "true"
      )
        return NextResponse.json(
          {
            error:
              "Hosted live AI requires a protected classroom deployment. Public visitors must use mock mode.",
          },
          { status: 503 },
        );
      const now = Date.now(),
        current = limits.get("classroom");
      const entry =
        current && now - current.time < 60000
          ? current
          : { time: now, count: 0 };
      if (entry.count >= 3)
        return NextResponse.json(
          {
            error:
              "Classroom request limit reached. Wait one minute or use mock mode.",
          },
          { status: 429, headers: { "Retry-After": "60" } },
        );
      entry.count++;
      limits.set("classroom", entry);
      provider = geminiProvider({
        key: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite",
      });
    }
    return NextResponse.json(await recommend(parsed.data, provider), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The request could not be processed. Review the profile or try mock mode.",
      },
      { status: 400 },
    );
  }
}
