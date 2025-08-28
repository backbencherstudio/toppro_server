import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateItemDto, @Req() req) {
    // Extract user info from JWT
    const { id: user_id, owner_id, workspace_id } = req.user;
    // Merge the user info into DTO
    const itemData = {
      ...dto,
      user_id,
      owner_id,
      workspace_id,
    };

    return this.itemsService.create(itemData);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req) {
    const { owner_id, workspace_id } = req.user;
    return this.itemsService.findAll(owner_id, workspace_id);
  }

// Get a single item by ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  // Update an item by ID
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  // Delete an item by ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
