import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { ChartOfAccountService } from 'src/modules/application/accounting/chartofaccounts/chartofaccounts.service';
import { CreateChartOfAccountDto } from 'src/modules/application/accounting/chartofaccounts/dto/create-chartofaccount.dto';
import { UpdateChartOfAccountDto } from 'src/modules/application/accounting/chartofaccounts/dto/update-chartofaccount.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('chart-of-account')
@UseGuards(JwtAuthGuard)
export class ChartOfAccountController {
  constructor(private readonly chartService: ChartOfAccountService) {}

  @Post()
  create(@Body() dto: CreateChartOfAccountDto, @Req() req) {
    const { workspace_id: workspaceId, id: userId, owner_id: ownerId } = req.user;
    return this.chartService.create(dto, workspaceId, userId, ownerId);
  }

  @Get()
  findAll() {
    return this.chartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chartService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChartOfAccountDto) {
    return this.chartService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chartService.remove(id);
  }
}
