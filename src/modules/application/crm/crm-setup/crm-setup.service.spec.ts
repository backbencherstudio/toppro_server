import { Test, TestingModule } from '@nestjs/testing';
import { CrmSetupService } from './crm-setup.service';

describe('CrmSetupService', () => {
  let service: CrmSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrmSetupService],
    }).compile();

    service = module.get<CrmSetupService>(CrmSetupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
