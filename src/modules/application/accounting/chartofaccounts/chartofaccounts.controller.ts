import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChartofaccountsService } from './chartofaccounts.service';
import { CreateChartofaccountDto } from './dto/create-chartofaccount.dto';
import { UpdateChartofaccountDto } from './dto/update-chartofaccount.dto';

@Controller('chartofaccounts')
export class ChartofaccountsController {
  constructor(private readonly chartofaccountsService: ChartofaccountsService) {}

  @Post()
  create(@Body() createChartofaccountDto: CreateChartofaccountDto) {
    return this.chartofaccountsService.create(createChartofaccountDto);
  }

  @Get()
  findAll() {
    return this.chartofaccountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chartofaccountsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChartofaccountDto: UpdateChartofaccountDto) {
    return this.chartofaccountsService.update(+id, updateChartofaccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chartofaccountsService.remove(+id);
  }
}
