// src/modules/items/items.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

interface JwtUser {
  id: string;
  owner_id: string;
  workspace_id: string;
}

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post('create')
  async create(@Body() dto: CreateItemDto, @Req() req: any) {
    const { id:user_id, owner_id, workspace_id } = req.user;

    console.log('ItemsController', user_id, owner_id, workspace_id);
    return this.itemsService.create(dto, user_id, owner_id, workspace_id);
  }

  @Get('all')
  async getAll(@Req() req: any) {
    const { workspace_id } = req.user as JwtUser;
    return this.itemsService.findAll(workspace_id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Omit<UpdateItemDto, 'id'>,
    @Req() req: any,
  ) {
    const { workspace_id } = req.user as JwtUser;
    const dto: UpdateItemDto = { id, ...body };
    return this.itemsService.update(dto, workspace_id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const { workspace_id } = req.user as JwtUser;
    return this.itemsService.findOne(id, workspace_id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const { workspace_id } = req.user as JwtUser;
    return this.itemsService.remove(id, workspace_id);
  }
}
