import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExpensepaymentService } from './expensepayment.service';
import { CreateExpensepaymentDto } from './dto/create-expensepayment.dto';
import { UpdateExpensepaymentDto } from './dto/update-expensepayment.dto';

@Controller('expensepayment')
export class ExpensepaymentController {
  constructor(private readonly expensepaymentService: ExpensepaymentService) {}

  @Post()
  create(@Body() createExpensepaymentDto: CreateExpensepaymentDto) {
    return this.expensepaymentService.create(createExpensepaymentDto);
  }

  @Get()
  findAll() {
    return this.expensepaymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensepaymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpensepaymentDto: UpdateExpensepaymentDto) {
    return this.expensepaymentService.update(+id, updateExpensepaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensepaymentService.remove(+id);
  }
}
