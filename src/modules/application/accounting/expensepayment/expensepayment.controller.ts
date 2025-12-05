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
import { CreateExpensePaymentDto } from './dto/create-expensepayment.dto';
import { ExpensePaymentService } from './expensepayment.service';

@Controller('expense-payments')
@UseGuards(JwtAuthGuard)
export class ExpensePaymentController {
  constructor(private readonly expensePaymentService: ExpensePaymentService) {}

  // Create an Expense Payment
  @Post()
  async createExpensePayment(
    @Body() createExpensePaymentDto: CreateExpensePaymentDto,
    @Req() req,
  ) {
    const { id: user_id, workspace_id, owner_id } = req.user;
    return await this.expensePaymentService.createExpensePayment(
      createExpensePaymentDto,
      owner_id,
      workspace_id,
      user_id,
    );
  }

  @Get()
  async findAllPayment(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vendor_id') vendorId?: string,
    @Query('category_id') categoryId?: string,
    @Query('bank_account') paymentMethod?: string,
  ) {
    const { id: user_id, workspace_id, owner_id } = req.user;
    return await this.expensePaymentService.findAllPayment(
      owner_id,
      workspace_id,
      user_id,
      Number(page),
      Number(limit),
    );
  }

  // READ ALL: Get all Expense Payments for a Bill
  @Get('bill/:billId')
  async findAll(@Param('billId') billId: string, @Req() req) {
    const { id: user_id, workspace_id, owner_id } = req.user;
    return await this.expensePaymentService.findAllPayments(
      billId,
      owner_id,
      workspace_id,
      user_id,
    );
  }

  // READ SINGLE: Get a single Expense Payment by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.expensePaymentService.findOnePayment(id);
  }

  // UPDATE: Update an existing Expense Payment
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpensePaymentDto: CreateExpensePaymentDto,
  ) {
    return await this.expensePaymentService.updateExpensePayment(
      id,
      updateExpensePaymentDto,
    );
  }

  // DELETE: Delete an Expense Payment by ID
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.expensePaymentService.deleteExpensePayment(id);
  }
}
