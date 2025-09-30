import { Test, TestingModule } from '@nestjs/testing';
import { CurrencySettingsService } from './currency-settings.service';

describe('CurrencySettingsService', () => {
  let service: CurrencySettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencySettingsService],
    }).compile();

    service = module.get<CurrencySettingsService>(CurrencySettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
