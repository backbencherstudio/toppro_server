import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator'; 

export class InvoiceResponseDto {
  @IsString() 
  id: string;  

  @IsString() 
  invoice_number: string;  

  @IsDate() 
  issueAt: Date;  

  @IsDate() 
  dueAt: Date;  

  @IsNumber() 
  subTotal: number;  

  @IsNumber() 
  totalDiscount: number;  

  @IsNumber() 
  totalTax: number;  

  @IsNumber() 
  totalPrice: number;  

  @IsString() 
  status: string;  

  @IsDate() 
  createdAt: Date;  

  @IsDate() 
  updatedAt: Date;  

  @Type(() => InvoiceItemResponseDto) 
  items: InvoiceItemResponseDto[];  

  _summary: {
    grand_total: number;  
    lines_count: number;  
  };
}




export class InvoiceItemResponseDto {
  @IsString() 
  id: string;  

  @IsString() 
  item_id: string;  

  @IsNumber() 
  quantity: number;  

  @IsNumber() 
  price: number;  

  @IsNumber() 
  discount: number;  

  @IsNumber() 
  total: number;  

  @IsString() 
  description: string;  

  @IsString() 
  name: string;  

  @IsString() 
  sku: string;  

  @IsNumber() 
  unit_price: number;  

  @IsNumber() 
  total_price: number;  
}
