// deal-stage.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DealStageController } from './deal_stages.controller';
import { DealStageService } from './deal_stages.service';

@Module({
  controllers: [DealStageController],
  providers: [DealStageService, PrismaService],
})
export class DealStageModule {}
