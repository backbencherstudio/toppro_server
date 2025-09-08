import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UpdatePurchaseItemDto } from 'src/modules/application/purchase/dto/update-purchase-item.dto';

export class UpdatePurchaseDto {
  @IsOptional() @IsString() account_type_id?: string | null;
  @IsOptional() @IsString() vendor_id?: string | null;
  @IsOptional() @IsString() billing_type_id?: string | null;
  @IsOptional() @IsString() category_id?: string | null;
  @IsOptional() @IsString() status?: string | null;

  @IsOptional() @IsDateString()
  purchase_date?: string | null;


  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseItemDto)
  items?: UpdatePurchaseItemDto[];


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  delete_line_ids?: string[];
}
