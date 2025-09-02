import { Test, TestingModule } from '@nestjs/testing';
import { LeadsUserService } from './leadusers.service';


describe('LeadsUserService', () => {
  let service: LeadsUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsUserService],
    }).compile();

    service = module.get<LeadsUserService>(LeadsUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
