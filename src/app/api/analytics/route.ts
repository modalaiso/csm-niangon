import { NextResponse } from "next/server";
import { logAnalyticsEvent } from "@/app/actions/analytics";
import {
  ANALYTICS_EVENT_NAMES,
  type LogAnalyticsEventInput,
} from "@/lib/analytics-types";

export async function POST(request: Request) {
  let payload: LogAnalyticsEventInput;

  try {
    payload = (await request.json()) as LogAnalyticsEventInput;
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (!ANALYTICS_EVENT_NAMES.includes(payload?.name)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const result = await logAnalyticsEvent(payload);
  return NextResponse.json(result, {
    status: "success" in result ? 202 : 400,
  });
}
