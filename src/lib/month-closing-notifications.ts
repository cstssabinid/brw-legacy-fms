/**
 * Month Closing Notifications & Reminders
 * Scheduled tasks for end-of-month email alerts
 */

import { sendEmail } from "./notifications";
import { prisma } from "./prisma";
import { monthLabel } from "./utils";

/**
 * Send reminder email to admins on the last day of the month
 * Should be called once per day via a cron job
 */
export async function sendMonthClosingReminder() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if today is the last day of the month
    const isLastDayOfMonth = tomorrow.getMonth() !== now.getMonth();

    if (!isLastDayOfMonth) {
      console.log("Not last day of month, skipping closing reminder");
      return;
    }

    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get the open period for this month
    const period = await prisma.monthlyPeriod.findUnique({
      where: { month_year: { month: currentMonth, year: currentYear } },
      include: { transactions: { where: { status: "PENDING" }, select: { id: true } } }
    });

    if (!period || period.status !== "OPEN") {
      console.log(`No open period for ${currentMonth}/${currentYear}`);
      return;
    }

    // Get all admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { email: true, name: true }
    });

    if (admins.length === 0) {
      console.log("No admin users found for closing reminder");
      return;
    }

    const monthName = monthLabel(currentMonth, currentYear);
    const pendingCount = period.transactions.length;

    // Send email to each admin
    for (const admin of admins) {
      if (!admin.email) continue;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: #d4a574; padding: 20px; text-align: center; }
              .content { padding: 20px; border: 1px solid #ddd; }
              .alert { background-color: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
              .button { display: inline-block; background-color: #d4a574; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 15px 0; }
              .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
              .highlight { color: #d4a574; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Berwa Photo Hub</h1>
                <p>Month Closing Reminder</p>
              </div>
              <div class="content">
                <p>Hello <span class="highlight">${admin.name}</span>,</p>

                <div class="alert">
                  <strong>📌 REMINDER: Today is the last day of ${monthName}</strong>
                  <p>Please close the accounting month and open the new period before end of business today.</p>
                </div>

                <h3>Current Status for ${monthName}:</h3>
                <ul>
                  <li>Period Status: <strong>${period.status}</strong></li>
                  <li>Opening Balance: <strong>RWF ${Number(period.openingBalance).toLocaleString()}</strong></li>
                  <li>Pending Transactions: <strong>${pendingCount}</strong></li>
                </ul>

                ${pendingCount > 0 ? `
                  <div class="alert">
                    <strong>⚠️ ACTION REQUIRED:</strong> There are ${pendingCount} pending transaction(s) that must be confirmed or rejected before closing the month.
                  </div>
                ` : ''}

                <h3>What to do:</h3>
                <ol>
                  <li>Review and confirm all pending transactions</li>
                  <li>Count the actual cash, MoMo, Bank, and Cheque amounts</li>
                  <li>Go to Admin → Month Closing</li>
                  <li>Enter the closing balances and any discrepancy reasons</li>
                  <li>Click "Confirm and Close Month"</li>
                </ol>

                <a href="https://berwaph.vercel.app/admin/month-closing" class="button">Go to Month Closing</a>

                <p>If you have any questions, contact your administrator.</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 Berwa Photo Hub. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail({
        to: admin.email,
        subject: `REMINDER: Close ${monthName} today (Last Day of Month)`,
        html
      });
    }

    console.log(`Sent closing reminder to ${admins.length} admins for ${monthName}`);
  } catch (error) {
    console.error("Failed to send month closing reminder:", error);
  }
}

/**
 * Send notification when a month has been closed
 */
export async function sendMonthClosedNotification(
  closedPeriod: any,
  closedByUser: any,
  nextPeriod: any
) {
  try {
    // Get all admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { email: true, name: true, id: true }
    });

    if (admins.length === 0) return;

    const closedMonthName = monthLabel(closedPeriod.month, closedPeriod.year);
    const nextMonthName = monthLabel(nextPeriod.month, nextPeriod.year);
    const closingDate = closedPeriod.closingDate
      ? new Date(closedPeriod.closingDate).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })
      : "Unknown";
    const openingDate = nextPeriod.openingDate
      ? new Date(nextPeriod.openingDate).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })
      : "Unknown";

    for (const admin of admins) {
      if (!admin.email) continue;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1a1a1a; color: #d4a574; padding: 20px; text-align: center; }
              .content { padding: 20px; border: 1px solid #ddd; }
              .success { background-color: #d4edda; border: 1px solid #28a745; color: #155724; padding: 12px; border-radius: 4px; margin: 15px 0; }
              .stats { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
              .stat-label { font-weight: bold; }
              .stat-value { text-align: right; color: #d4a574; }
              .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
              .highlight { color: #d4a574; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Berwa Photo Hub</h1>
                <p>Month Closed Successfully</p>
              </div>
              <div class="content">
                <p>Hello <span class="highlight">${admin.name}</span>,</p>

                <div class="success">
                  <strong>✅ ${closedMonthName} has been closed successfully!</strong>
                  <p>Closed by ${closedByUser.name} on ${closingDate}</p>
                </div>

                <h3>Closing Details:</h3>
                <div class="stats">
                  <div class="stat-row">
                    <span class="stat-label">Closed Month:</span>
                    <span class="stat-value">${closedMonthName}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Closing Date:</span>
                    <span class="stat-value">${closingDate}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Closing Balance:</span>
                    <span class="stat-value">RWF ${Number(closedPeriod.countedClosingBalance).toLocaleString()}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Expected Balance:</span>
                    <span class="stat-value">RWF ${Number(closedPeriod.expectedClosingBalance).toLocaleString()}</span>
                  </div>
                  ${closedPeriod.difference !== 0 ? `
                  <div class="stat-row">
                    <span class="stat-label">Difference:</span>
                    <span class="stat-value" style="color: #ff6b6b;">RWF ${Number(closedPeriod.difference).toLocaleString()}</span>
                  </div>
                  ` : ''}
                </div>

                <h3>New Period Opened:</h3>
                <div class="stats">
                  <div class="stat-row">
                    <span class="stat-label">Month:</span>
                    <span class="stat-value">${nextMonthName}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Opening Date:</span>
                    <span class="stat-value">${openingDate}</span>
                  </div>
                  <div class="stat-row">
                    <span class="stat-label">Opening Balance:</span>
                    <span class="stat-value">RWF ${Number(nextPeriod.openingBalance).toLocaleString()}</span>
                  </div>
                </div>

                <p><strong>The opening balance has been recorded as the first income entry for ${nextMonthName}.</strong></p>
              </div>
              <div class="footer">
                <p>&copy; 2026 Berwa Photo Hub. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail({
        to: admin.email,
        subject: `✅ ${closedMonthName} Closed Successfully - ${nextMonthName} Opened`,
        html
      });
    }

    console.log(`Sent closure notification to ${admins.length} admins`);
  } catch (error) {
    console.error("Failed to send month closed notification:", error);
  }
}
