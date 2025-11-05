import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { AssignUserToRoleDto } from 'src/modules/admin/roles/dto/assign-user-to-role.dto';
import { AssignUsersToRoleDto } from 'src/modules/admin/roles/dto/assign-users-to-role.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto'; // DTO for creating a role
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.SUPERADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Update a role and its permissions
  @Put(':roleId')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() updateRoleDto: CreateRoleDto,
    @Req() req,
  ) {
    try {
      const {
        owner_id: ownerId,
        workspace_id: workspaceId,
        id: userId,
      } = req.user;
      const updatedRole = await this.rolesService.updateRole(
        roleId,
        updateRoleDto,
        ownerId,
        workspaceId,
        userId,
      );

      return updatedRole;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: 'Failed to update role',
        error: error.message,
      };
    }
  }

  @Get(':roleId')
  async getRoleById(@Param('roleId') roleId: string) {
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
  getAllRoles(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.rolesService.getAllRoles(ownerId, workspaceId);
  }

  // Endpoint to get a single role by ID
  // @Get(':id')
  // async getRoleById(@Param('id') roleId: string) {
  //   return this.rolesService.getRoleById(roleId);
  // }
}
