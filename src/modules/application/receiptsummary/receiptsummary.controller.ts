import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateReceiptSummaryDto } from 'src/modules/application/receiptsummary/dto/create-receiptsummary.dto';
import { UpdateReceiptSummaryDto } from 'src/modules/application/receiptsummary/dto/update-receiptsummary.dto';
import { ReceiptSummaryService } from 'src/modules/application/receiptsummary/receiptsummary.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('receipt-summary')
@UseGuards(JwtAuthGuard)
export class ReceiptSummaryController {
  constructor(private readonly service: ReceiptSummaryService) {}

@Post('create/:invoice_id')
@UseInterceptors(FileInterceptor('file'))
async create(
  @Body() dto: CreateReceiptSummaryDto,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any,
  @Param('invoice_id') invoice_id: string,
) {
  const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
  return this.service.create(
    dto,
    ownerId,
    workspaceId,
    userId,
    file,
    invoice_id,
  );
}


  @Get()
  findAll(@Query('workspace_id') workspace_id: string) {
    return this.service.findAll(workspace_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReceiptSummaryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
