import { Module } from '@nestjs/common';
import { DebitNoteController } from './debitnotes.controller';
import { DebitNoteService } from './debitnotes.service';

@Module({
  controllers: [DebitNoteController],
  providers: [DebitNoteService],
})
export class DebitnotesModule {}
