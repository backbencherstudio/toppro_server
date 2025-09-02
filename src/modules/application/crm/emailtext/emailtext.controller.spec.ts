import { Test, TestingModule } from '@nestjs/testing';
import { EmailtextController } from './emailtext.controller';
import { EmailtextService } from './emailtext.service';

describe('EmailtextController', () => {
  let controller: EmailtextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailtextController],
      providers: [EmailtextService],
    }).compile();

    controller = module.get<EmailtextController>(EmailtextController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
