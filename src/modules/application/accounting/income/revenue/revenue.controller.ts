import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RevenueService } from './revenue.service';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('Revenue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) { }

  // create new revenue record
  @Post()
  @UseInterceptors(FileInterceptor('file')) // Single file upload
  async create(
    @Body() createRevenueDto: CreateRevenueDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.revenueService.create(
      createRevenueDto,
      ownerId,
      workspaceId,
      userId,
      file,
    );
  }



  // get all revenue records
  @Get('all')
  async findAll(
    @Req() req: any,
    @Query()
    query: {
      page?: number;
      limit?: number;
      customer?: string;
      account?: string;
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    },
  ) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.revenueService.findAll(ownerId, workspaceId, userId, query);
  }
  // get all revenue records
  @Get('customer-reveue/:customer_id')
  async findAllCustomerRevenue(
    @Req() req: any,
    @Param("customer_id") customer_id:string,
    @Query()
    query: {
      page?: number;
      limit?: number;
      customer?: string;
      account?: string;
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    },
  ) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.revenueService.findAllCustomerRevenue(customer_id,ownerId, workspaceId, userId, query);
  }


  // update specific revenue record
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file')) // Single file upload
  async update(
    @Param('id') id: string,
    @Body() updateRevenueDto: UpdateRevenueDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.revenueService.update(
      id,
      updateRevenueDto,
      ownerId,
      workspaceId,
      userId,
      file,
    );
  }


   // delete specific revenue record

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.revenueService.remove(id, ownerId, workspaceId, userId);
  }
 
  // get specific revenue record
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.revenueService.findOne(id, ownerId, workspaceId, userId);
  }
}
