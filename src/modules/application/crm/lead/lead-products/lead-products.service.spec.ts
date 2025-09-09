import { Test, TestingModule } from '@nestjs/testing';
import { LeadProductsService } from './lead-products.service';

describe('LeadProductsService', () => {
  let service: LeadProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadProductsService],
    }).compile();

    service = module.get<LeadProductsService>(LeadProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
