export class CreateBillItemDto {
  item_id: string;
  quantity: number;
  price: number;
  discount?: number;
  tax_id?: string;
  description?: string;
}

export class CreateBillDto {
  issued_at: string;
  due_at: string;
  bill_no: string;
  vendor_id: string;
  currency: string;
  category_id?: string;
  tax_id?: string;

  billItems: CreateBillItemDto[];
}
