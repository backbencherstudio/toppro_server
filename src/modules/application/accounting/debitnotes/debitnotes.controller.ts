import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { UpdateDebitnoteDto } from './dto/update-debitnote.dto';
import { DebitNoteService } from './debitnotes.service';
import { CreateDebitNoteDto } from './dto/create-debitnote.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('debit-notes')
@UseGuards(JwtAuthGuard)
export class DebitNoteController {
  constructor(private readonly debitNoteService: DebitNoteService) {}

  // Create a Debit Note
  @Post()
  async createDebitNote(@Body() createDebitNoteDto: CreateDebitNoteDto, @Req() req) {
    const { id: user_id, workspace_id, owner_id } = req.user;
    return await this.debitNoteService.createDebitNote(createDebitNoteDto, owner_id, workspace_id, user_id);
  }

@Get()
async findAllDebit(
  @Req() req,
  @Query('page') page = 1,
  @Query('limit') limit = 10
) {
  const { id: user_id, workspace_id, owner_id } = req.user;
  return await this.debitNoteService.findAllDebit(
    owner_id,
    workspace_id,
    user_id,
    Number(page),
    Number(limit)
  );
}


// READ ALL: Get all Debit Notes for a Bill
  @Get('bill/:billId')
  async findAll(@Param('billId') billId: string) {
    return await this.debitNoteService.findAllDebitNotes(billId);
  }

  // READ SINGLE: Get a single Debit Note by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.debitNoteService.findOneDebitNote(id);
  }

  // UPDATE: Update an existing Debit Note
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDebitNoteDto: CreateDebitNoteDto) {
    return await this.debitNoteService.updateDebitNote(id, updateDebitNoteDto);
  }

  // DELETE: Delete a Debit Note by ID
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.debitNoteService.deleteDebitNote(id);
  }
}

