import { z } from "zod";

export const bookingSchema = z.object({
  fullName: z.string().trim().min(2, "Client full name is required").max(120),
  phone: z.string().trim().min(8, "Phone number is required").max(40),
  email: z.string().email().optional().or(z.literal("")),
  desiredService: z.string().trim().min(1).max(120),
  desiredPackage: z.string().trim().optional(),
  bookingDate: z.string().min(1),
  bookingTime: z.string().min(1),
  locationType: z.enum(["STUDIO", "OUTDOOR", "CLIENT_LOCATION", "WEDDING_VENUE", "EVENT_VENUE", "OTHER"]),
  location: z.string().trim().max(200).optional(),
  numberOfPeople: z.coerce.number().int().positive().optional().or(z.literal("")),
  specialRequest: z.string().trim().max(1200).optional()
}).superRefine((data, ctx) => {
  if (data.locationType === "OTHER" && !data.location?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify the location", path: ["location"] });
  }
});

export const bookingPaymentSchema = z.object({
  amount: z.coerce.number().positive("Payment amount is required"),
  paymentMethod: z.string().trim().min(1).max(80),
  paymentReference: z.string().trim().max(120).optional(),
  proofReceivedThrough: z.enum(["WhatsApp", "Email", "Physical Receipt", "Bank Confirmation", "MoMo Confirmation", "Other"]),
  proofAttachmentUrl: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(1000).optional()
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
