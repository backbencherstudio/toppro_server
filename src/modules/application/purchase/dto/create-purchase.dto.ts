import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { CreatePurchaseItemDto } from 'src/modules/application/purchase/dto/create-purchase-item.dto';

export class CreatePurchaseDto {
  @IsOptional() @IsString() vendorId?: string;
  @IsOptional() @IsString() accountTypeId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() purchaseNo?: string;

  @IsOptional() @IsDateString() purchaseDate?: string;

  @IsArray()
  items: CreatePurchaseItemDto[];
}
