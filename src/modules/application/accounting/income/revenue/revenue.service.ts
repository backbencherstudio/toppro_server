import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';

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
    // Validate related entities
    if (dto.bank_account_id) {
      const bankAccount = await this.prisma.bankAccount.findUnique({
        where: { id: dto.bank_account_id },
      });
      if (!bankAccount) {
        throw new BadRequestException({
          field: 'bank_account_id',
          message: 'Bank account not found',
        });
      }
    }

    if (dto.customer_id) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customer_id },
      });
      if (!customer) {
        throw new BadRequestException({
          field: 'customer_id',
          message: 'Customer not found',
        });
      }
    }

    if (dto.invoice_category_id) {
      const category = await this.prisma.invoiceCategory.findUnique({
        where: { id: dto.invoice_category_id },
      });
      if (!category) {
        throw new BadRequestException({
          field: 'invoice_category_id',
          message: 'Invoice category not found',
        });
      }
    }

    //  Handle file upload
    let fileUrl: string | null = null;
    if (file) {
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;
      await SojebStorage.put(`revenues/${fileName}`, file.buffer);
      fileUrl = `revenues/${fileName}`;
    }

    //  Create revenue in transaction
    const revenue = await this.prisma.$transaction(async (tx) => {
      const newRevenue = await tx.revenue.create({
        data: {
          date: new Date(dto.date),
          amount: dto.amount,
          bank_account_id: dto.bank_account_id,
          customer_id: dto.customer_id,
          invoice_category_id: dto.invoice_category_id,
          reference: dto.reference,
          description: dto.description,
          files: fileUrl || dto.files,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
          user_id: userId,
        }
      });

      // Update bank balance
      if (dto.bank_account_id && dto.amount) {
        await tx.bankAccount.update({
          where: { id: dto.bank_account_id },
          data: {
            opening_balance: { increment: dto.amount },
          },
        });
      }

      return newRevenue;
    });

    // ✅ Final return
    return {
      success: true,
      message: 'Revenue created successfully',
      data: revenue,
    };
  } catch (error) {
    // 🔹 Error handling
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new BadRequestException({
        message: 'Database constraint error',
        code: error.code,
        meta: error.meta,
      });
    }

    console.error('Revenue Create Error:', error);

    throw new InternalServerErrorException({
      message: 'Something went wrong while creating revenue',
      error: error.message,
    });
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

    // 🔹 Filter conditions
    const where: any = {
      owner_id: ownerId || userId,
      user_id: userId || ownerId,
      workspace_id: workspaceId,
      deleted_at: null,
    };

    if (query.customer) where.customer_id = query.customer;
    if (query.account) where.bank_account_id = query.account;
    if (query.category) where.invoice_category_id = query.category;

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
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

    // 🔹 Count total
    const total = await this.prisma.revenue.count({ where });

    // 🔹 Fetch paginated results
    const revenues = await this.prisma.revenue.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        bank_account: { select: { id: true, bank_name: true } },
        customer_data: { select: { id: true, name: true } },
        invoice_category: { select: { id: true, name: true } },
      },
    });

    // 🔹 Format data
    const formattedData = revenues.map((item) => ({
      id: item.id,
      date: item.date,
      amount: Number(item.amount),
      bank_account_id: item.bank_account_id,
      customer_id: item.customer_id,
      invoice_category_id: item.invoice_category_id,
      reference: item.reference,
      description: item.description,
      files: item.files,
    }));

    // ✅ Return response
    return {
      success: true,
      message: 'Revenues fetched successfully',
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('FindAll Revenue Error:', error);
    throw new InternalServerErrorException({
      message: 'Something went wrong while fetching revenues',
      error: error.message,
    });
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
      },
    });

    if (!revenue) {
      throw new NotFoundException('Revenue not found');
    }

    // ✅ Return only specific formatted data
    return {
      success: true,
      message: 'Revenue fetched successfully',
      data: {
        id: revenue.id,
        date: revenue.date,
        amount: Number(revenue.amount),
        bank_account_id: revenue.bank_account_id,
        customer_id: revenue.customer_id,
        invoice_category_id: revenue.invoice_category_id,
        reference: revenue.reference,
        description: revenue.description,
        files: revenue.files,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundException) throw error;

    console.error('FindOne Revenue Error:', error);
    throw new InternalServerErrorException({
      message: 'Something went wrong while fetching revenue',
      error: error.message,
    });
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
      if (dto.bank_account_id) {
        const bankAccount = await this.prisma.bankAccount.findUnique({
          where: { id: dto.bank_account_id },
        });
        if (!bankAccount) {
          throw new NotFoundException('Bank account not found');
        }
      }

      if (dto.customer_id) {
        const customer = await this.prisma.customer.findUnique({
          where: { id: dto.customer_id },
        });
        if (!customer) {
          throw new NotFoundException('Customer not found');
        }
      }

      if (dto.invoice_category_id) {
        const category = await this.prisma.invoiceCategory.findUnique({
          where: { id: dto.invoice_category_id },
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
        const oldAccount = existingRevenue.bank_account_id;
        const oldAmount = existingRevenue.amount || 0;
        const newAccount = dto.bank_account_id !== undefined ? dto.bank_account_id : oldAccount;
        const newAmount = dto.amount !== undefined ? dto.amount : oldAmount;

        // Update the revenue
        const updated = await tx.revenue.update({
          where: { id },
          data: {
            ...(dto.date && { date: new Date(dto.date) }),
            ...(dto.amount !== undefined && { amount: dto.amount }),
            ...(dto.bank_account_id !== undefined && { bank_account_id: dto.bank_account_id }),
            ...(dto.customer_id !== undefined && { customer_id: dto.customer_id }),
            ...(dto.invoice_category_id !== undefined && { invoice_category_id: dto.invoice_category_id }),
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
        const accountChanged = dto.bank_account_id !== undefined && newAccount !== oldAccount;
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
        if (revenue.bank_account_id && revenue.amount) {
          await tx.bankAccount.update({
            where: { id: revenue.bank_account_id },
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
