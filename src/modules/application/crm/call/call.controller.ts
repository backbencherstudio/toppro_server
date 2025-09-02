import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';

@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Req() req, @Body() dto: CreateCallDto) {
    const ownerId = req.user.id;
    const workspaceId = req.user.workspace_id;
    return this.callService.createCall(dto, ownerId, workspaceId);
  }
}
