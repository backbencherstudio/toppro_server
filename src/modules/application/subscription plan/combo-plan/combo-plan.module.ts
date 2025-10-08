import { Module } from '@nestjs/common';
import { ComboPlanService } from './combo-plan.service';
import { ComboPlanController } from './combo-plan.controller';

@Module({
  controllers: [ComboPlanController],
  providers: [ComboPlanService],
})
export class ComboPlanModule {}
