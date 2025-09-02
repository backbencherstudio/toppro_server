import { Test, TestingModule } from '@nestjs/testing';
import { LeadusersController } from './leadusers.controller';
import { LeadusersService } from './leadusers.service';

describe('LeadusersController', () => {
  let controller: LeadusersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadusersController],
      providers: [LeadusersService],
    }).compile();

    controller = module.get<LeadusersController>(LeadusersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
