import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rwf(amount: number | string | null | undefined) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0
  }).format(value);
}

export function monthLabel(month: number, year: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
}
