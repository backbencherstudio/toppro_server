import { Test, TestingModule } from '@nestjs/testing';
import { CrmReportService } from './crm-report.service';

describe('CrmReportService', () => {
  let service: CrmReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrmReportService],
    }).compile();

    service = module.get<CrmReportService>(CrmReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
