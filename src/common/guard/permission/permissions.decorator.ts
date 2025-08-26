import { SetMetadata } from '@nestjs/common';
import { Permissions } from 'src/ability/permissions.enum';

export const PermissionsGuard = (permission: Permissions) =>
  SetMetadata('permission', permission);


