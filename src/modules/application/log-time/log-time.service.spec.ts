import { Test, TestingModule } from '@nestjs/testing';
import { LogTimeService } from './log-time.service';

describe('LogTimeService', () => {
  let service: LogTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogTimeService],
    }).compile();

    service = module.get<LogTimeService>(LogTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
