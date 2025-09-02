import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchaseService } from './purchase.service';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  //
  @Post("create")
  @UseGuards(JwtAuthGuard)
  create(@Body() createPurchaseDto: CreatePurchaseDto, @Req() req) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      sub: userId,
    } = req.user;
    return this.purchaseService.create(
      createPurchaseDto,
      ownerId,
      workspaceId,
      userId,
    );
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAll(@Req() req) {
    const { owner_id, workspace_id, sub: userId } = req.user;
    return this.purchaseService.findAll(owner_id, workspace_id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.update(+id, updatePurchaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(+id);
  }
}
