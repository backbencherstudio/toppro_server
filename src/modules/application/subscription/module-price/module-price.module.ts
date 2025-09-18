import { Module } from '@nestjs/common';
import { ModulePriceService } from './module-price.service';
import { ModulePriceController } from './module-price.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [ModulePriceController],
  providers: [ModulePriceService, UploadService],
})
export class ModulePriceModule {}
