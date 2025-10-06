import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';

@Injectable()
export class RevenueService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create a new revenue record with optional file upload
   */
  async create(
    dto: CreateRevenueDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
    file?: Express.Multer.File,
  ) {
    try {
      // Validate related entities if provided
      if (dto.account) {
        const bankAccount = await this.prisma.bankAccount.findUnique({
          where: { id: dto.account },
        });
        if (!bankAccount) {
          throw new NotFoundException('Bank account not found');
        }
      }

      if (dto.customer) {
        const customer = await this.prisma.customer.findUnique({
          where: { id: dto.customer },
        });
        if (!customer) {
          throw new NotFoundException('Customer not found');
        }
      }

      if (dto.category) {
        const category = await this.prisma.invoiceCategory.findUnique({
          where: { id: dto.category },
        });
        if (!category) {
          throw new NotFoundException('Invoice category not found');
        }
      }

      // Handle file upload if provided
      let fileUrl: string | null = null;
      if (file) {
        const fileName = `${userId}-${Date.now()}-${file.originalname}`;
        await SojebStorage.put(`revenues/${fileName}`, file.buffer);
        fileUrl = `revenues/${fileName}`;
      }

      // Create the revenue record and update bank account balance in a transaction
      const revenue = await this.prisma.$transaction(async (tx) => {
        // Create revenue
        const newRevenue = await tx.revenue.create({
          data: {
            date: new Date(dto.date),
            amount: dto.amount,
            account: dto.account,
            customer: dto.customer,
            category: dto.category,
            reference: dto.reference,
            description: dto.description,
            files: fileUrl || dto.files,
            owner_id: ownerId || userId,
            workspace_id: workspaceId,
            user_id: userId,
          },
          include: {
            bank_account: true,
            customer_data: true,
            invoice_category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Update bank account balance if account is provided and amount exists
        if (dto.account && dto.amount) {
          await tx.bankAccount.update({
            where: { id: dto.account },
            data: {
              opening_balance: {
                increment: dto.amount,
              },
            },
          });
        }

        return newRevenue;
      });

      return {
        success: true,
        message: 'Revenue created successfully',
        data: revenue,
        uploadedFile: fileUrl || undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all revenue records with filtering and pagination
   */
  async findAll(
    ownerId: string,
    workspaceId: string,
    userId: string,
    query: {
      page?: number;
      limit?: number;
      customer?: string;
      account?: string;
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    },
  ) {
    try {
      const page = query.page ? parseInt(query.page.toString()) : 1;
      const limit = query.limit ? parseInt(query.limit.toString()) : 10;
      const skip = (page - 1) * limit;

      // Build filter conditions - Use userId as fallback if ownerId is null
      const where: any = {
        owner_id: ownerId || userId,
        user_id: userId || ownerId,
        workspace_id: workspaceId,
        deleted_at: null,
      };

      if (query.customer) {
        where.customer = query.customer;
      }

      if (query.account) {
        where.account = query.account;
      }

      if (query.category) {
        where.category = query.category;
      }

      if (query.dateFrom || query.dateTo) {
        where.date = {};
        if (query.dateFrom) {
          where.date.gte = new Date(query.dateFrom);
        }
        if (query.dateTo) {
          where.date.lte = new Date(query.dateTo);
        }
      }

      if (query.search) {
        where.OR = [
          { reference: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          {
            bank_account: {
              bank_name: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            customer_data: {
              name: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            invoice_category: {
              name: { contains: query.search, mode: 'insensitive' },
            },
          },
        ];
      }

      // Get total count
      const total = await this.prisma.revenue.count({ where });

      // Get revenues with relations
      const revenues = await this.prisma.revenue.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          bank_account: {
            select: {
              id: true,
              bank_name: true,
            },
          },
          customer_data: {
            select: {
              id: true,
              name: true,
            },
          },
          invoice_category: {
            select: {
              id: true,
              name: true,

            },
          },
        },
      });

      return {
        success: true,
        message: 'Revenues fetched successfully',
        data: revenues,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single revenue by ID
   */
  async findOne(id: string, ownerId: string, workspaceId: string, userId: string) {
    try {
      const revenue = await this.prisma.revenue.findFirst({
        where: {
          id,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
        include: {
          bank_account: true,
          customer_data: true,
          invoice_category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!revenue) {
        throw new NotFoundException('Revenue not found');
      }

      return {
        success: true,
        message: 'Revenue fetched successfully',
        data: revenue,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a revenue record with optional file upload
   */
  async update(
    id: string,
    dto: UpdateRevenueDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
    file?: Express.Multer.File,
  ) {
    try {
      // Check if revenue exists - Use userId as fallback if ownerId is null
      const existingRevenue = await this.prisma.revenue.findFirst({
        where: {
          id,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
      });

      if (!existingRevenue) {
        throw new NotFoundException('Revenue not found');
      }

      // Validate related entities if provided
      if (dto.account) {
        const bankAccount = await this.prisma.bankAccount.findUnique({
          where: { id: dto.account },
        });
        if (!bankAccount) {
          throw new NotFoundException('Bank account not found');
        }
      }

      if (dto.customer) {
        const customer = await this.prisma.customer.findUnique({
          where: { id: dto.customer },
        });
        if (!customer) {
          throw new NotFoundException('Customer not found');
        }
      }

      if (dto.category) {
        const category = await this.prisma.invoiceCategory.findUnique({
          where: { id: dto.category },
        });
        if (!category) {
          throw new NotFoundException('Invoice category not found');
        }
      }

      // Handle file upload and deletion of old file
      let newFileUrl: string | null = null;
      if (file) {
        // Delete old file from storage if exists
        if (existingRevenue.files) {
          try {
            await SojebStorage.delete(existingRevenue.files);
          } catch (err) {
            // Silently fail if file doesn't exist
          }
        }

        // Upload new file
        const fileName = `${userId}-${Date.now()}-${file.originalname}`;
        await SojebStorage.put(`revenues/${fileName}`, file.buffer);
        newFileUrl = `revenues/${fileName}`;
      }

      // Update the revenue record and adjust bank account balances in a transaction
      const updatedRevenue = await this.prisma.$transaction(async (tx) => {
        // Determine if we need to update bank account balances
        const oldAccount = existingRevenue.account;
        const oldAmount = existingRevenue.amount || 0;
        const newAccount = dto.account !== undefined ? dto.account : oldAccount;
        const newAmount = dto.amount !== undefined ? dto.amount : oldAmount;

        // Update the revenue
        const updated = await tx.revenue.update({
          where: { id },
          data: {
            ...(dto.date && { date: new Date(dto.date) }),
            ...(dto.amount !== undefined && { amount: dto.amount }),
            ...(dto.account !== undefined && { account: dto.account }),
            ...(dto.customer !== undefined && { customer: dto.customer }),
            ...(dto.category !== undefined && { category: dto.category }),
            ...(dto.reference !== undefined && { reference: dto.reference }),
            ...(dto.description !== undefined && {
              description: dto.description,
            }),
            ...(newFileUrl && { files: newFileUrl }),
            ...(dto.files !== undefined && !newFileUrl && { files: dto.files }),
            user_id: userId,
          },
          include: {
            bank_account: true,
            customer_data: true,
            invoice_category: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Handle bank account balance updates
        const accountChanged = dto.account !== undefined && newAccount !== oldAccount;
        const amountChanged = dto.amount !== undefined && newAmount !== oldAmount;

        if (accountChanged || amountChanged) {
          // If account changed
          if (accountChanged) {
            // Subtract old amount from old account
            if (oldAccount && oldAmount) {
              await tx.bankAccount.update({
                where: { id: oldAccount },
                data: {
                  opening_balance: {
                    decrement: oldAmount,
                  },
                },
              });
            }

            // Add new amount to new account
            if (newAccount && newAmount) {
              await tx.bankAccount.update({
                where: { id: newAccount },
                data: {
                  opening_balance: {
                    increment: newAmount,
                  },
                },
              });
            }
          }
          // If only amount changed (same account)
          else if (amountChanged && oldAccount) {
            const difference = newAmount - oldAmount;
            if (difference !== 0) {
              await tx.bankAccount.update({
                where: { id: oldAccount },
                data: {
                  opening_balance: {
                    increment: difference,
                  },
                },
              });
            }
          }
        }

        return updated;
      });

      return {
        success: true,
        message: 'Revenue updated successfully',
        data: updatedRevenue,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Soft delete a revenue record, update bank account balance, and delete file
   */
  async remove(id: string, ownerId: string, workspaceId: string, userId: string) {
    try {
      // Use userId as fallback if ownerId is null
      const revenue = await this.prisma.revenue.findFirst({
        where: {
          id,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
      });

      if (!revenue) {
        throw new NotFoundException('Revenue not found');
      }

      // Delete file from storage if exists
      if (revenue.files) {
        try {
          await SojebStorage.delete(revenue.files);
        } catch (err) {
          // Silently fail if file doesn't exist
        }
      }

      // Soft delete revenue and update bank account balance in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Soft delete the revenue
        await tx.revenue.update({
          where: { id },
          data: {
            deleted_at: new Date(),
          },
        });

        // Subtract amount from bank account balance if account and amount exist
        if (revenue.account && revenue.amount) {
          await tx.bankAccount.update({
            where: { id: revenue.account },
            data: {
              opening_balance: {
                decrement: revenue.amount,
              },
            },
          });
        }
      });

      return {
        success: true,
        message: 'Revenue deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

}
