import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from 'src/modules/admin/permission/permission.controller';
import { PermissionsService } from 'src/modules/admin/permission/permission.service';

describe('PermissionController', () => {
  let controller: PermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [PermissionsService],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
