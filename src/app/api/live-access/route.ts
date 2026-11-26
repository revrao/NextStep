import { NextResponse } from "next/server";
import { checkLiveAccess, sameOrigin } from "../../../lib/live-access.server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Cross-origin requests are not allowed." },
      { status: 403, headers },
    );
  const failure = checkLiveAccess(request.headers);
  if (failure)
    return NextResponse.json(
      { error: failure.error, code: failure.code },
      { status: failure.status, headers },
    );
  // Authentication/configuration only: never call Gemini, return credentials, or create persistent sessions.
  return NextResponse.json(
    {
      unlocked: true,
      message:
        "Live AI unlocked for this tab. You can now request recommendations. Provider availability is checked when you request activities.",
    },
    { headers },
  );
}
