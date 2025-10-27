import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsummaryService } from './receiptsummary.service';

describe('ReceiptsummaryService', () => {
  let service: ReceiptsummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceiptsummaryService],
    }).compile();

    service = module.get<ReceiptsummaryService>(ReceiptsummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
