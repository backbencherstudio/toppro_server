import { Module } from '@nestjs/common';
import { LeadsSourceService } from './leadsources.service';
import { LeadsSourceController } from './leadsources.controller';

@Module({
  controllers: [LeadsSourceController],
  providers: [LeadsSourceService],
})
export class LeadsourcesModule {}
