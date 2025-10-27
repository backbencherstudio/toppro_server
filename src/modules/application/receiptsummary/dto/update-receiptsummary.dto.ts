import { PartialType } from '@nestjs/swagger';
import { CreateReceiptSummaryDto } from 'src/modules/application/receiptsummary/dto/create-receiptsummary.dto';

export class UpdateReceiptSummaryDto extends PartialType(CreateReceiptSummaryDto) {}
