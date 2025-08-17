import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';  // DTO for creating a role
import { RolesService } from './roles.service';
import { UpdateRoleDto } from 'src/modules/admin/roles/dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Endpoint to create a new role and assign permissions to that role
  @Post('create')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRoleWithPermissions(createRoleDto);  // Create a role and assign permissions
  }

    // Endpoint to get all roles (name and ID)
  @Get('all')
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

// Endpoint to get a single role by ID
@Get(':id')
async getRoleById(@Param('id') roleId: string) {
  return this.rolesService.getRoleById(roleId);
}


  // Endpoint to update a role with new permissions (if needed)
  @Put(':roleId')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,  // Body will contain the data to update the role
  ) {
    return this.rolesService.updateRole(roleId, updateRoleDto);
  }


}
