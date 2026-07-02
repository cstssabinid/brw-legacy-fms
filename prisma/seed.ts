import { PrismaClient, Role, ServiceType, PackageType, TransactionType, CategoryScope, AccountType, PeriodStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@brwlegacy.rw" },
    update: {},
    create: { name: "BRW Legacy Admin", email: "admin@brwlegacy.rw", phone: "+250786339597", passwordHash, role: Role.SUPER_ADMIN }
  });

  const workerPassword = await bcrypt.hash("Worker@12345", 12);
  const worker = await prisma.user.upsert({
    where: { email: "worker@brwlegacy.rw" },
    update: {},
    create: { name: "Berwa Photographer", email: "worker@brwlegacy.rw", phone: "+250782784599", passwordHash: workerPassword, role: Role.WORKER }
  });

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
  const period = await prisma.monthlyPeriod.upsert({
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

  const client = await prisma.client.create({ data: { fullName: "Sample Client", phone: "+250783128500", email: "client@example.com" } });
  const incomeCategory = await prisma.category.findFirstOrThrow({ where: { type: TransactionType.INCOME } });
  const expenseCategory = await prisma.category.findFirstOrThrow({ where: { name: "Printing materials" } });
  const cash = await prisma.account.findFirstOrThrow({ where: { type: AccountType.CASH } });

  await prisma.transaction.createMany({
    data: [
      { periodId: period.id, type: TransactionType.INCOME, categoryId: incomeCategory.id, clientId: client.id, accountId: cash.id, paymentMethod: "Cash", amount: 25000, transactionDate: now, transactionTime: "09:00", description: "Sample indoor studio income", status: "CONFIRMED", recordedById: worker.id, confirmedById: admin.id, confirmedAt: now },
      { periodId: period.id, type: TransactionType.EXPENSE, categoryId: expenseCategory.id, accountId: cash.id, paymentMethod: "Cash", amount: 8000, transactionDate: now, transactionTime: "14:00", description: "Sample printing material expense", status: "CONFIRMED", recordedById: admin.id, confirmedById: admin.id, confirmedAt: now }
    ],
    skipDuplicates: true
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

  await prisma.galleryImage.createMany({
    data: [
      { title: "Studio Portrait Placeholder", imageUrl: "/brand/studio-placeholder.svg", category: "Studio" },
      { title: "Wedding Story Placeholder", imageUrl: "/brand/wedding-placeholder.svg", category: "Wedding" },
      { title: "Outdoor Session Placeholder", imageUrl: "/brand/outdoor-placeholder.svg", category: "Outdoor" }
    ],
    skipDuplicates: true
  });
}

main().finally(async () => prisma.$disconnect());
