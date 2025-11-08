import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { ApiOperation, ApiParam } from '@nestjs/swagger';

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
async findAll(
  @Query() query: { page?: string; limit?: string },
  @Req() req: any,
) {
  const {
    owner_id: ownerId,
    workspace_id: workspaceId,
    id: userId,
  } = req.user;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  return this.purchaseService.findAll(ownerId, workspaceId, userId, page, limit);
}


  @Get(':id')
  @ApiOperation({
    summary: 'Get a single purchase by ID (with vendor & items)',
  })
  @ApiParam({ name: 'id', required: true, description: 'Purchase ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;

    const purchase = await this.purchaseService.findOne(
      id,
      ownerId,
      workspaceId,
      userId,
    );

    if (!purchase) throw new NotFoundException('Purchase not found');

    return {
      success: true,
      message: 'Purchase fetched successfully',
      data: purchase,
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
    @Req() req: any,
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
      userId,
    );
  }

  @Delete('delete/:id')
  async deletePurchase(@Param('id') id: string, @Req() req: any) {
    const { id: userId } = req.user;
    return this.purchaseService.deletePurchase(id, userId);
  }
}
