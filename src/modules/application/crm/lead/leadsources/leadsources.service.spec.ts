import { Test, TestingModule } from '@nestjs/testing';
import { LeadsSourceService } from './leadsources.service';


describe('LeadsSourceService', () => {
  let service: LeadsSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsSourceService],
    }).compile();

    service = module.get<LeadsSourceService>(LeadsSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
