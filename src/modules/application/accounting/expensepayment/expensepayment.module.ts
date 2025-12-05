import { Module } from '@nestjs/common';
import { ExpensepaymentService } from './expensepayment.service';
import { ExpensepaymentController } from './expensepayment.controller';

@Module({
  controllers: [ExpensepaymentController],
  providers: [ExpensepaymentService],
})
export class ExpensepaymentModule {}
