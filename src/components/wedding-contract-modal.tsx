"use client";

import { useEffect, useState } from "react";
import { FileText, ShieldCheck, X } from "lucide-react";

const contractSections = [
  {
    title: "Client Information",
    items: [
      "Bride's Name: ____________________________________________",
      "Groom's Name: ____________________________________________",
      "Phone Number: ____________________________________________",
      "Email: ____________________________________________",
      "Address: ____________________________________________"
    ]
  },
  {
    title: "Service Provider",
    items: [
      "Company Name: BRW LEGACY CO. LTD",
      "Company Code: 122961111",
      "Studio Name: BERWA PHOTO HUB",
      "Representative: Sabin IZERE DUKUZUMUKIZA",
      "Phone: +250 786 339 597 / +250 782 784 599 / +250 783 128 500",
      "Email: berwasbusinessgroup@gmail.com"
    ]
  },
  {
    title: "Event Details",
    items: [
      "Wedding Date: ____ / ____ / ______",
      "Coverage Start Time: ____________________",
      "Coverage End Time: ____________________",
      "Preparation Location: ____________________________________________",
      "Ceremony Venue: ____________________________________________",
      "Reception Venue: ____________________________________________",
      "Additional Locations: ____________________________________________"
    ]
  },
  {
    title: "Package Selected",
    items: [
      "[ ] BASIC PACKAGE - 500,000 RWF: Album (200 Pictures), Full Wedding Video, Two (2) A3 Framed Photos, 4GB Flash Drive",
      "[ ] STANDARD PACKAGE - 800,000 RWF: Album (200 Pictures), Full Wedding Video, Highlight Video, Three (3) A3 Framed Photos, Online Gallery (300 Pictures), Bride Makeup, 8GB Flash Drive",
      "[ ] PREMIUM PACKAGE - 1,000,000 RWF: Premium Photo Book (200 Pictures), Full Wedding Video, Highlight Video, Four (4) A3 Framed Photos, Online Gallery (500 Pictures), Bride Team Makeup, Professional Sound Kit, Live Streaming, 32GB Flash Drive"
    ]
  },
  {
    title: "Payment Terms",
    items: [
      "Total Package Price: ________________________ RWF",
      "Booking Deposit: ________________________ RWF",
      "Balance Due: ________________________ RWF",
      "The booking is confirmed only after receiving the agreed deposit.",
      "The remaining balance must be paid at the wedding day, unless otherwise agreed in writing.",
      "Payments are non-refundable if the cancellation occurs within seven (7) days before the event."
    ]
  },
  {
    title: "Delivery Time",
    items: [
      "Edited photographs: [ ] 14 Days   [ ] 21 Days   [ ] 30 Days",
      "Videos: [ ] 30 Days   [ ] 45 Days   [ ] 60 Days",
      "Delivery method: [ ] Flash Drive   [ ] Online Gallery   [ ] Both"
    ]
  },
  {
    title: "Client Responsibilities",
    items: [
      "Provide an accurate wedding schedule.",
      "Ensure access to all photography locations.",
      "Assign a family representative to assist with important group photographs.",
      "Inform Berwa Photo Hub of any special requests before the wedding day."
    ]
  },
  {
    title: "Berwa Photo Hub Responsibilities",
    items: [
      "Arrive on time.",
      "Professionally photograph and film the event.",
      "Edit all delivered photographs and videos.",
      "Deliver the package according to the selected plan.",
      "Maintain professional conduct throughout the event."
    ]
  },
  {
    title: "Copyright and Portfolio Permission",
    items: [
      "All photographs and videos remain the intellectual property of Berwa Photo Hub.",
      "The Client receives unlimited personal-use rights.",
      "The Client: [ ] Grants permission   [ ] Does NOT grant permission for Berwa Photo Hub to use selected photographs and videos for social media, website, portfolio, and advertising."
    ]
  },
  {
    title: "Force Majeure, Cancellation, and Liability",
    items: [
      "Berwa Photo Hub shall not be liable for delays or failure caused by events beyond reasonable control, including natural disasters, government restrictions, war, civil unrest, severe illness, power failures, or equipment theft.",
      "More than 30 days before: deposit may be refunded minus administrative costs.",
      "Within 30 days: deposit is non-refundable.",
      "Within 7 days: full deposit is forfeited.",
      "Liability shall never exceed the amount paid under this agreement."
    ]
  },
  {
    title: "Extra Services and Special Requests",
    items: [
      "Additional hours: ________________________ RWF/hour",
      "Extra Album: ________________________ RWF",
      "Extra Frame: ________________________ RWF",
      "Drone Coverage: ________________________ RWF",
      "Additional Photographer: ________________________ RWF",
      "Special Requests: ____________________________________________"
    ]
  },
  {
    title: "Agreement and Signatures",
    items: [
      "By signing below, both parties acknowledge that they have read, understood, and agreed to all terms and conditions contained in this agreement.",
      "CLIENT - Bride: Name, Signature, Date",
      "CLIENT - Groom: Name, Signature, Date",
      "BERWA PHOTO HUB - Representative: Name, Signature, Date",
      "Company Stamp: ____________________"
    ]
  },
  {
    title: "Payment Details and Office Use",
    items: [
      "Bank Name: ____________________________________________",
      "Account Name: ____________________________________________",
      "Account Number: ____________________________________________",
      "Mobile Money Name: ____________________________________________",
      "Mobile Money Number: ____________________________________________",
      "Accepted Methods: [ ] Bank Transfer   [ ] Mobile Money   [ ] Cash   [ ] Other",
      "Payment Reference: Wedding Contract No. ____________________",
      "Deposit Received By: ____________________________________________",
      "Deposit Date: ____ / ____ / ______",
      "Balance Received By: ____________________________________________",
      "Balance Date: ____ / ____ / ______",
      "Receipt Number: ____________________________________________"
    ]
  }
];

