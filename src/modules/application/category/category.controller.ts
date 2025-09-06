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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // -------- ITEM CATEGORY --------
  @Post('items')
  createItemCategory(@Body() dto: CreateCategoryDto, @Req() req) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: user_id,
    } = req.user;
    return this.categoryService.createItemCategory(
      dto,
      ownerId,
      workspaceId,
      user_id,
    );
  }

  @Get('items')
  findAllItemCategories(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findAllItemCategories(ownerId, workspaceId);
  }

  @Get('items/:id')
  findItemCategoryOne(@Req() req, @Param('id') id: string) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findItemCategoryOne(id, ownerId, workspaceId);
  }

  @Patch('items/:id')
  updateItemCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.updateItemCategory(
      id,
      dto,
      ownerId,
      workspaceId,
    );
  }

  @Delete('items/:id')
  removeItemCategory(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.removeItemCategory(id, ownerId, workspaceId);
  }

  // -------- INVOICE CATEGORY --------

  @Post('invoices')
  createInvoiceCategory(@Body() dto: CreateCategoryDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.createInvoiceCategory(
      dto,
      ownerId,
      workspaceId,
    );
  }

  @Get('invoices/:id')
  async findInvoiceCategoryOne(@Req() req, @Param('id') id: string) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return await this.categoryService.findInvoiceCategoryOne(
      id,
      ownerId,
      workspaceId,
    );
  }

  @Get('invoices')
  findAllInvoiceCategories(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findAllInvoiceCategories(ownerId, workspaceId);
  }

  @Patch('invoices/:id')
  updateInvoiceCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.updateInvoiceCategory(
      id,
      dto,
      ownerId,
      workspaceId,
    );
  }

  @Delete('invoices/:id')
  removeInvoiceCategory(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.removeInvoiceCategory(id, ownerId, workspaceId);
  }

  // -------- BILL CATEGORY --------
  @Post('bills')
  createBillCategory(@Body() dto: CreateCategoryDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.createBillCategory(dto, ownerId, workspaceId);
  }

  @Get('bills/:id')
  async findBillCategoryOne(@Req() req, @Param('id') id: string) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return await this.categoryService.findBillCategoryOne(
      id,
      ownerId,
      workspaceId,
    );
  }

  @Get('bills')
  findAllBillCategories(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findAllBillCategories(ownerId, workspaceId);
  }

  @Patch('bills/:id')
  updateBillCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.updateBillCategory(
      id,
      dto,
      ownerId,
      workspaceId,
    );
  }

  @Delete('bills/:id')
  removeBillCategory(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.removeBillCategory(id, ownerId, workspaceId);
  }

  // -------- TAX --------
  @Post('taxes')
  createTax(@Body() dto: CreateCategoryDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.createTax(dto, ownerId, workspaceId);
  }

  @Get('taxes/:id')
  async findTaxCategoryOne(@Req() req, @Param('id') id: string) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return await this.categoryService.findTaxCategoryOne(
      id,
      ownerId,
      workspaceId,
    );
  }

  @Get('taxes')
  findAllTaxes(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findAllTaxes(ownerId, workspaceId);
  }

  @Patch('taxes/:id')
  updateTax(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.updateTax(id, dto, ownerId, workspaceId);
  }

  @Delete('taxes/:id')
  removeTax(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.removeTax(id, ownerId, workspaceId);
  }

  // -------- UNIT --------
  @Post('units')
  createUnit(@Body() dto: CreateCategoryDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.createUnit(dto, ownerId, workspaceId);
  }

  @Get('units/:id')
  async findUnitCategoryOne(@Req() req, @Param('id') id: string) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return await this.categoryService.findUnitCategoryOne(
      id,
      ownerId,
      workspaceId,
    );
  }

  @Get('units')
  findAllUnits(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findAllUnits(ownerId, workspaceId);
  }

  @Patch('units/:id')
  updateUnit(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.updateUnit(id, dto, ownerId, workspaceId);
  }

  @Delete('units/:id')
  removeUnit(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.removeUnit(id, ownerId, workspaceId);
  }

  // -------- ITEM TYPE --------
  @Post('item-types')
  createItemType(@Body() dto: CreateCategoryDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.createItemType(dto, ownerId, workspaceId);
  }

  @Get('item-types/:id')
  async findItemTypesCategoryOne(@Req() req, @Param('id') id: string) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return await this.categoryService.findItemTypesCategoryOne(
      id,
      ownerId,
      workspaceId,
    );
  }

  @Get('item-types')
  findAllItemTypes(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findAllItemTypes(ownerId, workspaceId);
  }

  @Patch('item-types/:id')
  updateItemType(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.updateItemType(id, dto, ownerId, workspaceId);
  }

  @Delete('item-types/:id')
  removeItemType(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.removeItemType(id, ownerId, workspaceId);
  }

  // -------- ACCOUNT TYPE --------
  @Post('account-types')
  createAccountType(@Body() dto: CreateCategoryDto, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.createAccountType(dto, ownerId, workspaceId);
  }

  @Get('account-types/:id')
  async findIAccountTypesCategoryOne(@Req() req, @Param('id') id: string) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return await this.categoryService.findIAccountTypesCategoryOne(
      id,
      ownerId,
      workspaceId,
    );
  }

  @Get('account-types')
  findAllAccountTypes(@Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.findAllAccountTypes(ownerId, workspaceId);
  }

  @Patch('account-types/:id')
  updateAccountType(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req,
  ) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.updateAccountType(
      id,
      dto,
      ownerId,
      workspaceId,
    );
  }

  @Delete('account-types/:id')
  removeAccountType(@Param('id') id: string, @Req() req) {
    const { owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.categoryService.removeAccountType(id, ownerId, workspaceId);
  }
}
