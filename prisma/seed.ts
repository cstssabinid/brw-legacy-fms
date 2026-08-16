import { PrismaClient, Role, ServiceType, PackageType, TransactionType, CategoryScope, AccountType, PeriodStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const emailSchema = z.string().trim().email();
const passwordSchema = z
  .string()
  .min(16, "must contain at least 16 characters")
  .regex(/[a-z]/, "must contain a lowercase letter")
  .regex(/[A-Z]/, "must contain an uppercase letter")
  .regex(/[0-9]/, "must contain a number")
  .regex(/[^A-Za-z0-9]/, "must contain a symbol");

function requiredEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for database seeding.`);
  return value;
}

function securePassword(name: string) {
  const result = passwordSchema.safeParse(requiredEnvironmentValue(name));
  if (!result.success) {
    throw new Error(`${name} ${result.error.issues.map((issue) => issue.message).join(", ")}.`);
  }
  return result.data;
}

function seedEmail(name: string, fallback: string) {
  const result = emailSchema.safeParse(process.env[name] || fallback);
  if (!result.success) throw new Error(`${name} must be a valid email address.`);
  return result.data.toLowerCase();
}

const indoorPackages = [
  { name: "BRONZE", price: 10000, includes: ["5 retouched professional pictures"] },
  { name: "SILVER", price: 25000, includes: ["10 retouched professional pictures", "Simple makeup"] },
  { name: "GOLD", price: 45000, includes: ["20 retouched professional pictures", "Full glam makeup"] }
];

const outdoorPackages = [
  { name: "BRONZE", price: 50000, includes: ["1 hour session", "15 retouched professional pictures", "Simple makeup"] },
  { name: "SILVER", price: 70000, includes: ["2 hours session", "30 retouched professional pictures", "Simple makeup"] },
  { name: "GOLD", price: 100000, includes: ["4 hours session", "50 retouched professional pictures", "Full glam makeup"] }
];

const weddingPackages = [
  { name: "BASIC PACKAGE", price: 500000, includes: ["Album with 200 pictures", "Full video", "Frame / Cadre: 2 boards of A3", "4GB flash drive"] },
  { name: "STANDARD PACKAGE", price: 800000, includes: ["Album with 200 pictures", "Full video plus highlight", "Frame / Cadre: 3 boards of A3", "Online gallery with 300 pictures", "Bride makeup", "8GB flash drive"] },
  { name: "PREMIUM PACKAGE", price: 1000000, includes: ["Photo book with 200 pictures", "Full video plus highlight", "Frame / Cadre: 4 boards of A3", "Online gallery with 500 pictures", "Bride team makeup", "Sound kit", "Live streaming", "32GB flash drive"] }
];

const eventPackages = [
  { name: "Essential Event Coverage", level: "Bronze", price: 50000, includes: ["1 hour of event coverage", "20 retouched professional pictures"] },
  { name: "Classic Event Coverage", level: "Silver", price: 80000, includes: ["2 hours of event coverage", "50 retouched professional pictures"] },
  { name: "Signature Event Coverage", level: "Gold", price: 120000, includes: ["3 hours of event coverage", "80 retouched professional pictures"] },
  { name: "Premium Event Coverage", level: "Platinum", price: 200000, includes: ["3 hours of event coverage", "80 retouched professional pictures", "Highlight video"] }
];

const services = [
  ["Studio Portrait Sessions", ServiceType.PHOTOGRAPHY],
  ["Outdoor Photography", ServiceType.PHOTOGRAPHY],
  ["Wedding Photography", ServiceType.PHOTOGRAPHY],
  ["Event Coverage", ServiceType.PHOTOGRAPHY],
  ["Custom Photo Books", ServiceType.PHOTOGRAPHY],
  ["Luxury Photo Albums", ServiceType.PHOTOGRAPHY],
  ["Flyers and Banner Design", ServiceType.DESIGN],
  ["Graphic Design", ServiceType.DESIGN],
  ["Large Format Printing", ServiceType.PRINTING],
  ["Business Cards", ServiceType.PRINTING],
  ["Online Applications", ServiceType.ONLINE],
  ["Online Services", ServiceType.ONLINE],
  ["Papeterie Services", ServiceType.PAPETERIE],
  ["Printing", ServiceType.PRINTING],
  ["Passport Photo", ServiceType.PHOTOGRAPHY],
  ["Photocopy", ServiceType.PAPETERIE],
  ["Scanning", ServiceType.PAPETERIE],
  ["Irembo Services", ServiceType.ONLINE],
  ["RURA Services", ServiceType.ONLINE],
  ["RDB Services", ServiceType.ONLINE],
  ["Invitations", ServiceType.DESIGN],
  ["Stickers", ServiceType.PRINTING],
  ["Frames / Cadres", ServiceType.PHOTOGRAPHY],
  ["Freelancing Services", ServiceType.COMPANY]
] as const;

const incomeCategories = [
  "Studio service earnings", "Indoor package earnings", "Outdoor package earnings", "Wedding package earnings",
  "Event Coverage earnings", "Graphic design earnings", "Printing earnings", "Papeterie earnings",
  "Online services earnings", "Irembo/RURA/RDB service earnings", "Freelancing earnings",
  "BRD Bursary Double Monthly income", "Company income", "Refunds", "Loan received", "Other external income"
];

const expenseCategories = [
  "Studio rent", "Company rent", "Bills", "Electricity", "Internet", "Transport / tickets",
  "Printing materials", "Makeup materials", "Camera or studio equipment", "Frames / albums / flash drives",
  "Staff payment", "Freelance worker payment", "Loan repayment", "Food", "Home expenses",
  "Family support", "Emergency expenses", "Other expenses"
];

async function main() {
  const adminEmail = seedEmail("SEED_ADMIN_EMAIL", "admin@brwlegacy.rw");
  const adminPasswordHash = await bcrypt.hash(securePassword("SEED_ADMIN_PASSWORD"), 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.SEED_ADMIN_NAME?.trim() || "BRW Legacy Admin",
      email: adminEmail,
      phone: process.env.SEED_ADMIN_PHONE?.trim() || "+250786339597",
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN
    }
  });

  const workerPassword = process.env.SEED_WORKER_PASSWORD?.trim();
  let workerEmail: string | undefined;
  if (workerPassword) {
    workerEmail = seedEmail("SEED_WORKER_EMAIL", "worker@brwlegacy.rw");
    const workerPasswordHash = await bcrypt.hash(securePassword("SEED_WORKER_PASSWORD"), 12);
    await prisma.user.upsert({
      where: { email: workerEmail },
      update: {},
      create: {
        name: process.env.SEED_WORKER_NAME?.trim() || "Berwa Photographer",
        email: workerEmail,
        phone: process.env.SEED_WORKER_PHONE?.trim() || "+250782784599",
        passwordHash: workerPasswordHash,
        role: Role.WORKER
      }
    });
  }

  const createdServices = new Map<string, string>();
  await prisma.service.updateMany({ where: { name: "Events Coverage" }, data: { active: false } });
  for (const [name, type] of services) {
    const service = await prisma.service.upsert({
      where: { id: name.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: { id: name.toLowerCase().replaceAll(" ", "-"), name, type, description: `${name} offered by BRW LEGACY CO. Ltd and Berwa Photo Hub.` }
    });
    createdServices.set(name, service.id);
  }

  const createPackages = async (serviceName: string, packageType: PackageType, list: Array<{ name: string; price: number; includes: string[]; level?: string }>) => {
    const serviceId = createdServices.get(serviceName)!;
    for (const item of list) {
      await prisma.package.upsert({
        where: { id: `${packageType}-${item.name}`.toLowerCase().replaceAll(" ", "-") },
        update: {
          serviceId,
          name: item.name,
          packageType,
          price: item.price,
          includes: item.includes,
          description: `${item.level ? `${item.level} level. ` : ""}${item.name} ${packageType.toLowerCase()} package for Berwa Photo Hub.`
        },
        create: {
          id: `${packageType}-${item.name}`.toLowerCase().replaceAll(" ", "-"),
          serviceId,
          name: item.name,
          packageType,
          price: item.price,
          includes: item.includes,
          description: `${item.level ? `${item.level} level. ` : ""}${item.name} ${packageType.toLowerCase()} package for Berwa Photo Hub.`
        }
      });
    }
  };

  await createPackages("Studio Portrait Sessions", PackageType.INDOOR, indoorPackages);
  await createPackages("Outdoor Photography", PackageType.OUTDOOR, outdoorPackages);
  await createPackages("Wedding Photography", PackageType.WEDDING, weddingPackages);
  await createPackages("Event Coverage", PackageType.EVENT, eventPackages);

  for (const name of incomeCategories) {
    await prisma.category.upsert({
      where: { id: `income-${name}`.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: { id: `income-${name}`.toLowerCase().replaceAll(" ", "-"), name, type: TransactionType.INCOME, scope: name.includes("Home") ? CategoryScope.HOME : CategoryScope.BUSINESS }
    });
  }

  for (const name of expenseCategories) {
    await prisma.category.upsert({
      where: { id: `expense-${name}`.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: { id: `expense-${name}`.toLowerCase().replaceAll(" ", "-"), name, type: TransactionType.EXPENSE, scope: name.includes("Home") || name.includes("Family") || name.includes("Food") ? CategoryScope.HOME : CategoryScope.BUSINESS }
    });
  }

  for (const [name, type] of [["Cash at Hand", AccountType.CASH], ["MTN MoMo", AccountType.MOMO], ["Bank", AccountType.BANK], ["Cheque", AccountType.CHEQUE]] as const) {
    await prisma.account.upsert({
      where: { id: name.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: { id: name.toLowerCase().replaceAll(" ", "-"), name, type, openingBalance: 0, currentBalance: 0 }
    });
  }

  const now = new Date();
  await prisma.monthlyPeriod.upsert({
    where: { month_year: { month: now.getMonth() + 1, year: now.getFullYear() } },
    update: {},
    create: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      openingBalance: 0,
      status: PeriodStatus.OPEN
    }
  });

  await prisma.settings.upsert({
    where: { key: "company" },
    update: {},
    create: {
      key: "company",
      value: {
        companyName: "BRW LEGACY CO. Ltd",
        studioName: "Berwa Photo Hub",
        location: "KN 20 Ave, Kigali, Rwanda",
        phone: "+250 786 339 597",
        email: "berwasbusinessgroup@gmail.com"
      }
    }
  });

  for (const image of [
    { id: "seed-gallery-studio", title: "Studio Portrait Placeholder", imageUrl: "/brand/studio-placeholder.svg", category: "Studio" },
    { id: "seed-gallery-wedding", title: "Wedding Story Placeholder", imageUrl: "/brand/wedding-placeholder.svg", category: "Wedding" },
    { id: "seed-gallery-outdoor", title: "Outdoor Session Placeholder", imageUrl: "/brand/outdoor-placeholder.svg", category: "Outdoor" }
  ]) {
    await prisma.galleryImage.upsert({ where: { id: image.id }, update: image, create: image });
  }

  console.log(`Database seed completed for administrator ${admin.email}${workerEmail ? ` and worker ${workerEmail}` : ""}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Database seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
