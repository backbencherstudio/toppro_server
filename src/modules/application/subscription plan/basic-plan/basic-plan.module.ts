import { Module } from '@nestjs/common';
import { BasicPlanService } from './basic-plan.service';
import { BasicPlanController } from './basic-plan.controller';

@Module({
  controllers: [BasicPlanController],
  providers: [BasicPlanService],
})
export class BasicPlanModule {}
