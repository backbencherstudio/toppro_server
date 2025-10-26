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
    // 0️⃣ Validate amount
    if (dto.amount === undefined || dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // 1️⃣ Validate Customer
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

    // 2️⃣ Handle File Upload
    let fileUrl: string | null = null;
    if (file) {
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;
      await SojebStorage.put(`revenues/${fileName}`, file.buffer);
      fileUrl = `revenues/${fileName}`;
    }

    // 3️⃣ Create Revenue & Update Balances in Transaction
    const revenue = await this.prisma.$transaction(async (tx) => {
      // a) Create Revenue
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
        },
      });

      // b) Update Bank Balance
      if (dto.bank_account_id) {
        const bank = await tx.bankAccount.update({
          where: { id: dto.bank_account_id },
          data: { opening_balance: { increment: dto.amount } },
        });

        // c) Update ChartOfAccount balance if linked
        if (bank.chart_of_account_id) {
          await tx.chartOfAccount.update({
            where: { id: bank.chart_of_account_id },
            data: { balance: { increment: dto.amount } },
          });
        }
      }

      // d) Update Customer Balance
      let updatedCustomer: any = null;
      if (dto.customer_id) {
        updatedCustomer = await tx.customer.update({
          where: { id: dto.customer_id },
          data: { balance: { increment: dto.amount } },
        });
      }

      return { revenue: newRevenue, customer: updatedCustomer };
    });

    // 4️⃣ Return Response
    return {
      success: true,
      message: 'Revenue created successfully',
      data: {
        revenue: revenue.revenue,
        customer_balance: revenue.customer?.balance ?? null,
      },
    };
  } catch (error) {
    // 5️⃣ Error Handling
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


// ---------------------- UPDATE REVENUE ----------------------
async update(
  id: string,
  dto: UpdateRevenueDto,
  ownerId: string,
  workspaceId: string,
  userId: string,
  file?: Express.Multer.File,
) {
  try {
    // 1️⃣ Find existing revenue
    const existingRevenue = await this.prisma.revenue.findFirst({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId, deleted_at: null },
    });
    if (!existingRevenue) throw new NotFoundException('Revenue not found');

    // 2️⃣ Validate amount (>0)
    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // 3️⃣ Validate related entities
    if (dto.customer_id) {
      const customer = await this.prisma.customer.findUnique({ where: { id: dto.customer_id } });
      if (!customer) throw new NotFoundException('Customer not found');
    }
    if (dto.bank_account_id) {
      const bank = await this.prisma.bankAccount.findUnique({ where: { id: dto.bank_account_id } });
      if (!bank) throw new NotFoundException('Bank account not found');
    }
    if (dto.invoice_category_id) {
      const category = await this.prisma.invoiceCategory.findUnique({ where: { id: dto.invoice_category_id } });
      if (!category) throw new NotFoundException('Invoice category not found');
    }

    // 4️⃣ Handle file upload
    let newFileUrl: string | null = null;
    if (file) {
      if (existingRevenue.files) {
        try { await SojebStorage.delete(existingRevenue.files); } catch {}
      }
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;
      await SojebStorage.put(`revenues/${fileName}`, file.buffer);
      newFileUrl = `revenues/${fileName}`;
    }

    // 5️⃣ Transaction: Update Revenue & Balances
    const updatedRevenue = await this.prisma.$transaction(async (tx) => {
      const oldAmount = existingRevenue.amount || 0;
      const oldBankId = existingRevenue.bank_account_id;
      const oldCustomerId = existingRevenue.customer_id;

      const newAmount = dto.amount !== undefined ? dto.amount : oldAmount;
      const newBankId = dto.bank_account_id !== undefined ? dto.bank_account_id : oldBankId;
      const newCustomerId = dto.customer_id !== undefined ? dto.customer_id : oldCustomerId;

      // a) Update Revenue
      const updated = await tx.revenue.update({
        where: { id },
        data: {
          ...(dto.date && { date: new Date(dto.date) }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.bank_account_id !== undefined && { bank_account_id: dto.bank_account_id }),
          ...(dto.customer_id !== undefined && { customer_id: dto.customer_id }),
          ...(dto.invoice_category_id !== undefined && { invoice_category_id: dto.invoice_category_id }),
          ...(dto.reference !== undefined && { reference: dto.reference }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(newFileUrl && { files: newFileUrl }),
          user_id: userId,
        },
      });

      // b) Adjust BankAccount balances
      if (oldBankId && oldAmount) await tx.bankAccount.update({ where: { id: oldBankId }, data: { opening_balance: { decrement: oldAmount } } });
      if (newBankId && newAmount) {
        await tx.bankAccount.update({ where: { id: newBankId }, data: { opening_balance: { increment: newAmount } } });
        const bank = await tx.bankAccount.findUnique({ where: { id: newBankId } });
        if (bank?.chart_of_account_id) {
          await tx.chartOfAccount.update({ where: { id: bank.chart_of_account_id }, data: { balance: { increment: newAmount - (oldBankId === newBankId ? oldAmount : 0) } } });
        }
      }

      // c) Adjust Customer balances
      if (oldCustomerId && oldAmount) await tx.customer.update({ where: { id: oldCustomerId }, data: { balance: { decrement: oldAmount } } });
      if (newCustomerId && newAmount) await tx.customer.update({ where: { id: newCustomerId }, data: { balance: { increment: newAmount } } });

      return updated;
    });

    return {
      success: true,
      message: 'Revenue updated successfully',
      data: {
        id: updatedRevenue.id,
        date: updatedRevenue.date,
        amount: updatedRevenue.amount,
        bank_account_id: updatedRevenue.bank_account_id,
        customer_id: updatedRevenue.customer_id,
        invoice_category_id: updatedRevenue.invoice_category_id,
        reference: updatedRevenue.reference,
        description: updatedRevenue.description,
        files: updatedRevenue.files,
      },
    };
  } catch (error) {
    console.error('Revenue Update Error:', error);
    throw error;
  }
}

// ---------------------- REMOVE REVENUE ----------------------
async remove(id: string, ownerId: string, workspaceId: string, userId: string) {
  try {
    // 1️⃣ Find Revenue
    const revenue = await this.prisma.revenue.findFirst({
      where: { id, owner_id: ownerId || userId, workspace_id: workspaceId, deleted_at: null },
    });
    if (!revenue) throw new NotFoundException('Revenue not found');

    // 2️⃣ Delete file from storage if exists
    if (revenue.files) {
      try { await SojebStorage.delete(revenue.files); } catch {}
    }

    // 3️⃣ Transaction: Soft delete & adjust balances
    await this.prisma.$transaction(async (tx) => {
      await tx.revenue.update({ where: { id }, data: { deleted_at: new Date() } });

      if (revenue.bank_account_id && revenue.amount) {
        await tx.bankAccount.update({ where: { id: revenue.bank_account_id }, data: { opening_balance: { decrement: revenue.amount } } });
        const bank = await tx.bankAccount.findUnique({ where: { id: revenue.bank_account_id } });
        if (bank?.chart_of_account_id) {
          await tx.chartOfAccount.update({ where: { id: bank.chart_of_account_id }, data: { balance: { decrement: revenue.amount } } });
        }
      }

      if (revenue.customer_id && revenue.amount) {
        await tx.customer.update({ where: { id: revenue.customer_id }, data: { balance: { decrement: revenue.amount } } });
      }
    });

    return { success: true, message: 'Revenue deleted successfully' };
  } catch (error) {
    console.error('Revenue Remove Error:', error);
    throw error;
  }
}


}
