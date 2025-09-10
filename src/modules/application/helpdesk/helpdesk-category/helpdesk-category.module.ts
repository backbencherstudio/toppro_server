import { Module } from '@nestjs/common';
import { HelpdeskCategoryService } from './helpdesk-category.service';
import { HelpdeskCategoryController } from './helpdesk-category.controller';

@Module({
  controllers: [HelpdeskCategoryController],
  providers: [HelpdeskCategoryService],
})
export class HelpdeskCategoryModule {}
