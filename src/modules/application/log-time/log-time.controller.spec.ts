import { Test, TestingModule } from '@nestjs/testing';
import { LogTimeController } from './log-time.controller';
import { LogTimeService } from './log-time.service';

describe('LogTimeController', () => {
  let controller: LogTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogTimeController],
      providers: [LogTimeService],
    }).compile();

    controller = module.get<LogTimeController>(LogTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
