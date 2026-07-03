import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const feedbackFile = path.join(process.cwd(), "data", "client-feedback.json");

const feedbackSchema = z.object({
  name: z.string().trim().max(80).optional(),
  session: z.string().trim().max(120).optional(),
  quote: z.string().trim().min(2).max(500),
  image: z.string().startsWith("data:image/").max(2_000_000)
});

type StoredFeedback = z.infer<typeof feedbackSchema> & {
  id: string;
  createdAt: string;
};

async function readFeedback() {
  try {
    const file = await readFile(feedbackFile, "utf8");
    const items = JSON.parse(file);
    return Array.isArray(items) ? (items as StoredFeedback[]) : [];
  } catch {
    return [];
  }
}

async function writeFeedback(items: StoredFeedback[]) {
  await mkdir(path.dirname(feedbackFile), { recursive: true });
  await writeFile(feedbackFile, JSON.stringify(items, null, 2));
}

export async function GET() {
  const feedback = await readFeedback();
  return NextResponse.json({ feedback });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Comment and picture are required" }, { status: 400 });

  const item: StoredFeedback = {
    id: randomUUID(),
    name: parsed.data.name || "Client",
    session: parsed.data.session || "Berwa Photo Hub service",
    quote: parsed.data.quote,
    image: parsed.data.image,
    createdAt: new Date().toISOString()
  };
  const feedback = [item, ...(await readFeedback())].slice(0, 24);
  await writeFeedback(feedback);

  return NextResponse.json({ ok: true, feedback });
}
