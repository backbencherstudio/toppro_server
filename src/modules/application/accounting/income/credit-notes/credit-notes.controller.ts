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
} from '@nestjs/common';
import { CreditNotesService } from './credit-notes.service';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { UpdateCreditNoteDto } from './dto/update-credit-note.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('credit-notes')
@UseGuards(JwtAuthGuard)
export class CreditNotesController {
  constructor(private readonly creditNotesService: CreditNotesService) { }

  @Post()
  create(@Body() createCreditNoteDto: CreateCreditNoteDto, @Req() req: any) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.creditNotesService.create(createCreditNoteDto, ownerId, workspaceId, userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.creditNotesService.findAll(ownerId, workspaceId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.creditNotesService.findOne(id, ownerId, workspaceId, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreditNoteDto: UpdateCreditNoteDto, @Req() req: any) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.creditNotesService.update(id, updateCreditNoteDto, ownerId, workspaceId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const { id: userId, owner_id: ownerId, workspace_id: workspaceId } = req.user;
    return this.creditNotesService.remove(id, ownerId, workspaceId, userId);
  }
}
