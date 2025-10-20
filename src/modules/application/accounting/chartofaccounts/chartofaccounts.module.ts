import { Module } from '@nestjs/common';
import { ChartOfAccountController } from 'src/modules/application/accounting/chartofaccounts/chartofaccounts.controller';
import { ChartOfAccountService } from 'src/modules/application/accounting/chartofaccounts/chartofaccounts.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ChartOfAccountController],
  providers: [ChartOfAccountService, PrismaService],
})
export class ChartOfAccountModule {}
