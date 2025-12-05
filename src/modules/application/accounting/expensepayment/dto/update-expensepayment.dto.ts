import { PartialType } from '@nestjs/swagger';
import { CreateExpensepaymentDto } from './create-expensepayment.dto';

export class UpdateExpensepaymentDto extends PartialType(CreateExpensepaymentDto) {}
