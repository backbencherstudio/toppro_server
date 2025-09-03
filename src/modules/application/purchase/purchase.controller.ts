import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  async create(@Body() dto: CreatePurchaseDto, @Req() req: any) {
    const { owner_id: ownerId, workspace_id: workspaceId, sub: userId } = req.user;
    return this.purchaseService.create(dto, ownerId, workspaceId, userId);
  }

  @Get("all")
  async findAll(@Query() query, @Req() req: any) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.purchaseService.findAll(ownerId, workspaceId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.purchaseService.findOne(id, ownerId, workspaceId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto, @Req() req: any) {
    const { owner_id: ownerId, workspace_id: workspaceId, sub: userId } = req.user;
    return this.purchaseService.update(id, dto, ownerId, workspaceId, userId);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.purchaseService.softDelete(id, ownerId, workspaceId);
  }
}
