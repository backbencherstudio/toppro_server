import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HelpDeskTicketController } from './helpdesk-ticket.controller';
import { HelpDeskTicketService } from './helpdesk-ticket.service';
import { UploadService } from './upload.service';


@Module({
controllers: [HelpDeskTicketController],
  providers: [HelpDeskTicketService, PrismaService, UploadService],
})
export class HelpDeskTicketModule {}
