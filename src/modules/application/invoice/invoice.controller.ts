// src/modules/application/invoice/invoice.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { InvoiceService } from 'src/modules/application/invoice/invoice.service';
import { UpdatePurchaseDto } from 'src/modules/application/purchase/dto/update-purchase.dto';
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

  // get all invoices
  @Get('all')
  async findAll(
    @Req() req: any,
    @Query()
    query: {
      issueDate?: string;
      customer?: string;
      status?: string;
      accountType?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;

    const {
      issueDate,
      customer,
      status,
      accountType,
      page = '1',
      limit = '10',
    } = query;

    return this.invoiceService.findAll(
      ownerId,
      workspaceId,
      userId,
      issueDate,
      customer,
      status,
      accountType,
      Number(page),
      Number(limit),
    );
  }

  // invoice single view
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const {
      id: userId,
      owner_id: ownerId,
      workspace_id: workspaceId,
    } = req.user;

    return await this.invoiceService.findOne(id, ownerId, workspaceId, userId);
  }

  // Update an invoice

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseDto,
    @Req() req: any,
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.invoiceService.update(id, dto, ownerId, workspaceId, userId);
  }

  // puchase send
  @Patch(':id/invoice-send')
  async updateStatus(
    @Param('id') id: string,
    @Body() { status }: { status: Status },
    @Req() req: any,
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.invoiceService.updateStatus(
      id,
      status,
      ownerId,
      workspaceId,
      userId,
    );
  }

  @Patch(':invoiceId/:itemId')
  async deleteInvoiceItems(
    @Param('invoiceId') invoiceId: string,
    @Param('itemId') itemId: string,
    @Req() req: any,
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.invoiceService.deleteInvoiceItems(
      invoiceId,
      itemId,
      ownerId,
      workspaceId,
      userId,
    );
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.invoiceService.softDelete(id, ownerId, workspaceId, userId);
  }

  @Delete('delete/:id')
  async hardDelete(@Param('id') id: string) {
    return this.invoiceService.hardDelete(id);
  }
}
