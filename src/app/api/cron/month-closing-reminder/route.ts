import { NextResponse } from "next/server";
import { sendMonthClosingReminder } from "@/lib/month-closing-notifications";

/**
 * Cron endpoint to send month closing reminders
 * Should be called once per day via a scheduled service
 *
 * Example cron services:
 * - Vercel Cron: Configure in vercel.json
 * - GitHub Actions: Schedule workflow
 * - External service: easycron.com, cron-job.org, etc.
 *
 * Call with Authorization header: `Bearer YOUR_CRON_SECRET`
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Verify the cron secret
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sendMonthClosingReminder();
    return NextResponse.json({ ok: true, message: "Month closing reminder sent if today is the last day of month" });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
