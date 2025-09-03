import { Test, TestingModule } from '@nestjs/testing';
import { LeadsSourceController } from './leadsources.controller';
import { LeadsSourceService } from './leadsources.service';


describe('LeadsSourceController', () => {
  let controller: LeadsSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsSourceController],
      providers: [LeadsSourceService],
    }).compile();

    controller = module.get<LeadsSourceController>(LeadsSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
