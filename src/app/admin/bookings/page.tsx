import { prisma } from "@/lib/prisma";
import { rwf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({ include: { client: true, service: true, package: true, assignedWorker: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Booking Management</h2>
      <div className="card table-wrap">
        <table><thead><tr><th>Client</th><th>Service</th><th>Package</th><th>Date</th><th>Payment</th><th>Status</th><th>Worker</th></tr></thead>
        <tbody>{bookings.map((booking) => <tr key={booking.id}><td>{booking.client.fullName}</td><td>{booking.service.name}</td><td>{booking.package?.name ?? "-"}</td><td>{booking.bookingDate.toLocaleDateString()} {booking.bookingTime}</td><td>{rwf(booking.depositAmount.toString())} {booking.paymentStatus}</td><td>{booking.bookingStatus}</td><td>{booking.assignedWorker?.name ?? "Unassigned"}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
