import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from 'src/ability/permissions.enum';
import { PermissionsGuard } from 'src/common/guard/permission/permissions.decorator';
import { RolePermissionGuard } from 'src/common/guard/permission/role-permission.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorService } from './vendor.service';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  // @PermissionsGuard(Permissions.vendor_create)
  // @PermissionsGuard(Permissions.vendor_manage)
  create(@Body() createVendorDto: CreateVendorDto, @Req() req) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      user_id: userId,
    } = req.user;
    return this.vendorService.create(
      createVendorDto,
      ownerId,
      workspaceId,
      userId,
    );
  }

  @Post(':itemId')
  @UseGuards(JwtAuthGuard)
  async createWithItem(
    @Param('itemId') itemId: string,
    @Body() createVendorDto: CreateVendorDto,
    @Req() req,
  ) {
    // Pull user info from JWT
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;

    return this.vendorService.createWithItem(
      createVendorDto,
      itemId,
      ownerId,
      workspaceId,
    );
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_view)
  @PermissionsGuard(Permissions.vendor_manage)
  findAll(
    @Query('page') page: number = 1, // Default to page 1
    @Query('limit') limit: number = 10, // Default to limit 10
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.vendorService.findAll(page, limit, ownerId, workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_view)
  @PermissionsGuard(Permissions.vendor_manage)
  findOne(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.vendorService.findOne(id, ownerId, workspaceId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_update)
  @PermissionsGuard(Permissions.vendor_manage)
  update(
    @Param('id') id: string,
    @Req() req,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.vendorService.update(id, updateVendorDto, ownerId, workspaceId);
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_delete)
  @PermissionsGuard(Permissions.vendor_manage)
  remove(@Param('id') id: string,@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.vendorService.remove(id, ownerId, workspaceId);
  }
}
