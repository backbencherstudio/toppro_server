import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create_user-dto';
import { LoginDto } from './dto/login_dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Check for existing username and email
    const [existingUser, existingEmail] = await Promise.all([
      this.prisma.user.findUnique({ where: { username: dto.username } }),
      this.prisma.user.findUnique({ where: { email: dto.email } }),
    ]);

    if (existingUser || existingEmail) {
      return {
        success: false,
        message: '❗ Username or Email already taken, try a different one.',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        first_name: dto.firstName ?? null,
        last_name: dto.lastName ?? null,
        balance: dto.balance, // default starting balance
      },
    });

    // Exclude password from response
    const { password, ...safeUser } = user;

    return {
      success: true,
      message: '✅ User created successfully!',
      user: safeUser,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Exclude password before returning
    const { password, ...safeUser } = user;

    return {
      success: true,
      message: '✅ Login successful!',
      user: safeUser,
    };
  }

  async getAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        first_name: true,
        last_name: true,
      },
      orderBy: { id: 'asc' },
    });
  }
}
