-- Booking statuses
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'ASSIGNED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';

-- Payment status enum replacement
CREATE TYPE "PaymentStatus_new" AS ENUM ('PAYMENT_NOT_CONFIRMED', 'DEPOSIT_CONFIRMED', 'PARTIALLY_PAID', 'FULLY_PAID');
ALTER TABLE "Booking" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "Booking"
  ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new"
  USING (
    CASE "paymentStatus"::text
      WHEN 'DEPOSIT_PAID' THEN 'DEPOSIT_CONFIRMED'
      WHEN 'FULLY_PAID' THEN 'FULLY_PAID'
      ELSE 'PAYMENT_NOT_CONFIRMED'
    END
  )::"PaymentStatus_new";
DROP TYPE "PaymentStatus";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
ALTER TABLE "Booking" ALTER COLUMN "paymentStatus" SET DEFAULT 'PAYMENT_NOT_CONFIRMED';

-- Location type enum replacement
CREATE TYPE "LocationType_new" AS ENUM ('STUDIO', 'OUTDOOR', 'CLIENT_LOCATION', 'WEDDING_VENUE', 'EVENT_VENUE', 'OTHER');
ALTER TABLE "Booking"
  ALTER COLUMN "locationType" TYPE "LocationType_new"
  USING "locationType"::text::"LocationType_new";
DROP TYPE "LocationType";
ALTER TYPE "LocationType_new" RENAME TO "LocationType";

-- Booking public reference and amount columns
ALTER TABLE "Booking" ADD COLUMN "bookingReference" TEXT;
ALTER TABLE "Booking" ADD COLUMN "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE "Booking"
SET "amountPaid" = COALESCE("depositAmount", 0);

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) AS rn
  FROM "Booking"
  WHERE "bookingReference" IS NULL
)
UPDATE "Booking" b
SET "bookingReference" = 'BPH-' || EXTRACT(YEAR FROM b."createdAt")::int || '-' || LPAD(numbered.rn::text, 6, '0')
FROM numbered
WHERE numbered.id = b.id;

ALTER TABLE "Booking" ALTER COLUMN "bookingReference" SET NOT NULL;
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "proofUrl";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "depositAmount";
CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "Booking"("bookingReference");
CREATE INDEX "Booking_bookingReference_idx" ON "Booking"("bookingReference");
CREATE INDEX "Booking_bookingStatus_idx" ON "Booking"("bookingStatus");
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- Admin-only booking payment records
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

CREATE TABLE "BookingPayment" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paymentReference" TEXT,
  "proofReceivedThrough" TEXT NOT NULL,
  "proofAttachmentUrl" TEXT,
  "notes" TEXT,
  "status" "BookingPaymentStatus" NOT NULL DEFAULT 'CONFIRMED',
  "confirmedById" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "transactionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BookingPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BookingPayment_transactionId_key" ON "BookingPayment"("transactionId");
CREATE INDEX "BookingPayment_bookingId_idx" ON "BookingPayment"("bookingId");
CREATE INDEX "BookingPayment_status_idx" ON "BookingPayment"("status");

ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
