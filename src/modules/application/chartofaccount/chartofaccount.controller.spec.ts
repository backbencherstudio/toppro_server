import { Test, TestingModule } from '@nestjs/testing';
import { ChartofaccountController } from './chartofaccount.controller';
import { ChartofaccountService } from './chartofaccount.service';

describe('ChartofaccountController', () => {
  let controller: ChartofaccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartofaccountController],
      providers: [ChartofaccountService],
    }).compile();

    controller = module.get<ChartofaccountController>(ChartofaccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
