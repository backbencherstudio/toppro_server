import { Module } from '@nestjs/common';
import { SourceService} from './sources.service';
import { SourceController } from './sources.controller';

@Module({
  controllers: [SourceController],
  providers: [SourceService],
})
export class SourcesModule {}
