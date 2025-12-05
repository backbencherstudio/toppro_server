import { Test, TestingModule } from '@nestjs/testing';
import { DebitnotesController } from './debitnotes.controller';
import { DebitnotesService } from './debitnotes.service';

describe('DebitnotesController', () => {
  let controller: DebitnotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebitnotesController],
      providers: [DebitnotesService],
    }).compile();

    controller = module.get<DebitnotesController>(DebitnotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
