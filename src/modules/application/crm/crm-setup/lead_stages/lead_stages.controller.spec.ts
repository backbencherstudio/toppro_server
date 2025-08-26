import { Test, TestingModule } from '@nestjs/testing';
import { LeadStagesController } from './lead_stages.controller';
import { LeadStagesService } from './lead_stages.service';

describe('LeadStagesController', () => {
  let controller: LeadStagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadStagesController],
      providers: [LeadStagesService],
    }).compile();

    controller = module.get<LeadStagesController>(LeadStagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
