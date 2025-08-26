import { Test, TestingModule } from '@nestjs/testing';
import { DealStageService } from './deal_stages.service';

describe('DealStageService', () => {
  let service: DealStageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DealStageService],
    }).compile();

    service = module.get<DealStageService>(DealStageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
