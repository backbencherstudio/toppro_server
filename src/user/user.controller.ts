import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  // Endpoint for logging in.
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }
  @Get('users')
  async getUsers() {
    return this.userService.getAll(); // no body needed
  }
}
