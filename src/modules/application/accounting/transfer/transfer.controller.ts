import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('Transfers')
@Controller('transfer')
@UseGuards(JwtAuthGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

@Post()
@ApiOperation({ summary: 'Create a new transfer' })
create(@Body() dto: CreateTransferDto, @Req() req) {
  const { id: user_id, workspace_id, owner_id } = req.user;
  return this.transferService.create(dto, user_id, workspace_id, owner_id);
}


  @Get()
  @ApiOperation({ summary: 'Get all transfers (filtered by owner/workspace)' })
  findAll(@Req() req) {
    const { owner_id, workspace_id, id: user_id } = req.user;
    return this.transferService.findAll(owner_id, workspace_id, user_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer by ID' })
  findOne(@Param('id') id: string) {
    return this.transferService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transfer by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateTransferDto) {
    return this.transferService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transfer by ID' })
  remove(@Param('id') id: string) {
    return this.transferService.remove(id);
  }
}
