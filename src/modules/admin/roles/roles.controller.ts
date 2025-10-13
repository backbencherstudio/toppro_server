import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AssignUserToRoleDto } from 'src/modules/admin/roles/dto/assign-user-to-role.dto';
import { AssignUsersToRoleDto } from 'src/modules/admin/roles/dto/assign-users-to-role.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto'; // DTO for creating a role
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // GET single role by ID
  @Get(':roleId')
  getRole(@Param('roleId') roleId: string) {
    return this.rolesService.getRole(roleId);
  }

  // assing role to single user
  @Put(':roleId/assign-user')
  assignUserToRole(
    @Param('roleId') roleId: string,
    @Body() dto: AssignUserToRoleDto,
  ) {
    console.log('Fetching role with ID:', roleId, dto.user_id);
    return this.rolesService.assignUserToRole(roleId, dto.user_id);
  }

  // assign role to multiple users
  @Put(':roleId/assign-users')
  assignUsersToRole(
    @Param('roleId') roleId: string,
    @Body() dto: AssignUsersToRoleDto,
  ) {
    return this.rolesService.assignUsersToRole(roleId, dto.user_ids);
  }

  // Endpoint to create a new role and assign permissions to that role
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createRole(@Body() createRoleDto: CreateRoleDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.rolesService.createRoleWithPermissions(
      createRoleDto,
      ownerId,
      workspaceId,
    ); // Create a role and assign permissions
  }

  // Endpoint to get all roles (name and ID)
  @Get('all/list')
  @UseGuards(JwtAuthGuard)
  getAllRoles(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user ?? {};
    return this.rolesService.getAllRoles(ownerId, workspaceId);
  }

  // Endpoint to get a single role by ID
  // @Get(':id')
  // async getRoleById(@Param('id') roleId: string) {
  //   return this.rolesService.getRoleById(roleId);
  // }

  // Endpoint to update a role with new permissions (if needed)
  // @Put(':roleId')
  // async updateRole(
  //   @Param('roleId') roleId: string,
  //   @Body() updateRoleDto: UpdateRoleDto, // Body will contain the data to update the role
  // ) {
  //   return this.rolesService.updateRole(roleId, updateRoleDto);
  // }
}
