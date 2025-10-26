import { Injectable } from '@nestjs/common';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new customer
  async create(
    createCustomerDto: CreateCustomerDto,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
      //  1. Check for existing customer (email must be unique)
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: createCustomerDto.email },
      });

      if (existingCustomer) {
        return {
          success: false,
          message: 'A customer with this email already exists.',
        };
      }

      //  2. Create new customer
      const customer = await this.prisma.customer.create({
        data: {
          ...createCustomerDto,
          workspace_id,
          owner_id: owner_id || user_id,
          user_id: user_id || owner_id,
        },
      });

      return {
        success: true,
        message: 'Customer created successfully!',
        customer,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  // Get all customers with pagination and selected fields
  async findAll(
    page: number = 1,
    limit: number = 10,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try{
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: {
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          contact: true,
          email: true,
          // balance: true,  // Assuming balance is a field in the Customer model
        },
      }),
      this.prisma.customer.count(), // Get the total number of customers for pagination
    ]);

    const totalPages = Math.ceil(total / limit); // Calculate total number of pages
    const from = skip + 1;
    const to = skip + customers.length;
    const range = `Showing ${from} to ${to} of ${total} entries`;

    return {
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        range,
      },
    };
  } catch (error) {
    return handlePrismaError(error);
  }
  }

  // Get a customer by ID
  async findOne(
    id: string,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: {
          id,
          owner_id: owner_id || user_id,
          workspace_id,
        },
      });
      if (!customer) {
        return {
          success: false,
          message: 'Customer not found',
        };
      }
      return {
        success: true,
        messager: 'Customer retrieved successfully',
        data: customer,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  // Update a customer's details
  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
      const updatedCustomer = await this.prisma.customer.update({
        where: {
          id,
          owner_id: owner_id || user_id,
          workspace_id,
        },
        data: updateCustomerDto,
      });
      return {
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer,
      };
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  // Delete a customer by ID
  async remove(
    id: string,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    try {
    const deletedCustomer = await this.prisma.customer.delete({
      where: {
        id,
        owner_id: owner_id || user_id,
        workspace_id,
      },
    });
    return {
      success: true,
      message: 'Customer deleted successfully',
      data: deletedCustomer,
    };
  }
    catch (error) {
      return handlePrismaError(error);
    } 
  }
}
