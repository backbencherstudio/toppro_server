import { Test, TestingModule } from '@nestjs/testing';
import { ExpensepaymentController } from './expensepayment.controller';
import { ExpensepaymentService } from './expensepayment.service';

describe('ExpensepaymentController', () => {
  let controller: ExpensepaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensepaymentController],
      providers: [ExpensepaymentService],
    }).compile();

    controller = module.get<ExpensepaymentController>(ExpensepaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
