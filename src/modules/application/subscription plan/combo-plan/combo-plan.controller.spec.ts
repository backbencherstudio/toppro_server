import { Test, TestingModule } from '@nestjs/testing';
import { ComboPlanController } from './combo-plan.controller';
import { ComboPlanService } from './combo-plan.service';

describe('ComboPlanController', () => {
  let controller: ComboPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComboPlanController],
      providers: [ComboPlanService],
    }).compile();

    controller = module.get<ComboPlanController>(ComboPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
