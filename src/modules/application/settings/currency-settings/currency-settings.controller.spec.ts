import { Test, TestingModule } from '@nestjs/testing';
import { CurrencySettingsController } from './currency-settings.controller';
import { CurrencySettingsService } from './currency-settings.service';

describe('CurrencySettingsController', () => {
  let controller: CurrencySettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrencySettingsController],
      providers: [CurrencySettingsService],
    }).compile();

    controller = module.get<CurrencySettingsController>(CurrencySettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
