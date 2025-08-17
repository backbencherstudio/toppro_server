import { Module } from '@nestjs/common';
import { PermissionsService } from './permission.service';
import { PermissionsController } from './permission.controller';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
})
export class PermissionModule {}
