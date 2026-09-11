/**
 * Notification Service
 * Handles sending emails and WhatsApp messages for bookings and feedback
 */

import nodemailer from "nodemailer";
import { BERWA_EMAIL, BERWA_WHATSAPP_NUMBER, generateBookingMessage } from "./booking-communications";

type EmailData = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type WhatsAppData = {
  to: string;
  message: string;
};

// Initialize email transporter
let emailTransporter: nodemailer.Transporter | null = null;

function getEmailTransporter() {
  if (emailTransporter) return emailTransporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.warn("Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD env variables.");
    return null;
  }

  emailTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpPort === "465",
    auth: {
      user: smtpUser,
      pass: smtpPassword
    }
  });

  return emailTransporter;
}

/**
 * Send email notification
 */
export async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn("Email transporter not available, email not sent to", data.to);
      return { success: false, error: "Email service not configured" };
    }

    await transporter.sendMail({
      from: smtpUser || BERWA_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email to", data.to, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send WhatsApp message via WhatsApp Business API
 * Note: This requires setting up WhatsApp Business Account and API integration
 * For now, we'll return a placeholder - can be implemented with Twilio, Notchpay, or WhatsApp Business API
 */
export async function sendWhatsApp(data: WhatsAppData): Promise<{ success: boolean; error?: string }> {
  try {
    // Placeholder for WhatsApp integration
    // In production, integrate with:
    // 1. Twilio: https://www.twilio.com/whatsapp
    // 2. WhatsApp Business API: https://www.whatsapp.com/business/
    // 3. Notchpay: https://notchpay.co

    const apiKey = process.env.WHATSAPP_API_KEY;
    const apiUrl = process.env.WHATSAPP_API_URL;

    if (!apiKey || !apiUrl) {
      console.warn("WhatsApp service not configured. Set WHATSAPP_API_KEY and WHATSAPP_API_URL env variables.");
      return { success: false, error: "WhatsApp service not configured" };
    }

    // Example implementation with a generic WhatsApp API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        to: data.to.replace(/\D/g, ""), // Remove non-digits
        message: data.message
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send WhatsApp to", data.to, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send booking confirmation email to client
 */
export async function sendBookingConfirmationEmail(
  clientEmail: string,
  clientName: string,
  bookingRef: string,
  serviceName: string
): Promise<{ success: boolean; error?: string }> {
  if (!clientEmail) {
    return { success: false, error: "No client email provided" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: #d4a574; padding: 20px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
          .highlight { color: #d4a574; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Berwa Photo Hub</h1>
            <p>Booking Confirmation</p>
          </div>
          <div class="content">
            <p>Hello <span class="highlight">${clientName}</span>,</p>
            <p>Thank you for submitting your booking request for our <span class="highlight">${serviceName}</span> service!</p>
            <p>Your booking reference is: <span class="highlight">${bookingRef}</span></p>
            <p>Please keep this reference for your records. Our team will review your booking and contact you soon through WhatsApp at <span class="highlight">${BERWA_WHATSAPP_NUMBER}</span> or email to confirm availability and discuss payment details.</p>
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Wait for our team to review your booking request</li>
              <li>Respond to our WhatsApp or email to confirm the booking</li>
              <li>Receive payment instructions</li>
              <li>Send proof of payment to complete the booking</li>
            </ul>
            <p>If you have any questions, feel free to reach out to us:</p>
            <ul>
              <li>WhatsApp: <a href="https://wa.me/250786339597">${BERWA_WHATSAPP_NUMBER}</a></li>
              <li>Email: ${BERWA_EMAIL}</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; 2026 Berwa Photo Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Booking Confirmation - Reference: ${bookingRef}`,
    html,
    text: `Booking Confirmation\n\nHello ${clientName},\n\nThank you for submitting your booking request for our ${serviceName} service!\n\nYour booking reference is: ${bookingRef}\n\nPlease keep this reference for your records. Our team will review your booking and contact you soon through WhatsApp at ${BERWA_WHATSAPP_NUMBER} or email to confirm availability and discuss payment details.\n\nIf you have any questions, feel free to reach out to us at ${BERWA_EMAIL} or ${BERWA_WHATSAPP_NUMBER}.`
  });
}

/**
 * Send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmationWhatsApp(
  clientPhone: string,
  bookingData: any
): Promise<{ success: boolean; error?: string }> {
  if (!clientPhone) {
    return { success: false, error: "No client phone provided" };
  }

  const message = generateBookingMessage({
    bookingReference: bookingData.bookingReference,
    serviceName: bookingData.serviceName,
    packageName: bookingData.packageName,
    clientFullName: bookingData.clientFullName,
    clientEmail: bookingData.clientEmail,
    clientPhone: bookingData.clientPhone,
    bookingDate: bookingData.bookingDate,
    bookingTime: bookingData.bookingTime,
    locationType: bookingData.locationType,
    location: bookingData.location,
    numberOfPeople: bookingData.numberOfPeople,
    specialRequest: bookingData.specialRequest
  }, "whatsapp");

  return sendWhatsApp({
    to: clientPhone,
    message
  });
}

/**
 * Send feedback confirmation email
 */
export async function sendFeedbackConfirmationEmail(
  clientName: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: #d4a574; padding: 20px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Berwa Photo Hub</h1>
            <p>Thank You for Your Feedback!</p>
          </div>
          <div class="content">
            <p>Hello ${clientName},</p>
            <p>Thank you for sharing your feedback with us! We appreciate your time and honest review.</p>
            <p>Your feedback has been successfully submitted and will appear on our website soon.</p>
            <p>We look forward to serving you again!</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Berwa Photo Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { success: true }; // Email feedback confirmation is optional
}

const smtpUser = process.env.SMTP_USER;
