export class InvoiceResponseDto {
  id: string;
  invoice_number: string;
  issueAt: Date;
  dueAt: Date;
  subTotal: number;
  totalDiscount: number;
  totalTax: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  items: InvoiceItemResponseDto[];  // List of items

  _summary: {
    grand_total: number;
    lines_count: number;
  };
}

export class InvoiceItemResponseDto {
  id: string;
  item_id: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  description: string;
  name: string;
  sku: string;
  unit_price: number;
  total_price: number;
}
