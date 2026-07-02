import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing required booking field", issues: parsed.error.flatten() }, { status: 400 });

  const service = await prisma.service.findFirst({ where: { name: parsed.data.desiredService } });
  if (!service) return NextResponse.json({ error: "Unknown service" }, { status: 400 });
  const selectedPackage = parsed.data.desiredPackage ? await prisma.package.findFirst({ where: { name: parsed.data.desiredPackage, serviceId: service.id } }) : null;

  const client = await prisma.client.create({
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined
    }
  });

  const booking = await prisma.booking.create({
    data: {
      clientId: client.id,
      serviceId: service.id,
      packageId: selectedPackage?.id,
      bookingDate: new Date(parsed.data.bookingDate),
      bookingTime: parsed.data.bookingTime,
      locationType: parsed.data.locationType,
      location: parsed.data.location,
      numberOfPeople: parsed.data.numberOfPeople === "" ? undefined : parsed.data.numberOfPeople,
      specialRequest: parsed.data.specialRequest,
      totalAmount: selectedPackage?.price,
      depositAmount: parsed.data.depositAmount,
      remainingAmount: selectedPackage ? Number(selectedPackage.price) - parsed.data.depositAmount : undefined,
      paymentStatus: parsed.data.paymentStatus,
      bookingStatus: "PENDING"
    }
  });

  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } });
  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title: "New booking request",
      message: `${client.fullName} requested ${service.name}.`,
      link: `/admin/bookings/${booking.id}`
    }))
  });

  return NextResponse.json({ ok: true, bookingId: booking.id, message: "Booking received. Admin will confirm and assign a worker." });
}
