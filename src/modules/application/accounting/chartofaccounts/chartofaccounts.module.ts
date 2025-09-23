import { Module } from '@nestjs/common';
import { ChartofaccountsService } from './chartofaccounts.service';
import { ChartofaccountsController } from './chartofaccounts.controller';

@Module({
  controllers: [ChartofaccountsController],
  providers: [ChartofaccountsService],
})
export class ChartofaccountsModule {}
