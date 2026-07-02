import { z } from "zod";

export const bookingSchema = z.object({
  fullName: z.string().min(2, "Client full name is required"),
  phone: z.string().min(8, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  desiredService: z.string().min(1),
  desiredPackage: z.string().optional(),
  bookingDate: z.string().min(1),
  bookingTime: z.string().min(1),
  locationType: z.enum(["STUDIO", "OUTDOOR", "WEDDING_VENUE", "EVENT_VENUE", "OTHER"]),
  location: z.string().optional(),
  numberOfPeople: z.coerce.number().int().positive().optional().or(z.literal("")),
  specialRequest: z.string().optional(),
  paymentStatus: z.enum(["NO_PAYMENT", "DEPOSIT_PAID", "FULLY_PAID"]),
  depositAmount: z.coerce.number().min(0).default(0)
});

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "ADJUSTMENT"]),
  categoryName: z.string().min(1),
  accountName: z.string().min(1),
  paymentMethod: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be positive"),
  transactionDate: z.string().min(1),
  transactionTime: z.string().min(1),
  serviceName: z.string().optional(),
  packageName: z.string().optional(),
  description: z.string().optional(),
  comments: z.string().optional()
});
