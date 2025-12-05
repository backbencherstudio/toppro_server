import { Test, TestingModule } from '@nestjs/testing';
import { DebitNoteController } from 'src/modules/application/accounting/debitnotes/debitnotes.controller';

describe('DebitNoteController', () => {
  let service: DebitNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DebitNoteController],
    }).compile();

    service = module.get<DebitNoteController>(DebitNoteController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
