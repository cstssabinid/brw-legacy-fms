import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingStatusLabel, paymentStatusLabel } from "@/lib/booking-communications";

export const dynamic = "force-dynamic";

export default async function WorkerBookingsPage() {
  const session = await getServerSession(authOptions);
  const bookings = await prisma.booking.findMany({ where: { assignedWorkerId: session?.user.id }, include: { client: true, service: true, package: true } });
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Assigned Bookings</h2><div className="responsive-grid">{bookings.map((booking) => <article className="card grid gap-2 p-5" key={booking.id}><p className="text-xs font-black uppercase text-[var(--muted)]">Booking Reference</p><h3 className="font-black text-[var(--gold)]">{booking.bookingReference}</h3><p><span className="font-black">Client:</span> {booking.client.fullName}</p><p><span className="font-black">Phone:</span> {booking.client.phone}</p><p><span className="font-black">Service:</span> {booking.service.name}</p><p><span className="font-black">Package:</span> {booking.package?.name ?? "Not applicable"}</p><p><span className="font-black">Date:</span> {booking.bookingDate.toLocaleDateString()} {booking.bookingTime}</p><p><span className="font-black">Location:</span> {booking.location ?? booking.locationType}</p><p><span className="font-black">Booking status:</span> {bookingStatusLabel(booking.bookingStatus)}</p><p><span className="font-black">Payment status:</span> {paymentStatusLabel(booking.paymentStatus)}</p></article>)}</div>{bookings.length === 0 && <p className="card p-5">No assigned bookings yet.</p>}</div>;
}
