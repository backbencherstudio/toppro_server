import { Module } from '@nestjs/common';
import { EmailTextService } from './emailtext.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailTextController } from './emailtext.controller';


@Module({
  controllers: [EmailTextController],
  providers: [EmailTextService, PrismaService],
})
export class EmailtextModule {}
