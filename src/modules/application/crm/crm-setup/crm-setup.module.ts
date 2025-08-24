import { Module } from '@nestjs/common';
import { CrmSetupService } from './crm-setup.service';
import { CrmSetupController } from './crm-setup.controller';

@Module({
  controllers: [CrmSetupController],
  providers: [CrmSetupService],
})
export class CrmSetupModule {}
