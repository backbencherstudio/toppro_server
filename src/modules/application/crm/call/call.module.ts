import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { CallController } from './call.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [CallController],
  providers: [CallService, PrismaService],
  exports: [CallService],
})
export class CallModule {}
