import { Test, TestingModule } from '@nestjs/testing';
import { DebitnotesService } from './debitnotes.service';

describe('DebitnotesService', () => {
  let service: DebitnotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DebitnotesService],
    }).compile();

    service = module.get<DebitnotesService>(DebitnotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
