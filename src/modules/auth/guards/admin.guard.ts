import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserType } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || (user.type !== UserType.SUPERADMIN && user.type !== UserType.OWNER)) {
            throw new UnauthorizedException('Only administrators or owners can perform this action');
        }

        return true;
    }
}