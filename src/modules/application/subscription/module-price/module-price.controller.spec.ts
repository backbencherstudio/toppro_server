import { Test, TestingModule } from '@nestjs/testing';
import { ModulePriceController } from './module-price.controller';
import { ModulePriceService } from './module-price.service';

describe('ModulePriceController', () => {
  let controller: ModulePriceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulePriceController],
      providers: [ModulePriceService],
    }).compile();

    controller = module.get<ModulePriceController>(ModulePriceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
