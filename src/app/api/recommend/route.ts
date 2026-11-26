import { NextResponse } from "next/server";
import { checkLiveAccess, sameOrigin } from "../../../lib/live-access.server";
import { requestSchema } from "../../../lib/schema";
import { recommend } from "../../../lib/engine";
import { geminiProvider } from "../../../lib/gemini";
export const runtime = "nodejs";
export const maxDuration = 20;
// Supplemental per-instance limit ONLY. Hosted live use additionally requires external deployment protection.
const limits = new Map<string, { time: number; count: number }>();
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request))
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
      const failure = checkLiveAccess(request.headers);
      if (failure)
        return NextResponse.json(
          { error: failure.error, code: failure.code },
          { status: failure.status, headers: { "Cache-Control": "no-store" } },
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
        key: process.env.GEMINI_API_KEY!,
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
