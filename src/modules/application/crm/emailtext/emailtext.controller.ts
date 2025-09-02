import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { EmailTextService } from './emailtext.service';
import { CreateEmailTextDto } from './dto/create-emailtext.dto';


@Controller('email-texts')
export class EmailTextController {
  constructor(private readonly emailTextService: EmailTextService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Req() req, @Body() dto: CreateEmailTextDto) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.emailTextService.createEmailText(dto, ownerId, workspaceId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('lead/:leadId')
  async getAllByLead(@Req() req, @Body('leadId') leadId: string) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.emailTextService.getAllByLead(leadId, ownerId, workspaceId);
  }
}
