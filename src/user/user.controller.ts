import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create_user-dto';
import { LoginDto } from './dto/login_dto';
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
  
  @Get('users')
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


}
