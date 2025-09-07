import { Module } from '@nestjs/common';
import { LeadsSourceService } from './leadsources.service';
import { LeadsSourceController } from './leadsources.controller';
import { ActivityModule } from '../../activity/activity.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ActivityModule],
  controllers: [LeadsSourceController],
  providers: [LeadsSourceService, PrismaService],
})
export class LeadsourcesModule {}
