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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchaseService } from './purchase.service';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  async create(@Body() dto: CreatePurchaseDto, @Req() req: any) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.purchaseService.create(dto, ownerId, workspaceId, userId);
  }

  @Get('all')
  async findAll(@Query() query, @Req() req: any) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.purchaseService.findAll(ownerId, workspaceId, userId);
  }

@Get(':id')
async findOne(@Param('id') id: string, @Req() req: any) {
  const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user;
  const purchase = await this.purchaseService.findOne(id, ownerId, workspaceId, userId);

  // Calculate the updated summary after fetching the purchase details
  const _summary = {
    total_quantity: purchase.purchaseItems.reduce((total, item) => total + item.quantity, 0),
    total_rate: purchase.purchaseItems.reduce((total, item) => total + item.purchase_price, 0),
    total_discount: purchase.purchaseItems.reduce((total, item) => total + item.discount, 0),
    total_tax: purchase.purchaseItems.reduce((total, item) => total + (item.total - item.purchase_price - item.discount), 0),
    total_price: purchase.purchaseItems.reduce((total, item) => total + item.total, 0),
  };

  // Add summary to the result
  return {
    ...purchase,
    _summary,
  };
}



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
    return this.purchaseService.update(id, dto, ownerId, workspaceId, userId);
  }

  // puchase send
  @Patch(':id/purchase-send')
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
    return this.purchaseService.updateStatus(
      id,
      status,
      ownerId,
      workspaceId,
      userId,
    );
  }

  @Patch(':purchaseId/:itemId')
  async deletePurchaseItems(
    @Param('purchaseId') purchaseId: string,
    @Param('itemId') itemId: string,
    @Req() req: any,
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.purchaseService.deletePurchaseItems(
      purchaseId,
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
    return this.purchaseService.softDelete(id, ownerId, workspaceId, userId);
  }


  //purchase report
    @Get('report/daily')
  async getDailyPurchaseReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('vendor') vendor: string,
    @Req() req: any
  ) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    // console.log(" startDate, endDate, vendor",startDate, endDate, vendor, req.user);
    return this.purchaseService.getPurchaseReport(
      startDate,
      endDate,
      vendor,
      ownerId,
      workspaceId,
      userId
    );
  }
}
