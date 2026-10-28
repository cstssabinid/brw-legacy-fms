import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
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
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || undefined, passwordHash, role: parsed.data.role as Role, status: "ACTIVE" },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

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
      message.includes("invalid input value for enum")
    ) {
      return NextResponse.json(
        { error: "The user database schema is unavailable. Please contact the system administrator." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "The account could not be created. Please try again." }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  role: z.enum(["CASHIER", "MANAGER", "WORKER"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional()
}).refine(({ name, email, role, status }) => name !== undefined || email !== undefined || role !== undefined || status !== undefined, {
  message: "Provide at least one account field to update"
});
const manageableStaffRoles = ["CASHIER", "MANAGER", "WORKER"];

async function requireUserAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !isAccountAdminRole(session.user.role)) return null;
  return session;
}

export async function PATCH(request: Request) {
  const session = await requireUserAdmin();
  if (!session) return NextResponse.json({ error: "You do not have permission to update users" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The user details could not be read" }, { status: 400 });
  }
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat().find(Boolean);
    return NextResponse.json({ error: firstError ?? parsed.error.issues[0]?.message ?? "Enter valid user details" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: parsed.data.id }, select: { id: true, name: true, email: true, role: true, status: true } });
  if (!target) return NextResponse.json({ error: "User account not found" }, { status: 404 });
  if (target.id === session.user.id || !manageableStaffRoles.includes(target.role)) {
    return NextResponse.json({ error: "This account cannot be changed here" }, { status: 403 });
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: target.id },
        data: {
          ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
          ...(parsed.data.email !== undefined ? { email: parsed.data.email } : {}),
          ...(parsed.data.role !== undefined ? { role: parsed.data.role as Role } : {}),
          ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {})
        },
        select: { id: true, name: true, email: true, role: true, status: true }
      });
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "User account updated",
          entityType: "User",
          entityId: target.id,
          oldValue: { name: target.name, email: target.email, role: target.role, status: target.status },
          newValue: { name: updated.name, email: updated.email, role: updated.role, status: updated.status }
        }
      });
      return updated;
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    console.error("User account update failed", error);
    return NextResponse.json({ error: "The user account could not be updated" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireUserAdmin();
  if (!session) return NextResponse.json({ error: "You do not have permission to delete users" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "The user account could not be identified" }, { status: 400 });
  }
  const parsed = z.object({ id: z.string().min(1) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "User account not found" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: parsed.data.id }, select: { id: true, name: true, email: true, role: true, status: true } });
  if (!target) return NextResponse.json({ error: "User account not found" }, { status: 404 });
  if (target.id === session.user.id || !manageableStaffRoles.includes(target.role)) {
    return NextResponse.json({ error: "This account cannot be deleted here" }, { status: 403 });
  }

  // Keep transaction and audit history intact while removing this account's ability to sign in.
  const deletedEmail = `deleted+${target.id}@deleted.invalid`;
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: {
        name: "Deleted user",
        email: deletedEmail,
        phone: null,
        avatar: null,
        passwordHash: await bcrypt.hash(randomUUID(), 12),
        role: "WORKER",
        status: "SUSPENDED"
      }
    });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "User account deleted",
        entityType: "User",
        entityId: target.id,
        oldValue: { name: target.name, email: target.email, role: target.role, status: target.status },
        newValue: { status: "SUSPENDED", accountDeleted: true }
      }
    });
  });
  return NextResponse.json({ ok: true });
}
