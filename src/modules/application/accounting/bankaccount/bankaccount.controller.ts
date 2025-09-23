// src/bank-account/bank-account.controller.ts
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BankAccountService } from './bankaccount.service';
import { CreateBankAccountDto } from './dto/create-bankaccount.dto';
import { UpdateBankAccountDto } from './dto/update-bankaccount.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  // Create a new bank account
  @Post()
  async create(@Body() createBankAccountDto: CreateBankAccountDto, @Req() req) {
    const {
      owner_id: ownerId,
      workspace_id: workspaceId,
      id: userId,
    } = req.user;
    return this.bankAccountService.create(
      createBankAccountDto,
      ownerId,
      workspaceId,
      userId,
    );
  }

  // Update an existing bank account
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountService.update(id, updateBankAccountDto);
  }

  // Get a bank account by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bankAccountService.findOne(id);
  }

  // Get a list of all bank accounts
  @Get()
  async findAll() {
    return this.bankAccountService.findAll();
  }

  // Delete a bank account by ID
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bankAccountService.remove(id);
  }
}
