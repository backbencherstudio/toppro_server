import { Test, TestingModule } from '@nestjs/testing';
import { CrmSetupController } from './crm-setup.controller';
import { CrmSetupService } from './crm-setup.service';

describe('CrmSetupController', () => {
  let controller: CrmSetupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrmSetupController],
      providers: [CrmSetupService],
    }).compile();

    controller = module.get<CrmSetupController>(CrmSetupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
