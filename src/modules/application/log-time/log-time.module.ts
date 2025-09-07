import { Module } from '@nestjs/common';
import { LogTimeService } from './log-time.service';
import { LogTimeController } from './log-time.controller';

@Module({
  controllers: [LogTimeController],
  providers: [LogTimeService],
})
export class LogTimeModule {}
