"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Mail, MessageCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { CatalogPackage } from "@/lib/catalog";
import { buildBookingEmailUrl, buildWhatsAppBookingUrl, generateBookingMessage, locationTypeLabel } from "@/lib/booking-communications";
import { rwf } from "@/lib/utils";

const remoteServiceWords = ["online", "irembo", "rura", "rdb", "freelancing", "design"];

type BookingDraft = {
  fullName: string;
  phone: string;
  email?: string;
  desiredService: string;
  desiredPackage?: string;
  bookingDate: string;
  bookingTime: string;
  locationType: string;
  location?: string;
  numberOfPeople?: string;
  specialRequest?: string;
};

type SavedBooking = {
  bookingReference: string;
  clientFullName: string;
  clientPhone: string;
  clientEmail?: string | null;
  serviceName: string;
  packageName?: string | null;
  packagePrice?: number | null;
  bookingDate: string;
  bookingTime: string;
  locationType: string;
  location?: string | null;
  numberOfPeople?: number | null;
  specialRequest?: string | null;
};

function isRemoteService(serviceName: string) {
  const normalized = serviceName.toLowerCase();
  return remoteServiceWords.some((word) => normalized.includes(word));
}

export function BookingForm({ services, packages }: { services: string[]; packages: CatalogPackage[] }) {
  const [loading, setLoading] = useState(false);
  const [desiredPackage, setDesiredPackage] = useState("");
  const [desiredService, setDesiredService] = useState(services[0] ?? "");
  const [review, setReview] = useState<BookingDraft | null>(null);
  const [savedBooking, setSavedBooking] = useState<SavedBooking | null>(null);
  const remoteRequest = isRemoteService(desiredService);
  const availablePackages = useMemo(() => packages.filter((item) => !desiredService || item.serviceName === desiredService), [packages, desiredService]);
  const selectedPackage = availablePackages.find((item) => item.name === desiredPackage);
  const showPackageField = availablePackages.length > 0 && !remoteRequest;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const packageName = params.get("package");
    const serviceName = params.get("service");
    const selected = packages.find((item) => item.name === packageName);
    if (selected) {
      setDesiredPackage(selected.name);
      if (selected.serviceName) setDesiredService(selected.serviceName);
    }
    if (serviceName && services.includes(serviceName)) {
      setDesiredService(serviceName);
    }
  }, [packages, services]);

  useEffect(() => {
    if (remoteRequest || !availablePackages.some((item) => item.name === desiredPackage)) {
      setDesiredPackage("");
    }
  }, [availablePackages, desiredPackage, remoteRequest]);

  function prepareReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries()) as BookingDraft;
    if (payload.locationType === "OTHER" && !payload.location?.trim()) {
      toast.error("Please specify the location.");
      return;
    }
    setReview(payload);
  }

  async function confirmBooking() {
    if (!review) return;
    setLoading(true);
    const res = await fetch("/api/bookings", { method: "POST", body: JSON.stringify(review), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Your booking could not be saved. Please check your information and try again.");
      return;
    }
    setSavedBooking(data.booking);
    toast.success("Booking request received");
  }

  async function copyBookingDetails() {
    if (!savedBooking) return;
    await navigator.clipboard.writeText(generateBookingMessage(savedBooking));
    toast.success("Booking details copied.");
  }

  if (savedBooking) {
    const whatsappUrl = buildWhatsAppBookingUrl(savedBooking);
    const emailUrl = buildBookingEmailUrl(savedBooking);
    return (
      <section className="card grid gap-5 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 text-[var(--gold)]" size={30} />
          <div>
            <p className="text-sm font-black uppercase text-[var(--gold)]">Booking Request Received</p>
            <h2 className="mt-1 text-2xl font-black">Your booking request has been recorded successfully.</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Please continue with Berwa Photo Hub on WhatsApp or email to confirm availability and receive payment instructions.</p>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-4">
          <p className="text-xs font-black uppercase text-[var(--muted)]">Booking Reference</p>
          <p className="mt-1 text-3xl font-black text-[var(--gold)]">{savedBooking.bookingReference}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <a className="btn btn-primary active:scale-[0.98]" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Continue on WhatsApp</a>
          <a className="btn btn-gold active:scale-[0.98]" href={emailUrl}><Mail size={18} /> Send Booking by Email</a>
        </div>
        <button className="btn" type="button" onClick={copyBookingDetails}><Clipboard size={18} /> Copy Booking Details</button>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-4 text-sm text-[var(--muted)]">
          Payments are not processed directly through this website. Payment instructions are provided after booking confirmation through the official Berwa Photo Hub WhatsApp contact or business email. After making a payment, send your proof of payment through our official WhatsApp or email and always include your booking reference.
        </div>
      </section>
    );
  }

  if (review) {
    const packageForReview = packages.find((item) => item.name === review.desiredPackage && item.serviceName === review.desiredService);
    return (
      <section className="card grid gap-5 p-6">
        <div>
          <p className="text-sm font-black text-[var(--gold)]">Booking Details</p>
          <h2 className="mt-1 text-2xl font-black">Review your booking request</h2>
        </div>
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div><dt className="font-black">Client full name</dt><dd>{review.fullName}</dd></div>
          <div><dt className="font-black">Phone number</dt><dd>{review.phone}</dd></div>
          {review.email && <div><dt className="font-black">Email</dt><dd>{review.email}</dd></div>}
          <div><dt className="font-black">Selected service</dt><dd>{review.desiredService}</dd></div>
          <div><dt className="font-black">Selected package</dt><dd>{review.desiredPackage || "Not applicable"}</dd></div>
          <div><dt className="font-black">Package price</dt><dd>{packageForReview ? rwf(packageForReview.price) : "Not applicable"}</dd></div>
          <div><dt className="font-black">Booking date</dt><dd>{review.bookingDate}</dd></div>
          <div><dt className="font-black">Booking time</dt><dd>{review.bookingTime}</dd></div>
          <div><dt className="font-black">Location type</dt><dd>{locationTypeLabel(review.locationType)}</dd></div>
          <div><dt className="font-black">Location</dt><dd>{review.location || "Not provided"}</dd></div>
          {review.numberOfPeople && <div><dt className="font-black">Number of people</dt><dd>{review.numberOfPeople}</dd></div>}
          {review.specialRequest && <div className="md:col-span-2"><dt className="font-black">Special request</dt><dd>{review.specialRequest}</dd></div>}
        </dl>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-4 text-sm text-[var(--muted)]">
          By submitting this booking, you are sending a booking request to Berwa Photo Hub. Your session or event is confirmed after our team verifies availability and contacts you.
          <br />
          Payments are handled directly with Berwa Photo Hub. Do not send money to an account or phone number that has not been confirmed through our official WhatsApp or email.
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <button className="btn" type="button" onClick={() => setReview(null)}><Pencil size={18} /> Edit Booking Details</button>
          <button className="btn btn-primary" type="button" disabled={loading} onClick={confirmBooking}>{loading ? "Saving..." : "Confirm Booking"}</button>
        </div>
      </section>
    );
  }

  return (
    <form className="card grid gap-4 p-6" onSubmit={prepareReview}>
      <div>
        <p className="text-sm font-black text-[var(--gold)]">{remoteRequest ? "Remote Service Request" : "Booking Request"}</p>
        <h2 className="mt-1 text-2xl font-black">{desiredService || "Select a service"}</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {remoteRequest ? "Share the service details and preferred response time. The team can handle this request remotely." : "Choose your session details, package, and location. Payment instructions are shared after booking review."}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 mobile-stack">
        <input className="input" name="fullName" placeholder="Client full name" required />
        <input className="input" name="phone" placeholder="Phone number" required />
        <input className="input" name="email" type="email" placeholder="Email optional" />
        <select className="input" name="desiredService" required value={desiredService} onChange={(event) => setDesiredService(event.target.value)}>
          {services.map((service) => <option key={service}>{service}</option>)}
        </select>
        {showPackageField && (
          <label className="grid gap-2 text-sm font-bold">
            Package {selectedPackage && <span className="text-[var(--gold)]">{rwf(selectedPackage.price)}</span>}
            <select className="input" name="desiredPackage" value={desiredPackage} onChange={(event) => setDesiredPackage(event.target.value)}>
              <option value="">Package optional</option>
              {availablePackages.map((item) => <option key={item.id ?? `${item.name}-${item.price}`} value={item.name}>{item.name} - {rwf(item.price)}</option>)}
            </select>
          </label>
        )}
        {!showPackageField && <input type="hidden" name="desiredPackage" value="" />}
        <label className="grid gap-2 text-sm font-bold">
          {remoteRequest ? "Preferred response date" : "Booking date"}
          <input className="input" name="bookingDate" type="date" required />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          {remoteRequest ? "Preferred response time" : "Booking time"}
          <input className="input" name="bookingTime" type="time" required />
        </label>
        {remoteRequest ? (
          <>
            <input type="hidden" name="locationType" value="OTHER" />
            <input type="hidden" name="location" value="Remote / online" />
          </>
        ) : (
          <>
            <select className="input" name="locationType" required>
              <option value="STUDIO">Berwa Photo Hub Studio</option>
              <option value="OUTDOOR">Outdoor</option>
              <option value="CLIENT_LOCATION">Client Location</option>
              <option value="WEDDING_VENUE">Wedding Venue</option>
              <option value="EVENT_VENUE">Event Venue</option>
              <option value="OTHER">Other</option>
            </select>
            <input className="input" name="location" placeholder="Event or session location" />
            <input className="input" name="numberOfPeople" type="number" min="1" placeholder="Number of people optional" />
          </>
        )}
      </div>
      {remoteRequest && <input type="hidden" name="numberOfPeople" value="" />}
      <textarea className="input min-h-32" name="specialRequest" placeholder={remoteRequest ? "Describe the service you need, links, files to prepare, or account/application details" : "Special request or additional information"} />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-4 text-sm text-[var(--muted)]">
        Payments are not processed directly through this website. Payment instructions are provided after booking confirmation through the official Berwa Photo Hub WhatsApp contact or business email.
      </div>
      <button className="btn btn-primary" disabled={loading}>Review Booking Details</button>
    </form>
  );
}
