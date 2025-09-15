// src/modules/items/items.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post('create')
  async create(@Body() dto: CreateItemDto, @Req() req: any) {
    const {
      id: userId,
      owner_id: ownerId,
      workspace_id: workspaceId,
    } = req.user;

    console.log('ItemsController', userId, ownerId, workspaceId);
    return this.itemsService.create(dto, userId, ownerId, workspaceId);
  }

  @Get('all')
  async getAll(
    @Req() req: any,
    @Query('itemType_id') itemTypeId: string,
    @Query('itemCategory_id') itemCategoryId: string,
    @Query('search') searchTerm: string, // Accept the search term
  ) {
    const {
      id: userId,
      owner_id: ownerId,
      workspace_id: workspaceId,
    } = req.user;

    return this.itemsService.findAll(
      userId,
      ownerId,
      workspaceId,
      itemTypeId,
      itemCategoryId,
      searchTerm,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Omit<UpdateItemDto, 'id'>,
    @Req() req: any,
  ) {
    const { workspace_id } = req.user;
    const dto: UpdateItemDto = { id, ...body };
    return this.itemsService.update(dto, workspace_id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const { workspace_id } = req.user;
    return this.itemsService.findOne(id, workspace_id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const { workspace_id } = req.user;
    return this.itemsService.remove(id, workspace_id);
  }
}
