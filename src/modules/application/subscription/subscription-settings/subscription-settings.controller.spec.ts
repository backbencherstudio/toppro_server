import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionSettingsController } from './subscription-settings.controller';
import { SubscriptionSettingsService } from './subscription-settings.service';

describe('SubscriptionSettingsController', () => {
  let controller: SubscriptionSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionSettingsController],
      providers: [SubscriptionSettingsService],
    }).compile();

    controller = module.get<SubscriptionSettingsController>(SubscriptionSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
