import { Test, TestingModule } from '@nestjs/testing';
import { ChartofaccountService } from './chartofaccount.service';

describe('ChartofaccountService', () => {
  let service: ChartofaccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartofaccountService],
    }).compile();

    service = module.get<ChartofaccountService>(ChartofaccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
