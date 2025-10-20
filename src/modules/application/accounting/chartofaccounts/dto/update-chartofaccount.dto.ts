import { PartialType } from '@nestjs/mapped-types';
import { CreateChartOfAccountDto } from 'src/modules/application/accounting/chartofaccounts/dto/create-chartofaccount.dto';

export class UpdateChartOfAccountDto extends PartialType(CreateChartOfAccountDto) {}
