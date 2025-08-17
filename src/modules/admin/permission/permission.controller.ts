import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from 'src/modules/admin/permission/permission.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();  // Fetch all permissions
  }

  @Post()
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);  // Create a new permission
  }
}
