import { Module } from '@nestjs/common';
import { HelpDeskCategoryController } from './helpdesk-category.controller';
import { HelpDeskCategoryService } from './helpdesk-category.service';


@Module({
  controllers: [HelpDeskCategoryController],
  providers: [HelpDeskCategoryService],
})
export class HelpDeskCategoryModule {}
