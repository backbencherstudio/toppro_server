import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new stock item
  async createStock(
    createStockDto: CreateStockDto,
    userId: string,
    ownerId: string,
    workspaceId: string,
  ) {
    try {
      console.log('createStockDto:>>', createStockDto);

      // Check if stock item already exists for the given item_id
      const existingStock = await this.prisma.stock.findUnique({
        where: {
          item_id: createStockDto.item_id,
          deleted_at: null,
        },
      });

      // console.log('existingStock:>>', existingStock);

      // If the stock exists, update the quantity
      if (existingStock) {
        const updatedStock = await this.prisma.stock.update({
          where: { id: existingStock.id },
          data: {
            quantity: existingStock.quantity + createStockDto.quantity,
          },
        });
        return updatedStock;
      } else {
        // Fetch product details from the `Items` model using `item_id`
        const item = await this.prisma.items.findUnique({
          where: { id: createStockDto.item_id },
          select: {
            name: true,
            sku: true,
            image: true,
          },
        });

        // If item does not exist, throw error
        if (!item) {
          throw new BadRequestException('Item not found');
        }

        // Create a new stock entry
        const newStock = await this.prisma.stock.create({
          data: {
            item_id: createStockDto.item_id,
            quantity: createStockDto.quantity,
            deleted_at: null,
            product_name: item.name, // Use fetched product name
            sku: item.sku, // Use fetched SKU
            image: item.image, // Use fetched image

            owner_id: ownerId || userId,
            workspace_id: workspaceId,
            user_id: userId,
          },
        });
        return {
          success: true,
          message: 'Stock item created successfully!',
          stock: newStock,
        };
      }
    } catch (error) {
      throw new BadRequestException('Failed to create or update stock item');
    }
  }

  // Get all stock items based on owner and workspace
  async getAllStocks(ownerId: string, workspaceId: string, userId: string) {
    try {
      const stocks = await this.prisma.stock.findMany({
        where: {
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
        select: {
          id: true,
          quantity: true,
          sku: true,
          Items: {
            select: {
              name: true,
            },
          },
        },
      });

      // Optional: Flatten the response for easier frontend use
      const formattedStocks = stocks.map((stock) => ({
        id: stock.id,
        name: stock.Items?.name,
        sku: stock.sku,
        quantity: stock.quantity,
      }));

      return formattedStocks;
    } catch (error) {
      throw new BadRequestException('Failed to fetch stocks');
    }
  }

  // Get Single Stock by ID
  async getSingleStock(
    id: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    try {
      const stock = await this.prisma.stock.findFirst({
        where: {
          id,
          owner_id: ownerId || userId,
          workspace_id: workspaceId,
          deleted_at: null,
        },
        select: {
          id: true,
          sku: true,
          quantity: true,
          Items: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      if (!stock) {
        throw new NotFoundException('Stock not found');
      }

      return {
        success: true,
        message: 'Stock fetched successfully!',
        data: {
          id: stock.id,
          name: stock.Items?.name,
          sku: stock.sku,
          quantity: stock.quantity,
          image: stock.Items?.image,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch stock details');
    }
  }

  // Update an existing stock item
async updateStock(
  stockId: string,
  updateStockDto: UpdateStockDto,
  ownerId: string,
  workspaceId: string,
  userId: string,
) {
  const existingStock = await this.prisma.stock.findUnique({
    where: { id: stockId },
  });

  if (!existingStock) {
    throw new NotFoundException('Stock item not found');
  }
  let newQuantity = existingStock.quantity;
  if (updateStockDto.quantity !== undefined) {
    newQuantity = existingStock.quantity + updateStockDto.quantity;
  }

  const updatedStock = await this.prisma.stock.update({
    where: { id: stockId },
    data: {
      ...updateStockDto,
      quantity: newQuantity,
      owner_id: ownerId || userId,
      workspace_id: workspaceId,
    },
  });

  return {
    success: true,
    message: 'Stock updated successfully!',
    data: updatedStock,
  };
}


  // Soft delete a stock item
  async deleteStock(
    stockId: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const stock = await this.prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      throw new NotFoundException('Stock item not found');
    }

    // Soft delete by updating deleted_at field
    const deletedStock = await this.prisma.stock.update({
      where: { id: stockId },
      data: { deleted_at: new Date() },
    });

    return {
      success: true,
      message: `Stock item with ID ${stockId} successfully deleted`,
    };
  }

  // Restore a soft-deleted stock item
  async restoreStock(
    stockId: string,
    ownerId: string,
    workspaceId: string,
    userId: string,
  ) {
    const stock = await this.prisma.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      throw new NotFoundException('Stock item not found');
    }

    // Restore the soft-deleted stock by setting deleted_at to null
    const restoredStock = await this.prisma.stock.update({
      where: { id: stockId },
      data: { deleted_at: null },
    });

    return {
      success: true,
      message: `Stock item with ID ${stockId} has been restored`,
    };
  }
}
