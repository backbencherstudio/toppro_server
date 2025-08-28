import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new vendor
  // async create(createVendorDto: CreateVendorDto) {
  //   return this.prisma.vendor.create({
  //     data: createVendorDto,
  //   });
  // }

  // Get all vendors
  async findAll(page: number = 1, limit: number = 10, ownerId: string, workspaceId: string) {
    const skip = (page - 1) * limit; // Calculate how many records to skip based on the page

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where: {
          owner_id: ownerId,
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
  async findOne(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
    });
  }

  // Update a vendor's details
  async update(id: string, updateVendorDto: UpdateVendorDto) {
    return this.prisma.vendor.update({
      where: { id },
      data: updateVendorDto,
    });
  }

  // Delete a vendor by ID
  async remove(id: string) {
    return this.prisma.vendor.delete({
      where: { id },
    });
  }
}
