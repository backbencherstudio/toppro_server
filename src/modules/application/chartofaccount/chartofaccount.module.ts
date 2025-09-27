import { Module } from '@nestjs/common';
import { ChartofaccountService } from './chartofaccount.service';
import { ChartofaccountController } from './chartofaccount.controller';

@Module({
  controllers: [ChartofaccountController],
  providers: [ChartofaccountService],
})
export class ChartofaccountModule {}
