import { Test, TestingModule } from '@nestjs/testing';
import { LeadProductsController } from './lead-products.controller';
import { LeadProductsService } from './lead-products.service';

describe('LeadProductsController', () => {
  let controller: LeadProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadProductsController],
      providers: [LeadProductsService],
    }).compile();

    controller = module.get<LeadProductsController>(LeadProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
