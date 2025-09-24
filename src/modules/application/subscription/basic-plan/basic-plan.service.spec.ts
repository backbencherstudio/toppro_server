import { Test, TestingModule } from '@nestjs/testing';
import { BasicPlanService } from './basic-plan.service';

describe('BasicPlanService', () => {
  let service: BasicPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BasicPlanService],
    }).compile();

    service = module.get<BasicPlanService>(BasicPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
