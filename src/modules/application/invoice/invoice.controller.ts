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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoice')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

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
      page?: string;
      limit?: string;
    },
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user;

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


  // get all invoices
  @Get('all-paid-invoice')
  async findAllPaidInvoices(
    @Req() req: any,
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;

    return this.invoiceService.findAllPaidInvoices(
      ownerId,
      workspaceId,
      userId,
    );
  }
  // get all invoices
  @Get('customer-invoices/:customer_id')
  async findAllcustomerInvoices(
    @Req() req: any,
    @Param("customer_id") customer_id: string
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;

    return this.invoiceService.findAllcustomerInvoices(
      customer_id,
      ownerId,
      workspaceId,
      userId,
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
    @Body() dto: UpdateInvoiceDto,
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
