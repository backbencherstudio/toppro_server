import { Test, TestingModule } from '@nestjs/testing';
import { ChartofaccountsController } from './chartofaccounts.controller';
import { ChartofaccountsService } from './chartofaccounts.service';

describe('ChartofaccountsController', () => {
  let controller: ChartofaccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartofaccountsController],
      providers: [ChartofaccountsService],
    }).compile();

    controller = module.get<ChartofaccountsController>(ChartofaccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
