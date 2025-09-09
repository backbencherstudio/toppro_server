import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { InvoiceService } from 'src/modules/application/invoice/invoice.service';

@Controller('invoice')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

    @Post()
    async create(@Body() dto: CreateInvoiceDto , @Req() req: any) {
      const {
        owner_id: ownerId,
        workspace_id: workspaceId,
        id: userId,
      } = req.user;
      return this.invoiceService.create(dto, ownerId, workspaceId, userId);
    }

  // @Get()
  // findAll() {
  //   return this.invoiceService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.invoiceService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
  //   return this.invoiceService.update(+id, updateInvoiceDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.invoiceService.remove(+id);
  // }
}
