import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserType } from '@prisma/client';

@Injectable()
export class OwnerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || (user.type !== UserType.OWNER)) {
            throw new UnauthorizedException('Only  owners can perform this action');
        }

        return true;
    }
}