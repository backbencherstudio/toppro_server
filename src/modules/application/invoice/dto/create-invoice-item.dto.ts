export class CreateInvoiceItemDto {
  item_id: string;  // Item ID
  quantity: number;
  price: number;
  discount: number;
  item_type_id?: string;
  tax_id?: string;
  itemCategory_id?: string;
  unit_id?: string;
  name?: string;
  sku?: string;
  description?: string;
}
