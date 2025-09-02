import { Test, TestingModule } from '@nestjs/testing';
import { EmailtextService } from './emailtext.service';

describe('EmailtextService', () => {
  let service: EmailtextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailtextService],
    }).compile();

    service = module.get<EmailtextService>(EmailtextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
