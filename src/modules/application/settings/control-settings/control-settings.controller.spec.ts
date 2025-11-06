import { Test, TestingModule } from '@nestjs/testing';
import { ControlSettingsController } from './control-settings.controller';
import { ControlSettingsService } from './control-settings.service';

describe('ControlSettingsController', () => {
  let controller: ControlSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControlSettingsController],
      providers: [ControlSettingsService],
    }).compile();

    controller = module.get<ControlSettingsController>(ControlSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
