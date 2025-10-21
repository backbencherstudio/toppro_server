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
        message: 'Account created successfully ✅',
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
  async findAll() {
    try {
      
      const accounts = await this.prisma.chartOfAccount.findMany({
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          account_category: true,
          parent_account_name: true,
          balance: true,
          status: true,
        },
      });

      if (!accounts.length) {
        return {
          success: true,
          message: 'No accounts found in the system.',
          data: [],
        };
      }

      return {
        success: true,
        message: 'Accounts retrieved successfully.',
        data: accounts,
      };
    } catch (error) {
      console.error('Fetch Accounts Error:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve chart of accounts.',
      });
    }
  }


  /**
   *  Get single account by ID
   */
  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException({
          success: false,
          message: 'Account ID is required.',
        });
      }

      const account = await this.prisma.chartOfAccount.findUnique({
        where: { id },
      });

      if (!account) {
        throw new NotFoundException({
          success: false,
          message: 'Account not found.',
        });
      }

      return {
        success: true,
        message: 'Account found successfully.',
        data: account,
      };
    } catch (error) {
      console.error('Find One Account Error:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;

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
