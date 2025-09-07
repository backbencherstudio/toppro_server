import { Injectable } from '@nestjs/common';
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
  // Example of checking for unique email before creating
  const existingCustomer = await this.prisma.customer.findUnique({
    where: { email: createCustomerDto.email }, 
  });

  if (existingCustomer) {
    return {
      success: false,
      message: 'A customer with this email already exists.',
    };
  }

  // If no conflict, create the customer
  const customer = await this.prisma.customer.create({
    data: {
      ...createCustomerDto,
      workspace_id: workspace_id,
      owner_id: owner_id || user_id,
    },
  });

  return {
    success: true,
    message: 'Customer created successfully!',
    customer,
  };
}


  // Get all customers with pagination and selected fields
  async findAll(
    page: number = 1,
    limit: number = 10,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
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
  }

  // Get a customer by ID
  async findOne(
    id: string,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    return this.prisma.customer.findUnique({
      where: {
        id,
        owner_id: owner_id || user_id,
        workspace_id,
      },
    });
  }

  // Update a customer's details
  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    return this.prisma.customer.update({
      where: {
        id,
        owner_id: owner_id || user_id,
        workspace_id,
      },
      data: updateCustomerDto,
    });
  }

  // Delete a customer by ID
  async remove(
    id: string,
    owner_id: string,
    workspace_id: string,
    user_id: string,
  ) {
    return this.prisma.customer.delete({
      where: {
        id,
        owner_id: owner_id || user_id,
        workspace_id,
      },
    });
  }
}
