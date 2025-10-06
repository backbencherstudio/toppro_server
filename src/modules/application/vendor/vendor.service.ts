import { Injectable } from '@nestjs/common';
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
  // Check if the taxNumber already exists
  const existingVendor = await this.prisma.vendor.findUnique({
    where: { taxNumber: createVendorDto.taxNumber },
  });

  if (existingVendor) {
    return {
      success: false,
      message: 'A vendor with this tax number already exists.',
    };
  }

  // Proceed to create the new vendor
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
    vendor,
  };
}


  // Create vendor and link it to an item
  async createWithItem(
    createVendorDto: CreateVendorDto,
    itemId: string,
    ownerId: string,
    workspaceId: string,
  ) {
    // Hash password before saving

    // Use UncheckedCreateInput to allow direct foreign key assignment
    const data: Prisma.VendorUncheckedCreateInput = {
      ...createVendorDto,
      item_id: itemId,
      owner_id: ownerId,
      workspace_id: workspaceId,
    };

    return this.prisma.vendor.create({ data });
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
          owner_id: ownerId ||userId,
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
  ) {
    return this.prisma.vendor.update({
      where: { id, owner_id, workspace_id },
      data: updateVendorDto,
    });
  }

  // Delete a vendor by ID
  async remove(id: string, owner_id: string, workspace_id: string) {
    return this.prisma.vendor.delete({
      where: { id, owner_id, workspace_id },
    });
  }
}
