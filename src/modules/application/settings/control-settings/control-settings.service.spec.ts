import { Test, TestingModule } from '@nestjs/testing';
import { ControlSettingsService } from './control-settings.service';

describe('ControlSettingsService', () => {
  let service: ControlSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControlSettingsService],
    }).compile();

    service = module.get<ControlSettingsService>(ControlSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
