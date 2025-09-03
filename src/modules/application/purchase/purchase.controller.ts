import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseService } from './purchase.service';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  // Create purchase with items
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId, sub: userId } = req.user;
    return this.purchaseService.create(createPurchaseDto, ownerId, workspaceId, userId);
  }

  // Get all purchases for current workspace + owner
  // @Get('all')
  // @UseGuards(JwtAuthGuard)
  // async findAll(@Req() req) {
  //   const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
  //   return this.purchaseService.findAll(ownerId, workspaceId);
  // }

  // Optional: get single purchase
  // @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // async findOne(@Param('id') id: string) {
  //   return this.purchaseService.findOne(id);
  // }
}
