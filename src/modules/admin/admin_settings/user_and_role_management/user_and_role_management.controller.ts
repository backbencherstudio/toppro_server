import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserAndRoleManagementService } from './user_and_role_management.service';


@Controller('user-and-role-management')
export class UserAndRoleManagementController {
  constructor(private readonly userAndRoleManagementService: UserAndRoleManagementService) {}
  @Get()
  async getAllUsers() {
    const users = await this.userAndRoleManagementService.getAllUsers();
    return { success: true, data: users };
  }
  
}
