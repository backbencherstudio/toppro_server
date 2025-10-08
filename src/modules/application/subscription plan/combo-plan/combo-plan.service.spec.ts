import { Test, TestingModule } from '@nestjs/testing';
import { ComboPlanService } from './combo-plan.service';

describe('ComboPlanService', () => {
  let service: ComboPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComboPlanService],
    }).compile();

    service = module.get<ComboPlanService>(ComboPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
