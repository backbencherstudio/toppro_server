import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionSettingsService } from './subscription-settings.service';

describe('SubscriptionSettingsService', () => {
  let service: SubscriptionSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionSettingsService],
    }).compile();

    service = module.get<SubscriptionSettingsService>(SubscriptionSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
