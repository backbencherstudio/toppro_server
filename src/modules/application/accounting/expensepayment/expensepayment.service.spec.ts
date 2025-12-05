import { Test, TestingModule } from '@nestjs/testing';
import { ExpensepaymentService } from './expensepayment.service';

describe('ExpensepaymentService', () => {
  let service: ExpensepaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpensepaymentService],
    }).compile();

    service = module.get<ExpensepaymentService>(ExpensepaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
