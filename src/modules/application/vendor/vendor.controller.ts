import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
  @PermissionsGuard(Permissions.vendor_create)
  @PermissionsGuard(Permissions.vendor_manage)
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.create(createVendorDto);
  }

  @Get("all/:ownerId/:workspaceId")
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_view)
  @PermissionsGuard(Permissions.vendor_manage)
  findAll(
    @Query('page') page: number = 1, // Default to page 1
    @Query('limit') limit: number = 10, // Default to limit 10
    @Param('ownerId') ownerId: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.vendorService.findAll(page, limit, ownerId, workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_view)
  @PermissionsGuard(Permissions.vendor_manage)
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_update)
  @PermissionsGuard(Permissions.vendor_manage)
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.vendor_delete)
  @PermissionsGuard(Permissions.vendor_manage)
  remove(@Param('id') id: string) {
    return this.vendorService.remove(id);
  }
}
