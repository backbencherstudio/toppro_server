import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('User')
// @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
@Controller('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({ description: 'Create a user' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiResponse({ description: 'Get all owners' })
  @Get('owner/all')
  async findAllOwners() {
    try {
      const owners = await this.userService.findAll();
      return {
        success: true,
        data: owners,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiResponse({ description: 'Get one user by id' })
  @Get('owner/:id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // approve user
  @Roles(Role.SUPERADMIN)
  @ApiResponse({ description: 'Approve a user' })
  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    try {
      const user = await this.userService.approve(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // enable/disable owner
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Enable/Disable a user' })
  @Patch('owner/status/:id')
  async changeStatus(@Param('id') id: string, @Body('status') status: number) {
    try {
      const result = await this.userService.updateStatus(id, status);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update Owner details
  @Roles(Role.SUPERADMIN) // or adjust as needed
  @ApiOperation({ summary: 'Update user details' })
  @Patch('owner/update/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    try {
      const result = await this.userService.updateUser(id, body);
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

@Roles(Role.SUPERADMIN) // only SuperAdmin can delete
@ApiOperation({ summary: 'Delete a user' })
@Delete('owner/delete/:id')
async deleteUser(@Param('id') id: string) {
  try {
    const result = await this.userService.deleteOwner(id);
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

}
