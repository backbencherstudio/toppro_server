import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { LeadProductsService } from './lead-products.service';
import { CreateLeadProductDto } from './dto/create-lead-product.dto';
import { UpdateLeadProductDto } from './dto/update-lead-product.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('lead-products')
export class LeadProductsController {
  constructor(private readonly leadProductsService: LeadProductsService) { }

  @UseGuards(JwtAuthGuard)
  @Post(':leadId')
  async addSources(
    @Req() req,
    @Param('leadId') leadId: string,
    @Body('productIds') productIds: string[],
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadProductsService.addProductsToLead(leadId, workspaceId, ownerId, productIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':leadId')
  async getSources(@Req() req, @Param('leadId') leadId: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadProductsService.getProductsForLead(leadId, workspaceId, ownerId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':leadId/products/:productId')
  async removeSource(
    @Req() req,
    @Param('leadId') leadId: string,
    @Param('productId') productId: string,
  ) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.leadProductsService.removeSourceFromLead(leadId, workspaceId, ownerId, productId);
  }

}
