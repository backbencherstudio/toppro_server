import { CreateInvoiceItemDto } from 'src/modules/application/invoice/dto/create-invoice-item.dto';

export class CreateInvoiceDto {
  invoice_number: string;
  issueAt: Date;
  dueAt: Date;
  account_type_id?: string;
  customer_id?: string;
  billing_type_id?: string;
  invoice_category_id?: string;
  item_category_id?: string;
  items: Array<CreateInvoiceItemDto>;
}
