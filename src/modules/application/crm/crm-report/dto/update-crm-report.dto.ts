import { PartialType } from '@nestjs/swagger';
import { CreateCrmReportDto } from './create-crm-report.dto';

export class UpdateCrmReportDto extends PartialType(CreateCrmReportDto) {}
