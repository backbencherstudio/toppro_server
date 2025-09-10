import { Test, TestingModule } from '@nestjs/testing';
import { HelpDeskCategoryService } from './helpdesk-category.service';

describe('HelpDeskCategoryService', () => {
  let service: HelpDeskCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelpDeskCategoryService],
    }).compile();

    service = module.get<HelpDeskCategoryService>(HelpDeskCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
