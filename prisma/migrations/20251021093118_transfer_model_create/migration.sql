-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "from_type" TEXT NOT NULL,
    "to_type" TEXT NOT NULL,
    "from_account" TEXT NOT NULL,
    "to_account" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "description" TEXT,
    "owner_id" TEXT,
    "workspace_id" TEXT,
    "user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BankAccountToTransfer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BankAccountToTransfer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BankAccountToTransfer_B_index" ON "_BankAccountToTransfer"("B");

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankAccountToTransfer" ADD CONSTRAINT "_BankAccountToTransfer_A_fkey" FOREIGN KEY ("A") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BankAccountToTransfer" ADD CONSTRAINT "_BankAccountToTransfer_B_fkey" FOREIGN KEY ("B") REFERENCES "transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
