import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityService } from '../../activity/activity.service';

@Injectable()
export class LeadProductsService {
  constructor(private prisma: PrismaService, private activityService: ActivityService) { }
  async addProductsToLead(
    leadId: string,
    workspaceId: string,
    ownerId: string,
    productIds: string[],
  ) {

    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId
      },
      include: {
        products: { select: { id: true, name: true } }
      }
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }

    const products = await this.prisma.items.findMany({
      where: {
        id: { in: productIds },
      },
      select: { name: true },
    });

    const productNames = products.map(product => product.name).join(', ');
    console.log('Product Names:', productNames);

  
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        products: {
          connect: productIds.map((id) => ({ id })),
        },
      },
    });

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { name: true },
    });

    const activityMessage = lead.products.length === 1
      ? `${owner?.name || 'Someone'} added a new product to lead: ${productNames}`
      : `${owner?.name || 'Someone'} added new product(s) to lead: ${productNames}`;

    await this.activityService.createActivity(
      workspaceId,
      ownerId,
      lead.id,
      'product',
      activityMessage,
    );

    return {
      success: true,
      message: 'Products added to lead successfully ',
      lead_id: leadId,
      productIds,
    };
  }


  async getProductsForLead(leadId: string, workspaceId: string, ownerId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
        deleted_at: null,
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }


    return {
      success: true,
      lead_id: lead.id,
      products: lead.products.map((p) => ({
        product_id: p.id,
        name: p.name,
      })),
    };
  }

  async removeSourceFromLead(
    leadId: string,
    workspaceId: string,
    ownerId: string,
    productId: string,
  ) {

    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        workspace_id: workspaceId,
        owner_id: ownerId,
      },
      include: {
        products: { select: { id: true, name: true } },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead with id ${leadId} not found in this workspace/owner`,
      );
    }


    const product = await this.prisma.items.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

   
    const isAttached = lead.products.some((s) => s.id === productId);
    if (!isAttached) {
      throw new BadRequestException(
        `Product '${product.name}' is not assigned to this lead`,
      );
    }


    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
    });


    return {
      success: true,
      message: `Product '${product.name}' removed from lead successfully`,
      lead_id: leadId,
      removed_product: {
        id: product.id,
      },
    };
  }
}
