import { PartialType } from '@nestjs/swagger';
import { CreateExpensePaymentDto } from './create-expensepayment.dto';

export class UpdateExpensePaymentDto extends PartialType(CreateExpensePaymentDto) {}
