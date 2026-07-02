import { NextResponse } from "next/server";
import { brand, packages } from "@/lib/brand";

const publicAnswers = [
  { keys: ["contact", "phone", "whatsapp"], answer: `You can contact Berwa Photo Hub on ${brand.phone}, use WhatsApp ${brand.whatsappDirect}, or open the catalog ${brand.whatsappCatalog}.` },
  { keys: ["location", "where"], answer: `Berwa Photo Hub is located at ${brand.location}.` },
  { keys: ["indoor", "studio"], answer: `Indoor packages: Bronze 10,000 RWF, Silver 25,000 RWF, Gold 45,000 RWF.` },
  { keys: ["outdoor"], answer: `Outdoor packages: Bronze 50,000 RWF, Silver 70,000 RWF, Gold 100,000 RWF.` },
  { keys: ["wedding"], answer: `Wedding packages: Basic 500,000 RWF, Standard 800,000 RWF, Premium 1,000,000 RWF.` },
  { keys: ["event", "coverage"], answer: `Event Coverage packages: Essential 50,000 RWF, Classic 80,000 RWF, Signature 120,000 RWF, Premium 200,000 RWF with highlight video.` },
  { keys: ["book", "booking"], answer: "Use the Book Now page, enter your contact, service, package, date, location and payment status. Admin will confirm it." }
];

export async function POST(request: Request) {
  const { message, role } = await request.json();
  const text = String(message ?? "").toLowerCase();

  if (role === "PUBLIC_VISITOR" && ["income", "expense", "profit", "cash", "bank"].some((word) => text.includes(word))) {
    return NextResponse.json({ answer: "I cannot share private financial data in public visitor mode." });
  }

  if (role === "WORKER" && text.includes("close month")) {
    return NextResponse.json({ answer: "Only admin can close a month. Workers can record income, upload proof, view assigned bookings and submit reports." });
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    if (text.includes("close")) return NextResponse.json({ answer: "Month closing steps: resolve pending records, enter cash/MoMo/bank/cheque balances, review the ending report, record a reason for any difference, then click Confirm and Close Month." });
    if (text.includes("export")) return NextResponse.json({ answer: "Open reports, choose filters, then export PDF, Excel or CSV from the report toolbar." });
  }

  const found = publicAnswers.find((entry) => entry.keys.some((key) => text.includes(key)));
  if (found) return NextResponse.json({ answer: found.answer });

  return NextResponse.json({ answer: `I can help with services, packages, booking, contact details, worker tools and admin guidance. Indoor Gold includes ${packages.indoor[2].includes.join(", ")}.` });
}
