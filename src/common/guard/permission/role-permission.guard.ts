import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permissions } from 'src/ability/permissions.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<Permissions>(
      'permission',
      context.getHandler(),
    );
    if (!requiredPermission) {
      return true; // no permission required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // assuming JWT auth sets user in request
    // console.log('User from request:', user);

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Fetch user's roles and permissions from DB
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: { include: { permissions: true } } },
    });

    if (!userWithRoles) {
      throw new ForbiddenException('User not found');
    }

    // Collect all permissions of the user
    const userPermissions = userWithRoles.roles
      .flatMap((role) => role.permissions)
      .map((perm) => perm.title);

    if (!userPermissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        `Access denied. Missing permission: ${requiredPermission}`,
      );
    }

    return true; // Permission exists, allow access
  }
}
