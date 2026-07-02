import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorkerBookingsPage() {
  const session = await getServerSession(authOptions);
  const bookings = await prisma.booking.findMany({ where: { assignedWorkerId: session?.user.id }, include: { client: true, service: true, package: true } });
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Assigned Bookings</h2><div className="responsive-grid">{bookings.map((booking) => <article className="card p-5" key={booking.id}><h3 className="font-black">{booking.client.fullName}</h3><p>{booking.service.name}</p><p>{booking.package?.name}</p><p>{booking.bookingDate.toLocaleDateString()} {booking.bookingTime}</p></article>)}</div>{bookings.length === 0 && <p className="card p-5">No assigned bookings yet.</p>}</div>;
}
