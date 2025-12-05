import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DebitnotesService } from './debitnotes.service';
import { CreateDebitnoteDto } from './dto/create-debitnote.dto';
import { UpdateDebitnoteDto } from './dto/update-debitnote.dto';

@Controller('debitnotes')
export class DebitnotesController {
  constructor(private readonly debitnotesService: DebitnotesService) {}

  @Post()
  create(@Body() createDebitnoteDto: CreateDebitnoteDto) {
    return this.debitnotesService.create(createDebitnoteDto);
  }

  @Get()
  findAll() {
    return this.debitnotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debitnotesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebitnoteDto: UpdateDebitnoteDto) {
    return this.debitnotesService.update(+id, updateDebitnoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debitnotesService.remove(+id);
  }
}
