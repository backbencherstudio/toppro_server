import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { HelpDeskCategoryService } from './helpdesk-category.service';


@Controller('help-desk-category')
export class HelpDeskCategoryController {
  constructor(private readonly helpDeskCategoryService: HelpDeskCategoryService) { }

  // Only Admin (SUPERADMIN or OWNER) can create categories
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() { name, color }: { name: string; color: string },
    @Req() req: any,  
  ) {
    const user = req.user;
    if (user.type !== 'SUPERADMIN') {
      throw new ForbiddenException('You do not have permission to create a HelpDesk Category');
    }

    return this.helpDeskCategoryService.createHelpDeskCategory(user.id, name, color);
  }

  // Only Admin (SUPERADMIN or OWNER) can update categories
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() { name, color }: { name: string; color: string },
    @Req() req: any,  
  ) {
    try{
      const user = req.user;
    if (user.type !== 'SUPERADMIN') {
      throw new ForbiddenException('You do not have permission to update the HelpDesk Category');
    }

    return this.helpDeskCategoryService.updateHelpDeskCategory(user.id, id, name, color);
    }catch(error){
      return handlePrismaError(error);
    }
  }

  // Only Admin (SUPERADMIN or OWNER) can delete categories
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Req() req: any,  
  ) {
    const user = req.user;
    if (user.type !== 'SUPERADMIN') {
      throw new ForbiddenException('You do not have permission to delete the HelpDesk Category');
    }

    return this.helpDeskCategoryService.deleteHelpDeskCategory(user.id, id);
  }

  // Any user (SUPERADMIN, OWNER, or USER) can get all categories

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Req() req: any,  
    @Query('page') page = '1',  
    @Query('limit') limit = '10',
  ) {
    const user = req.user;
    return this.helpDeskCategoryService.getHelpDeskCategories(user.id, Number(page), Number(limit));
  }
}
