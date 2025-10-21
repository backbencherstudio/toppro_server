import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new vendor
  async create(
    createVendorDto: CreateVendorDto,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      // Check if taxNumber is provided
      if (!createVendorDto.taxNumber) {
        return {
          success: false,
          message: 'Tax number is required to create a vendor.',
        };
      }

      // Check if the vendor already exists
      const existingVendor = await this.prisma.vendor.findUnique({
        where: { taxNumber: createVendorDto.taxNumber },
      });

      if (existingVendor) {
        return {
          success: false,
          message: 'A vendor with this tax number already exists.',
        };
      }

      // Try creating the new vendor
      const vendor = await this.prisma.vendor.create({
        data: {
          ...createVendorDto,
          workspace_id: workspaceId,
          owner_id: ownerId || userId,
        },
      });

      return {
        success: true,
        message: 'Vendor created successfully!',
        data: vendor,
      };
    } catch (error) {
      console.error('Error creating vendor:', error);

      // Prisma unique constraint violation (duplicate field)
      if (error.code === 'P2002') {
        return {
          success: false,
          message: `A vendor with this ${error.meta?.target?.join(', ') || 'field'} already exists.`,
        };
      }

      // Prisma foreign key violation
      if (error.code === 'P2003') {
        return {
          success: false,
          message: `Invalid relation reference — please check workspace or owner.`,
        };
      }

      // Unknown error
      return {
        success: false,
        message: 'An unexpected error occurred while creating the vendor.',
        error: error.message,
      };
    }
  }

  // Create vendor and link it to an item
  async createWithItem(
    createVendorDto: CreateVendorDto,
    itemId: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      const data: Prisma.VendorUncheckedCreateInput = {
        ...createVendorDto,
        item_id: itemId,
        owner_id: ownerId || userId,
        workspace_id: workspaceId,
      };

      const vendor = await this.prisma.vendor.create({ data });

      return {
        success: true,
        message: 'Vendor created successfully!',
        data: vendor,
      };
    } catch (error) {
      // ✅ Handle known Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Duplicate key (unique constraint)
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.[0]; // which field is duplicated

          if (field === 'email') {
            return {
              success: false,
              message: 'Vendor with this email already exists.',
            };
          }

          if (field === 'tax_number') {
            return {
              success: false,
              message: 'Vendor with this tax number already exists.',
            };
          }

          return {
            success: false,
            message: `Duplicate value for field: ${field}`,
          };
        }

        // Foreign key issue
        if (error.code === 'P2003') {
          return {
            success: false,
            message: 'Invalid foreign key. Please check related IDs.',
          };
        }

        // Record not found
        if (error.code === 'P2025') {
          return { success: false, message: 'Referenced record not found.' };
        }
      }

      // Fallback for any other unknown error
      return {
        success: false,
        message:
          'Something went wrong while creating the vendor. Please try again later.',
      };
    }
  }

  // Get all vendors
  async findAll(
    page: number = 1,
    limit: number = 10,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const skip = (page - 1) * limit; // Calculate how many records to skip based on the page
    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
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
    const to = skip + vendors.length;
    const range = `Showing ${from} to ${to} of ${total} entries`;

    return {
      data: vendors,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        range,
      },
    };
  }

  // Get a vendor by ID
  async findOne(id: string, ownerId: string, workspaceId: string) {
    return this.prisma.vendor.findUnique({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  // Update a vendor's details
  async update(
    id: string,
    updateVendorDto: UpdateVendorDto,
    owner_id: string,
    workspace_id: string,
    userId: string,
  ) {
    try {
      // Check if vendor exists
      const existingVendor = await this.prisma.vendor.findFirst({
        where: { id, owner_id: owner_id || userId, workspace_id },
      });

      if (!existingVendor) {
        throw new NotFoundException('Vendor not found');
      }

      // Perform update
      const updatedVendor = await this.prisma.vendor.update({
        where: { id },
        data: updateVendorDto,
      });

      return {
        success: true,
        message: 'Vendor updated successfully!',
        data: updatedVendor,
      };
    } catch (error) {
      // Prisma known errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            // unique constraint failed
            throw new ConflictException('Email or Tax number already exists');
          case 'P2025':
            // record not found
            throw new NotFoundException('Vendor not found for update');
          default:
            throw new BadRequestException('Database error occurred');
        }
      }

      // Prisma validation or query errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid data provided for vendor update');
      }

      // Catch-all fallback
      throw new InternalServerErrorException(error.message || 'Something went wrong');
    }
  }

  // Delete a vendor by ID
  async remove(id: string, owner_id: string, workspace_id: string) {
    return this.prisma.vendor.delete({
      where: { id, owner_id, workspace_id },
    });
  }


  async findByItemId(itemId: string) {
  try {
    const vendors = await this.prisma.vendor.findMany({
      where: { item_id: itemId },
      orderBy: { createdAt: 'desc' }, // optional
    });

    if (!vendors || vendors.length === 0) {
      return {
        success: false,
        message: 'No vendors found for this item.',
        data: [],
      };
    }

    return {
      success: true,
      message: 'Vendors retrieved successfully!',
      data: vendors,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2023') {
        // invalid ID format
        return { success: false, message: 'Invalid item ID format.' };
      }
    }

    return {
      success: false,
      message: 'Something went wrong while fetching vendors. Please try again.',
    };
  }
}

}
