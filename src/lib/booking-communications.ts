import { rwf } from "@/lib/utils";

export const BERWA_WHATSAPP_NUMBER = "+250 786 339 597";
export const BERWA_WHATSAPP_URL = "https://wa.me/250786339597";
export const BERWA_EMAIL = "berwasbusinessgroup@gmail.com";

type BookingMessageInput = {
  bookingReference: string;
  clientFullName: string;
  clientPhone: string;
  clientEmail?: string | null;
  serviceName: string;
  packageName?: string | null;
  packagePrice?: number | string | null;
  bookingDate: string | Date;
  bookingTime: string;
  locationType: string;
  location?: string | null;
  numberOfPeople?: number | string | null;
  specialRequest?: string | null;
};

const notProvided = "Not provided";

export function locationTypeLabel(value: string) {
  const labels: Record<string, string> = {
    STUDIO: "Berwa Photo Hub Studio",
    OUTDOOR: "Outdoor",
    CLIENT_LOCATION: "Client Location",
    WEDDING_VENUE: "Wedding Venue",
    EVENT_VENUE: "Event Venue",
    OTHER: "Other"
  };
  return labels[value] ?? value;
}

export function paymentStatusLabel(value: string) {
  const labels: Record<string, string> = {
    PAYMENT_NOT_CONFIRMED: "Payment Not Confirmed",
    DEPOSIT_CONFIRMED: "Deposit Confirmed",
    PARTIALLY_PAID: "Partially Paid",
    FULLY_PAID: "Fully Paid"
  };
  return labels[value] ?? value;
}

export function bookingStatusLabel(value: string) {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
  };
  return labels[value] ?? value;
}

export function formatBookingDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-RW", { year: "numeric", month: "long", day: "numeric" });
}

export function generateBookingMessage(booking: BookingMessageInput, channel: "whatsapp" | "email" = "whatsapp") {
  const formattedPrice = booking.packagePrice === null || booking.packagePrice === undefined ? "Not applicable" : rwf(booking.packagePrice);
  const introReference = channel === "email" ? `Booking Reference: ${booking.bookingReference}` : `BOOKING REFERENCE:\n${booking.bookingReference}`;

  return `Hello Berwa Photo Hub,

I would like to confirm my booking request.

${introReference}

CLIENT INFORMATION

Full Name: ${booking.clientFullName}
Phone Number: ${booking.clientPhone}
Email: ${booking.clientEmail || notProvided}

BOOKING DETAILS

Service: ${booking.serviceName}
Package: ${booking.packageName || "Not applicable"}
Package Price: ${formattedPrice}
Booking Date: ${formatBookingDate(booking.bookingDate)}
Booking Time: ${booking.bookingTime}
Location Type: ${locationTypeLabel(booking.locationType)}
Location: ${booking.location || notProvided}
Number of People: ${booking.numberOfPeople || notProvided}

SPECIAL REQUEST

${booking.specialRequest || "No special request"}

I understand that my booking is currently pending confirmation.

Please confirm service availability and provide the appropriate payment instructions.

If I make a payment, I will send the proof of payment here on WhatsApp or through the official Berwa Photo Hub email.

Thank you.

Booking Reference: ${booking.bookingReference}`;
}

export function buildWhatsAppBookingUrl(booking: BookingMessageInput) {
  return `${BERWA_WHATSAPP_URL}?text=${encodeURIComponent(generateBookingMessage(booking, "whatsapp"))}`;
}

export function buildBookingEmailUrl(booking: BookingMessageInput) {
  const subject = `Berwa Photo Hub Booking Request - ${booking.bookingReference}`;
  const body = generateBookingMessage(booking, "email");
  return `mailto:${BERWA_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildAdminWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("250") ? digits : digits.startsWith("0") ? `250${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
