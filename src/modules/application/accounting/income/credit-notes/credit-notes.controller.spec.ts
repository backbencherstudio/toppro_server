import { Test, TestingModule } from '@nestjs/testing';
import { CreditNotesController } from './credit-notes.controller';
import { CreditNotesService } from './credit-notes.service';

describe('CreditNotesController', () => {
  let controller: CreditNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditNotesController],
      providers: [CreditNotesService],
    }).compile();

    controller = module.get<CreditNotesController>(CreditNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
