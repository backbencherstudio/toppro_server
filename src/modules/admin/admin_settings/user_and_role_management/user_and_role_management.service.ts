import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAndRoleManagementService {
  prisma: any;
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        role:true
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  
    return users.map((user) => ({
      id: user.id,
      email: user.email ?? '',
      name: user.name ?? '—',
      role: user.role ?? "_",
      status: user.status === 1 ? 'Active' : 'Inactive',
      action: 'Manage', // frontend handles click logic
    }));
  }
  
}
