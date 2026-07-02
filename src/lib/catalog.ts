import { PackageType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { packages as fallbackPackages, services as fallbackServices } from "@/lib/brand";

export type CatalogPackage = {
  id?: string;
  name: string;
  level?: string | null;
  price: number;
  includes: string[];
  packageType?: PackageType;
  serviceName?: string;
  active?: boolean;
};

const levelFromDescription = (description?: string | null) => description?.match(/^(Bronze|Silver|Gold|Platinum) level\./)?.[1] ?? null;

export async function getActiveServices() {
  try {
    const services = await prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
    return services.map((service) => service.name);
  } catch {
    return fallbackServices;
  }
}

export async function getActiveCatalogPackages() {
  try {
    const rows = await prisma.package.findMany({
      where: { active: true },
      include: { service: true },
      orderBy: [{ packageType: "asc" }, { price: "asc" }]
    });
    return rows.map((item) => ({
      id: item.id,
      name: item.name,
      level: levelFromDescription(item.description),
      price: Number(item.price),
      includes: Array.isArray(item.includes) ? item.includes.map(String) : [],
      packageType: item.packageType,
      serviceName: item.service.name,
      active: item.active
    }));
  } catch {
    return [
      ...fallbackPackages.indoor.map((item) => ({ ...item, packageType: PackageType.INDOOR, serviceName: "Studio Portrait Sessions" })),
      ...fallbackPackages.outdoor.map((item) => ({ ...item, packageType: PackageType.OUTDOOR, serviceName: "Outdoor Photography" })),
      ...fallbackPackages.wedding.map((item) => ({ ...item, packageType: PackageType.WEDDING, serviceName: "Wedding Photography" })),
      ...fallbackPackages.event.map((item) => ({ ...item, packageType: PackageType.EVENT, serviceName: "Event Coverage" }))
    ];
  }
}

export function packagesByType(items: CatalogPackage[]) {
  return {
    indoor: items.filter((item) => item.packageType === PackageType.INDOOR),
    outdoor: items.filter((item) => item.packageType === PackageType.OUTDOOR),
    wedding: items.filter((item) => item.packageType === PackageType.WEDDING),
    event: items.filter((item) => item.packageType === PackageType.EVENT)
  };
}
