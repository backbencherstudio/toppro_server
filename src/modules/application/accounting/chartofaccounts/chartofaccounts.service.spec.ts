import { Test, TestingModule } from '@nestjs/testing';
import { ChartofaccountsService } from './chartofaccounts.service';

describe('ChartofaccountsService', () => {
  let service: ChartofaccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartofaccountsService],
    }).compile();

    service = module.get<ChartofaccountsService>(ChartofaccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
