import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post()
  create(@Body() dto: CreateBillDto, @Req() req) {
    const { id: user_id, workspace_id, owner_id } = req.user;
    return this.billService.createBill(
      dto,
      owner_id,
      workspace_id,
      user_id,
      req.user.vendor_id,
    );
  }

  @Get()
  findAll(@Req() req) {
    const { id: user_id, workspace_id, owner_id } = req.user;
    return this.billService.findAll(owner_id, workspace_id, user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBillDto, @Req() req) {
    const { id: user_id, workspace_id, owner_id } = req.user;
    return this.billService.updateBill(
      id,
      dto,
      owner_id,
      workspace_id,
      user_id,
    );
  }

  @Delete(':id')
  async deleteBill(@Param('id') id: string) {
    return await this.billService.deleteBill(id);
  }
}
