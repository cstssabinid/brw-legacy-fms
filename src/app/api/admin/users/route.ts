import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(16),
  role: z.enum(["CASHIER", "WORKER"])
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid user details", issues: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || undefined,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role as Role,
      status: "ACTIVE"
    },
    select: { id: true, name: true, email: true, role: true, status: true }
  });

  return NextResponse.json({ user }, { status: 201 });
}