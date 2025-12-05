import { Module } from '@nestjs/common';
import { DebitnotesService } from './debitnotes.service';
import { DebitnotesController } from './debitnotes.controller';

@Module({
  controllers: [DebitnotesController],
  providers: [DebitnotesService],
})
export class DebitnotesModule {}
