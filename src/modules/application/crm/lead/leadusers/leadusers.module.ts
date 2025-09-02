import { Module } from '@nestjs/common';
import { LeadsUserService } from './leadusers.service';
import { LeadsUserController } from './leadusers.controller';


@Module({
  controllers: [LeadsUserController],
  providers: [LeadsUserService],
})
export class LeadsUserModule {}
