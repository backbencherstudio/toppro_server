import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard,RolePermissionGuard)
  @PermissionsGuard(Permissions.accounting_create)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }


  @Get()
  findAll(
    @Query('page') page: number = 1, 
    @Query('limit') limit: number = 10  // Default to limit 10
  ) {
    return this.customerService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
