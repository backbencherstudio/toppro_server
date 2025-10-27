import { Module } from '@nestjs/common';
import { ReceiptSummaryController } from 'src/modules/application/receiptsummary/receiptsummary.controller';
import { ReceiptSummaryService } from 'src/modules/application/receiptsummary/receiptsummary.service';

@Module({
  controllers: [ReceiptSummaryController],
  providers: [ReceiptSummaryService],
})
export class ReceiptSummaryModule {}
