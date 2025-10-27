import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptSummaryController } from 'src/modules/application/receiptsummary/receiptsummary.controller';
import { ReceiptSummaryService } from 'src/modules/application/receiptsummary/receiptsummary.service';

describe('ReceiptSummaryController', () => {
  let controller: ReceiptSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptSummaryController],
      providers: [ReceiptSummaryService],
    }).compile();

    controller = module.get<ReceiptSummaryController>(ReceiptSummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
