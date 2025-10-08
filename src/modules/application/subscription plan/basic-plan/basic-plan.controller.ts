import { Controller, Get, Body, Patch, Query, UseGuards } from '@nestjs/common';
import { BasicPlanService } from './basic-plan.service';
import { UpdateBasicPlanDto } from './dto/update-basic-plan.dto';
import { AdminGuard } from 'src/modules/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('basic-plan')
export class BasicPlanController {
  constructor(private readonly basicPlanService: BasicPlanService) { }

  @Get('monthly')
  getMonthlyPricing() {
    return this.basicPlanService.getMonthlyPricing();
  }

  @Get('yearly')
  getYearlyPricing() {
    return this.basicPlanService.getYearlyPricing();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch()
  updatePlan(@Body() updateBasicPlanDto: UpdateBasicPlanDto) {
    return this.basicPlanService.updatePlan(updateBasicPlanDto);
  }

  @Get('calculate')
  calculatePrice(
    @Query('users') users: string,
    @Query('workspaces') workspaces: string,
    @Query('billingPeriod') billingPeriod: 'monthly' | 'yearly',
    @Query('modules') modules: string, // comma-separated module IDs
    @Query('coupon') couponCode?: string
  ) {
    const moduleIds = modules ? modules.split(',') : [];
    return this.basicPlanService.calculatePrice(
      parseInt(users, 10),
      parseInt(workspaces, 10),
      billingPeriod,
      moduleIds,
      couponCode
    );
  }
}
