import { Test, TestingModule } from '@nestjs/testing';
import { ModulePriceService } from './module-price.service';

describe('ModulePriceService', () => {
  let service: ModulePriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModulePriceService],
    }).compile();

    service = module.get<ModulePriceService>(ModulePriceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
