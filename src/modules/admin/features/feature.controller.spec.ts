import { Test, TestingModule } from '@nestjs/testing';
import { FeatureController } from './feature_controller';
import { FeatureServices } from './feature_service';

describe('FeatureController', () => {
  let controller: FeatureController;
  let service: FeatureServices;

  beforeEach(async () => {
    const mockFeatureService = {
      create: jest.fn().mockReturnValue({ success: true, feature_id: 'mock123' }),
      findAll: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureController],
      providers: [
        {
          provide: FeatureServices,
          useValue: mockFeatureService,
        },
      ],
    }).compile();

    controller = module.get<FeatureController>(FeatureController);
    service = module.get<FeatureServices>(FeatureServices);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return success when creating a feature', async () => {
    const dto = { name: 'Test Feature' };
    const result = await controller.create(dto, { user: { id: 'user123' } } as any);
    expect(result).toEqual({ success: true, feature_id: 'mock123' });
    expect(service.create).toHaveBeenCalledWith({ name: "Test Feature" }
    );
  });

  it('should return an empty list when no features exist', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });
});
