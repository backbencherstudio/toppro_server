import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { StockService } from './stock.service';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  async createStock(@Body() createStockDto, @Req() req) {
 const {id:userId, owner_id:ownerId, workspace_id:workspaceId}= req.user
    return this.stockService.createStock(createStockDto, userId, ownerId, workspaceId);
  }

  @Get("all")
  async getAllStocks(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user 
    return this.stockService.getAllStocks(ownerId, workspaceId, userId);
  }

 // Get Single Stock by ID
  @Get(':id')
  async getSingleStock(@Param('id') id: string, @Req() req: any) {
    const { owner_id, workspace_id, id: user_id } = req.user;

    return this.stockService.getSingleStock(id, owner_id, workspace_id, user_id);
  }

  @Put(':id')
  async updateStock(
    @Param('id') stockId: string,
    @Body() updateStockDto,
    @Req() req
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user
    return this.stockService.updateStock(stockId, updateStockDto, ownerId, workspaceId, userId);
  }

  @Delete(':id')
  async deleteStock(@Param('id') stockId: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user
    return this.stockService.deleteStock(stockId, ownerId, workspaceId, userId);
  }

  @Put('restore/:id')
  async restoreStock(@Param('id') stockId: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId, id: userId } = req.user
    return this.stockService.restoreStock(stockId, ownerId, workspaceId, userId);
  }
}
