import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  // This statement is static and idempotent; no user input is interpolated.
  await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CASHIER'`);
  console.log("Verified that the CASHIER role exists in the database enum.");
} finally {
  await prisma.$disconnect();
}
