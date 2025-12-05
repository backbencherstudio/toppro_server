import { Module } from '@nestjs/common';
import { ExpensePaymentController } from './expensepayment.controller';
import { ExpensePaymentService } from './expensepayment.service';

@Module({
  controllers: [ExpensePaymentController],
  providers: [ExpensePaymentService],
})
export class ExpensepaymentModule {}
