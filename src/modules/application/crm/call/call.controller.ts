// src/calls/call.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { CallQueryDto } from './dto/call-query.dto';
import { CallEntity } from './entities/call.entity';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('calls')
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new call' })
  @ApiResponse({ status: 201, type: CallEntity })
  create(@Body() createCallDto: CreateCallDto, @Request() req) {
    return this.callService.create(
      createCallDto,
      req.user.id,
      req.user.workspaceId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all calls' })
  @ApiResponse({ status: 200, type: [CallEntity] })
  @ApiQuery({ name: 'leadId', required: false })
  findAll(
    @Query('leadId') leadId: string,
    @Query() query: CallQueryDto,
    @Request() req,
  ) {
    return this.callService.findAll(req.user.workspaceId, leadId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a call by ID' })
  @ApiResponse({ status: 200, type: CallEntity })
  @ApiParam({ name: 'id', description: 'Call ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.callService.findOne(id, req.user.workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a call' })
  @ApiResponse({ status: 200, type: CallEntity })
  @ApiParam({ name: 'id', description: 'Call ID' })
  update(
    @Param('id') id: string,
    @Body() updateCallDto: UpdateCallDto,
    @Request() req,
  ) {
    return this.callService.update(id, updateCallDto, req.user.workspaceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a call' })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'id', description: 'Call ID' })
  remove(@Param('id') id: string, @Request() req) {
    return this.callService.remove(id, req.user.workspaceId);
  }
}