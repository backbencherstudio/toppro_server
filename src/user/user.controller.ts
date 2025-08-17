import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/create_user-dto';
import { LoginDto } from './dto/login_dto';
import { UserService } from './user.service';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Endpoint for registering a new user.
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  
  @Post('createUser')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // Endpoint for logging in.
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }
  
  @Get('all')
  async getUsers() {
    return this.userService.getAll(); // no body needed
  }

  // Endpoint to assign a role to a user
  @Put(':userId/assign-role')  // Using PUT method to update the role assignment
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() assignRoleDto: { roleId: string }
  ) {
    return this.userService.assignRoleToUser(userId, assignRoleDto.roleId);
  }

    // Endpoint to get a single user by userId
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return this.userService.getUserById(userId); // Get single user by ID
  }

    // Endpoint to update a user's information
  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: CreateUserDto
  ) {
    return this.userService.updateUser(userId, updateUserDto); // Update user
  }

  // Endpoint to delete a user by userId
  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId); // Delete user
  }

  // Endpoint to enable or disable a user
  @Put(':userId/enable-disable')
  async enableDisableUser(
    @Param('userId') userId: string,
    @Body() { status }: { status: boolean }  // True = enable, False = disable
  ) {
    return this.userService.enableDisableUser(userId, status); // Enable/Disable user
  }


}
