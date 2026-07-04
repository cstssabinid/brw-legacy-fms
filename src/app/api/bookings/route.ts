import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";

function clean(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || undefined;
}

async function nextBookingReference(tx: Prisma.TransactionClient, year: number, offset = 0) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const count = await tx.booking.count({ where: { createdAt: { gte: start, lt: end } } });
  return `BPH-${year}-${String(count + 1 + offset).padStart(6, "0")}`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing required booking field", issues: parsed.error.flatten() }, { status: 400 });

  try {
  const result = await prisma.$transaction(async (tx) => {
    const service = await tx.service.findFirst({ where: { name: parsed.data.desiredService, active: true } });
    if (!service) throw new Error("Unknown service");
    const selectedPackage = parsed.data.desiredPackage ? await tx.package.findFirst({ where: { name: parsed.data.desiredPackage, serviceId: service.id, active: true } }) : null;
    if (parsed.data.desiredPackage && !selectedPackage) throw new Error("Selected package is no longer available. Please choose an available package.");

    const client = await tx.client.create({
      data: {
        fullName: clean(parsed.data.fullName)!,
        phone: clean(parsed.data.phone)!,
        email: clean(parsed.data.email)
      }
    });

    let booking = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const bookingReference = await nextBookingReference(tx, new Date().getFullYear(), attempt);
      try {
        booking = await tx.booking.create({
          data: {
            bookingReference,
            clientId: client.id,
            serviceId: service.id,
            packageId: selectedPackage?.id,
            bookingDate: new Date(parsed.data.bookingDate),
            bookingTime: parsed.data.bookingTime,
            locationType: parsed.data.locationType,
            location: clean(parsed.data.location),
            numberOfPeople: parsed.data.numberOfPeople === "" ? undefined : parsed.data.numberOfPeople,
            specialRequest: clean(parsed.data.specialRequest),
            totalAmount: selectedPackage?.price,
            amountPaid: 0,
            remainingAmount: selectedPackage?.price,
            paymentStatus: "PAYMENT_NOT_CONFIRMED",
            bookingStatus: "PENDING"
          },
          include: { client: true, service: true, package: true }
        });
        break;
      } catch (error: unknown) {
        if (attempt === 4) throw error;
      }
    }
    if (!booking?.bookingReference) throw new Error("Booking reference generation failed");

    const admins = await tx.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } });
    await tx.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: "New Booking Request",
        message: `New ${service.name} booking received from ${client.fullName}. Reference: ${booking!.bookingReference}.`,
        link: "/admin/bookings"
      }))
    });
    await tx.auditLog.create({
      data: {
        action: "Public booking submitted",
        entityType: "Booking",
        entityId: booking.id,
        newValue: { bookingReference: booking.bookingReference, service: service.name, client: client.fullName }
      }
    });
    return booking;
  });

  return NextResponse.json({
    ok: true,
    booking: {
      bookingReference: result.bookingReference,
      clientFullName: result.client.fullName,
      clientPhone: result.client.phone,
      clientEmail: result.client.email,
      serviceName: result.service.name,
      packageName: result.package?.name,
      packagePrice: result.package ? Number(result.package.price) : null,
      bookingDate: result.bookingDate.toISOString(),
      bookingTime: result.bookingTime,
      locationType: result.locationType,
      location: result.location,
      numberOfPeople: result.numberOfPeople,
      specialRequest: result.specialRequest
    },
    message: "Booking request received. Please continue on WhatsApp or email for confirmation and payment instructions."
  });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Your booking could not be saved. Please check your information and try again.";
    const status = message.includes("Unknown service") || message.includes("package") ? 400 : 500;
    return NextResponse.json({ error: status === 500 ? "Your booking could not be saved. Please check your information and try again." : message }, { status });
  }
}
