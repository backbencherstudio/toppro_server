import { PartialType } from '@nestjs/swagger';
import { CreateChartofaccountDto } from './create-chartofaccount.dto';

export class UpdateChartofaccountDto extends PartialType(CreateChartofaccountDto) {}
