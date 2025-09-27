import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChartofaccountService } from './chartofaccount.service';
import { CreateChartofaccountDto } from './dto/create-chartofaccount.dto';
import { UpdateChartofaccountDto } from './dto/update-chartofaccount.dto';

@Controller('chartofaccount')
export class ChartofaccountController {
  constructor(private readonly chartofaccountService: ChartofaccountService) {}

  @Post()
  create(@Body() createChartofaccountDto: CreateChartofaccountDto) {
    return this.chartofaccountService.create(createChartofaccountDto);
  }

  @Get()
  findAll() {
    return this.chartofaccountService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chartofaccountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChartofaccountDto: UpdateChartofaccountDto) {
    return this.chartofaccountService.update(+id, updateChartofaccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chartofaccountService.remove(+id);
  }
}
