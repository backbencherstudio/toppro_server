import { Test, TestingModule } from '@nestjs/testing';
import { ExpensePaymentService } from './expensepayment.service';

describe('ExpensePaymentService', () => {
  let service: ExpensePaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpensePaymentService],
    }).compile();

    service = module.get<ExpensePaymentService>(ExpensePaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
