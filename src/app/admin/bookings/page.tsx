import { prisma } from "@/lib/prisma";
import { buildAdminWhatsAppUrl, bookingStatusLabel, paymentStatusLabel } from "@/lib/booking-communications";
import { rwf } from "@/lib/utils";
import { BookingPaymentForm } from "@/components/booking-payment-form";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { client: true, service: true, package: true, assignedWorker: true, payments: { where: { status: "CONFIRMED" }, include: { confirmedBy: true }, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" }
  });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Booking Management</h2>
      <div className="responsive-grid">
        {bookings.map((booking) => {
          const total = Number(booking.totalAmount ?? 0);
          const paid = booking.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
          const remaining = Math.max(total - paid, 0);
          const adminMessage = `Hello ${booking.client.fullName},

This is Berwa Photo Hub regarding your booking request.

Booking Reference: ${booking.bookingReference}

Service: ${booking.service.name}
Package: ${booking.package?.name ?? "Not applicable"}
Booking Date: ${booking.bookingDate.toLocaleDateString("en-RW")}

We are contacting you regarding the confirmation of your booking.

Thank you,
Berwa Photo Hub`;
          return (
            <article className="card p-5" key={booking.id}>
              <p className="text-xs font-black uppercase text-[var(--muted)]">Booking Reference</p>
              <h3 className="mt-1 text-xl font-black text-[var(--gold)]">{booking.bookingReference ?? "Reference pending"}</h3>
              <div className="mt-4 grid gap-2 text-sm">
                <p><span className="font-black">Client:</span> {booking.client.fullName}</p>
                <p><span className="font-black">Service:</span> {booking.service.name}</p>
                <p><span className="font-black">Package:</span> {booking.package?.name ?? "Not applicable"}</p>
                <p><span className="font-black">Total:</span> {rwf(total)}</p>
                <p><span className="font-black">Paid:</span> {rwf(paid)}</p>
                <p><span className="font-black">Remaining:</span> {rwf(remaining)}</p>
                <p><span className="font-black">Booking Status:</span> {bookingStatusLabel(booking.bookingStatus)}</p>
                <p><span className="font-black">Payment Status:</span> {paymentStatusLabel(booking.paymentStatus)}</p>
                <p><span className="font-black">Date:</span> {booking.bookingDate.toLocaleDateString("en-RW")} {booking.bookingTime}</p>
                <p><span className="font-black">Worker:</span> {booking.assignedWorker?.name ?? "Unassigned"}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a className="btn" href={buildAdminWhatsAppUrl(booking.client.phone, adminMessage)} target="_blank" rel="noreferrer">Contact on WhatsApp</a>
                {booking.client.email && <a className="btn" href={`mailto:${booking.client.email}?subject=${encodeURIComponent(`Berwa Photo Hub Booking ${booking.bookingReference}`)}&body=${encodeURIComponent(adminMessage)}`}>Send Email</a>}
              </div>
              <BookingPaymentForm bookingId={booking.id} remainingAmount={remaining} />
            </article>
          );
        })}
      </div>
      {bookings.length === 0 && <p className="card p-5">No booking requests yet.</p>}
    </div>
  );
}
