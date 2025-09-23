import { Module } from '@nestjs/common';
import { BankAccountController } from './bankaccount.controller';
import { BankAccountService } from './bankaccount.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BankAccountController],
  providers: [BankAccountService],
})
export class BankaccountModule {}
