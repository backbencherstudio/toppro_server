import { Test, TestingModule } from '@nestjs/testing';
import { HelpdeskCategoryController } from './helpdesk-category.controller';
import { HelpdeskCategoryService } from './helpdesk-category.service';

describe('HelpdeskCategoryController', () => {
  let controller: HelpdeskCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpdeskCategoryController],
      providers: [HelpdeskCategoryService],
    }).compile();

    controller = module.get<HelpdeskCategoryController>(HelpdeskCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
