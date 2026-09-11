ALTER TABLE "Transaction" ADD COLUMN "isOpeningBalance" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Transaction_periodId_idx" ON "Transaction"("periodId");

CREATE TABLE "PeriodAccountBalance" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "closingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodAccountBalance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PeriodAccountBalance_periodId_accountType_key" ON "PeriodAccountBalance"("periodId", "accountType");

ALTER TABLE "PeriodAccountBalance" ADD CONSTRAINT "PeriodAccountBalance_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "MonthlyPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
