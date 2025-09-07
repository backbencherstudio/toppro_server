import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateLogTimeDto } from 'src/modules/application/log-time/dto/create-log-time.dto';
import { LogTimeService } from 'src/modules/application/log-time/log-time.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('logtime')
@UseGuards(JwtAuthGuard)
export class LogTimeController {
  constructor(private readonly logTimeService: LogTimeService) {}

  // POST: Create a new logTime
  @Post("create/:itemId")
  async create(@Body() createLogTimeDto: CreateLogTimeDto, @Req() req, @Param('itemId') itemId: string) {
    const {id:userId, owner_id: ownerId, workspace_id: workspaceId} = req.user
    return this.logTimeService.create(createLogTimeDto, userId, ownerId, workspaceId, itemId);
  }

  // GET all logTimes
  @Get("all/:itemId")
  async findAll( @Param('itemId') itemId: string, @Req() req ) {
    const {id:userId, owner_id: ownerId, workspace_id: workspaceId} = req.user
    return this.logTimeService.findAll( userId, ownerId, workspaceId, itemId );
  }

  // DELETE a logTime by ID
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    const {id:userId, owner_id: ownerId, workspace_id: workspaceId} = req.user
    return this.logTimeService.delete(id, userId, ownerId, workspaceId);
  }
}
