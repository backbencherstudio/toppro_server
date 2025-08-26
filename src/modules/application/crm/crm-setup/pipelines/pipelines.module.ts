import { Module } from '@nestjs/common';
import { PipelineService } from './pipelines.service';  // ❌ was PipelinesService
import { PipelineController } from './pipelines.controller'; // ❌ was PipelinesController

@Module({
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelinesModule {}
