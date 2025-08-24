import { Test, TestingModule } from '@nestjs/testing';
import { CrmReportController } from './crm-report.controller';
import { CrmReportService } from './crm-report.service';

describe('CrmReportController', () => {
  let controller: CrmReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrmReportController],
      providers: [CrmReportService],
    }).compile();

    controller = module.get<CrmReportController>(CrmReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
