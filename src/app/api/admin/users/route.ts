import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(16),
  role: z.enum(["CASHIER", "WORKER"])
});

function databaseErrorDetails(error: unknown) {
  return {
    code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : "",
    message: error instanceof Error ? error.message : ""
  };
}

function isMissingCashierEnum(error: unknown) {
  const { message } = databaseErrorDetails(error);
  const normalized = message.toLowerCase();
  return normalized.includes("cashier") && normalized.includes("enum");
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isAccountAdminRole(session.user.role)) {
    return NextResponse.json({ error: "You do not have permission to create users" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The user details could not be read" }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat().find(Boolean);
    return NextResponse.json({ error: firstError ?? "Invalid user details", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const createUser = () => prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || undefined, passwordHash, role: parsed.data.role as Role, status: "ACTIVE" },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    let user;
    try {
      user = await createUser();
    } catch (createError) {
      if (parsed.data.role !== "CASHIER" || !isMissingCashierEnum(createError)) throw createError;

      console.warn("CASHIER enum is missing; applying the idempotent role repair before retrying user creation");
      await prisma.$executeRaw`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CASHIER'`;
      user = await createUser();
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("User account creation failed", error);
    const { code, message } = databaseErrorDetails(error);

    if (code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    if (code === "P1001" || message.includes("Can't reach database server")) {
      return NextResponse.json({ error: "The database is temporarily unavailable. Please try again shortly." }, { status: 503 });
    }
    if (
      code === "P2021" ||
      code === "P2022" ||
      message.includes("invalid input value for enum") ||
      message.includes("CASHIER")
    ) {
      return NextResponse.json(
        { error: "The restricted staff database update could not be completed automatically. Please contact the system administrator." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "The account could not be created. Please try again." }, { status: 500 });
  }
}
