import { Test, TestingModule } from '@nestjs/testing';
import { ControllerSettingsController } from './control-settings.controller';
import { ControllerSettingsService } from './control-settings.service';



describe('ControllerSettingsController', () => {
  let controller: ControllerSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControllerSettingsController],
      providers: [ControllerSettingsService],
    }).compile();

    controller = module.get<ControllerSettingsService>(ControllerSettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
