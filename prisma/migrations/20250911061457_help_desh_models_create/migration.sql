-- CreateEnum
CREATE TYPE "T_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "help_desk_tickets" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "T_status" NOT NULL,
    "subject" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "descriptionId" TEXT,
    "ticketId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "help_desk_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_descriptions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ticket_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AttachmentToTicketDescription" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AttachmentToTicketDescription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryTickets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryTickets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "help_desk_tickets_descriptionId_key" ON "help_desk_tickets"("descriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "help_desk_tickets_ticketId_key" ON "help_desk_tickets"("ticketId");

-- CreateIndex
CREATE INDEX "_AttachmentToTicketDescription_B_index" ON "_AttachmentToTicketDescription"("B");

-- CreateIndex
CREATE INDEX "_CategoryTickets_B_index" ON "_CategoryTickets"("B");

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "ticket_descriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "help_desk_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_tickets" ADD CONSTRAINT "help_desk_tickets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_descriptions" ADD CONSTRAINT "ticket_descriptions_id_fkey" FOREIGN KEY ("id") REFERENCES "help_desk_tickets"("descriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicketDescription" ADD CONSTRAINT "_AttachmentToTicketDescription_A_fkey" FOREIGN KEY ("A") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachmentToTicketDescription" ADD CONSTRAINT "_AttachmentToTicketDescription_B_fkey" FOREIGN KEY ("B") REFERENCES "ticket_descriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryTickets" ADD CONSTRAINT "_CategoryTickets_A_fkey" FOREIGN KEY ("A") REFERENCES "help_desk_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryTickets" ADD CONSTRAINT "_CategoryTickets_B_fkey" FOREIGN KEY ("B") REFERENCES "help_desk_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
