import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ComboPlanService } from './combo-plan.service';
import { CreateComboPlanDto } from './dto/create-combo-plan.dto';
import { UpdateComboPlanDto } from './dto/update-combo-plan.dto';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('combo-plan')
export class ComboPlanController {
  constructor(private readonly comboPlanService: ComboPlanService) { }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createComboPlanDto: CreateComboPlanDto) {
    return this.comboPlanService.create(createComboPlanDto);
  }
  @Get()
  findAll() {
    return this.comboPlanService.findall();
  }

  @Get('monthly')
  findMonthlyPlans() {
    return this.comboPlanService.findMonthlyPlans();
  }

  @Get('yearly')
  findYearlyPlans() {
    return this.comboPlanService.findYearlyPlans();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  async updateComboPlan(
    @Param('id') id: string,
    @Body() updateComboPlanDto: UpdateComboPlanDto
  ) {
    return this.comboPlanService.update(id, updateComboPlanDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteComboPlan(@Param('id') id: string) {
    return this.comboPlanService.delete(id);
  }

}
