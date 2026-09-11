import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const feedbackSchema = z.object({
  name: z.string().trim().max(80).optional(),
  session: z.string().trim().max(120).optional(),
  quote: z.string().trim().min(2).max(500),
  image: z.string().startsWith("data:image/").max(2_000_000)
});

export async function GET() {
  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 24
    });
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Failed to fetch feedback", error);
    return NextResponse.json({ feedback: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Comment and picture are required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        name: parsed.data.name || "Client",
        session: parsed.data.session || "Berwa Photo Hub service",
        quote: parsed.data.quote,
        image: parsed.data.image
      }
    });

    const allFeedback = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 24
    });

    return NextResponse.json({ ok: true, feedback: allFeedback });
  } catch (error) {
    console.error("Failed to post feedback", error);
    return NextResponse.json(
      { error: "Failed to save feedback. Please try again." },
      { status: 500 }
    );
  }
}

