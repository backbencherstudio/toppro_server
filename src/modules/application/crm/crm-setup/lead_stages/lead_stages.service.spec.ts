import { Test, TestingModule } from '@nestjs/testing';
import { LeadStagesService } from './lead_stages.service';

describe('LeadStagesService', () => {
  let service: LeadStagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadStagesService],
    }).compile();

    service = module.get<LeadStagesService>(LeadStagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
