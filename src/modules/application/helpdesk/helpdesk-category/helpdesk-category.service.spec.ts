import { Test, TestingModule } from '@nestjs/testing';
import { HelpdeskCategoryService } from './helpdesk-category.service';

describe('HelpdeskCategoryService', () => {
  let service: HelpdeskCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelpdeskCategoryService],
    }).compile();

    service = module.get<HelpdeskCategoryService>(HelpdeskCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
