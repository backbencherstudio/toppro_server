import { Test, TestingModule } from '@nestjs/testing';
import { BasicPlanController } from './basic-plan.controller';
import { BasicPlanService } from './basic-plan.service';

describe('BasicPlanController', () => {
  let controller: BasicPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BasicPlanController],
      providers: [BasicPlanService],
    }).compile();

    controller = module.get<BasicPlanController>(BasicPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
