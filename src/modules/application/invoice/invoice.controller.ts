// src/modules/application/invoice/invoice.controller.ts

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { InvoiceService } from 'src/modules/application/invoice/invoice.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoice')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('create')
  async create(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.invoiceService.create(dto, ownerId, workspaceId, userId);
  }

  // Other endpoints (e.g., update, delete) can be added here
}
