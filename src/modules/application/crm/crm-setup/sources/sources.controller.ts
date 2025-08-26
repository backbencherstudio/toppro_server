import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SourceService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  // CREATE
  @Post()
  create(@Body() dto: CreateSourceDto) {
    return this.sourceService.create(dto);
  }

  // LIST
  @Get('workspaceid/:workspace_id/ownerid/:owner_id')
  findAll(
    @Param('workspace_id') workspace_id: string,
    @Param('owner_id') owner_id: string,
  ) {
    return this.sourceService.findAll(workspace_id, owner_id);
  }

  // UPDATE
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSourceDto) {
    return this.sourceService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourceService.remove(id);
  }
}
