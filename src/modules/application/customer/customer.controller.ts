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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.customer_create)
  @PermissionsGuard(Permissions.customer_manage)
  create(@Body() createCustomerDto: CreateCustomerDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user;
    return this.customerService.create(createCustomerDto, ownerId, workspaceId, userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.customer_view)
  @PermissionsGuard(Permissions.customer_manage)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10, // Default to limit 10
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user;
    return this.customerService.findAll(page, limit, ownerId, workspaceId, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.customer_view)
  @PermissionsGuard(Permissions.customer_manage)
  findOne(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user;
    return this.customerService.findOne(id, ownerId, workspaceId, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.customer_update)
  @PermissionsGuard(Permissions.customer_manage)
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user;

    return this.customerService.update(id, updateCustomerDto, ownerId, workspaceId, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolePermissionGuard)
  @PermissionsGuard(Permissions.customer_delete)
  @PermissionsGuard(Permissions.customer_manage)
  remove(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user;
    return this.customerService.remove(id, ownerId, workspaceId, userId);
  }
}