export function WeddingContractModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const blockProtectedShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "p", "s"].includes(key)) {
        event.preventDefault();
      }
      if (key === "printscreen") {
        event.preventDefault();
        navigator.clipboard?.writeText("Protected preview").catch(() => undefined);
      }
    };

    document.addEventListener("keydown", blockProtectedShortcuts);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", blockProtectedShortcuts);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="btn btn-gold shrink-0" onClick={() => setOpen(true)}>
        <FileText size={18} />
        Sample contract
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/74 px-4 py-6 backdrop-blur-sm print:hidden" role="dialog" aria-modal="true" aria-labelledby="wedding-contract-title">
          <div className="card protected-contract-modal relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden border-[var(--gold)] bg-[var(--card)] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase text-[var(--gold)]">
                  <ShieldCheck size={16} />
                  Protected preview
                </p>
                <h3 id="wedding-contract-title" className="mt-1 text-2xl font-black">BERWA PHOTO HUB Wedding Service Agreement</h3>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">Viewing only. Download, copy, right-click, save, and print shortcuts are disabled for this preview.</p>
              </div>
              <button type="button" className="btn border-[var(--border)] bg-transparent p-2" aria-label="Close sample contract" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div
              className="relative overflow-y-auto p-5 select-none"
              onContextMenu={(event) => event.preventDefault()}
              onCopy={(event) => event.preventDefault()}
              onCut={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
            >
              <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(-28deg,transparent_0,transparent_120px,rgba(216,168,79,0.08)_121px,rgba(216,168,79,0.08)_122px)]" />
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-center text-5xl font-black uppercase tracking-[0.28em] text-[var(--gold)] opacity-[0.07]">
                Berwa Photo Hub
              </div>

              <div className="relative z-20 mx-auto max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
                <div className="border-b border-[var(--border)] pb-4 text-center">
                  <p className="text-sm font-black uppercase text-[var(--gold)]">BERWA PHOTO HUB</p>
                  <h4 className="mt-1 text-xl font-black">Wedding Photography & Videography Service Agreement</h4>
                  <p className="mt-3 text-sm text-[var(--muted)]">Contract No.: ____________________ &nbsp; Date: ____ / ____ / ______</p>
                </div>

                <div className="mt-5 grid gap-5">
                  {contractSections.map((section, index) => (
                    <section key={section.title}>
                      <h5 className="text-sm font-black uppercase text-[var(--navy)] dark:text-[var(--gold)]">{index + 1}. {section.title}</h5>
                      <div className="mt-2 grid gap-1.5 text-sm leading-6 text-[var(--foreground)]">
                        {section.items.map((item) => <p key={item}>{item}</p>)}
                      </div>
                    </section>
                  ))}
                </div>

                <p className="mt-6 border-t border-[var(--border)] pt-4 text-center text-sm font-bold text-[var(--muted)]">Thank you for choosing BERWA PHOTO HUB. We are honored to preserve your wedding memories with care and professionalism.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
