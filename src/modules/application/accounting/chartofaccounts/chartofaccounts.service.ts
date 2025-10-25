import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChartOfAccountDto } from './dto/create-chartofaccount.dto';
import { UpdateChartOfAccountDto } from './dto/update-chartofaccount.dto';

@Injectable()
export class ChartOfAccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🧾 Create new chart of account
   */
  async create(
    dto: CreateChartOfAccountDto,
    workspaceId: string,
    userId: string,
    ownerId: string,
  ) {
    try {
      // Check duplicate code
      const existing = await this.prisma.chartOfAccount.findUnique({
        where: { code: dto.code },
      });

      if (existing) {
        throw new ConflictException({
          success: false,
          message: 'An account with this code already exists.',
        });
      }

      const created = await this.prisma.chartOfAccount.create({
        data: {
          ...dto,
          workspace_id: workspaceId,
          owner_id: ownerId || userId,
          user_id: userId || ownerId,
        },
      });

      return {
        success: true,
        message: 'Account created successfully',
        data: created,
      };
    } catch (error) {
      console.error('Create ChartOfAccount Error:', error);

      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to create account. Please try again later.',
      });
    }
  }

  /**
   *  Get all accounts
   */
async findAll(workspace_id: string, user_id: string, owner_id: string) {
  const charts = await this.prisma.chartOfAccount.findMany({
    where: {
      workspace_id,
      OR: [{ owner_id }, { user_id }],
    },
  });

  return {
    success: true,
    message: 'Chart of accounts retrieved successfully',
    data: charts.map((chart) => ({
      id: chart.id,
      code: chart.code,
      name: chart.name,
      description: chart.description,
      account_category: chart.account_category,
      parent_account_name: chart.parent_account_name,
      child_account_type: chart.child_account_type,
      balance: chart.balance,
      status: chart.status,
      createdAt: chart.createdAt,
      updatedAt: chart.updatedAt,
      deletedAt: chart.deletedAt,
    })),
  };
}
async findAllList(workspace_id: string, user_id: string, owner_id: string) {
  const charts = await this.prisma.chartOfAccount.findMany({
    where: {
      workspace_id,
      OR: [{ owner_id }, { user_id }],
      status: 'ACTIVE',
    },
  });

  return {
    success: true,
    message: 'Chart of accounts retrieved successfully',
    data: charts.map((chart) => ({
      id: chart.id,
      code: chart.code,
      name: chart.name,
      balance: chart.balance,
    })),
  };
}


  /**
   *  Get single account by ID
   */
async findOne(id: string) {
  try {
    // Validation
    if (!id) {
      throw new BadRequestException({
        success: false,
        message: 'Account ID is required.',
      });
    }

    // Fetch single Chart of Account with optional related Bank Accounts
    const account = await this.prisma.chartOfAccount.findUnique({
      where: { id }
    });

    // Handle not found
    if (!account) {
      throw new NotFoundException({
        success: false,
        message: 'Account not found.',
      });
    }


    // Response structure
    return {
      success: true,
      message: 'Chart of account retrieved successfully',
      data: {
        id: account.id,
        code: account.code,
        name: account.name,
        description: account.description,
        account_category: account.account_category,
        parent_account_name: account.parent_account_name,
        child_account_type: account.child_account_type,
        balance: account.balance,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
          deletedAt: account.deletedAt,
      },
    };
  } catch (error) {
    console.error('Find One Account Error:', error);

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    throw new InternalServerErrorException({
      success: false,
      message: 'Something went wrong while fetching the account.',
    });
  }
}



  /**
   *  Update existing account
   */
  async update(id: string, dto: UpdateChartOfAccountDto) {
    try {
      const existing = await this.prisma.chartOfAccount.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException({
          success: false,
          message: 'Account not found.',
        });
      }

      const updated = await this.prisma.chartOfAccount.update({
        where: { id },
        data: dto,
      });

      return {
        success: true,
        message: 'Account updated successfully',
        data: updated,
      };
    } catch (error) {
      console.error('Update Account Error:', error);
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to update account. Please try again.',
      });
    }
  }

  /**
   *  Delete account
   */
  async remove(id: string) {
    try {
      const existing = await this.prisma.chartOfAccount.findUnique({ where: { id } });

      if (!existing) {
        throw new NotFoundException({
          success: false,
          message: 'Account not found or already deleted.',
        });
      }

      const deleted = await this.prisma.chartOfAccount.delete({ where: { id } });

      return {
        success: true,
        message: `Account "${existing.name}" deleted successfully`,
        data: deleted,
      };
    } catch (error) {
      console.error('Delete Account Error:', error);
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to delete account. Please try again later.',
      });
    }
  }
}
