import { ApiProperty } from '@nestjs/swagger';
import { DecimalFormat, SeparatorType, CurrencySymbolPosition, CurrencySymbolSpace, CurrencySymbolAndName } from '@prisma/client';

export class CurrencySetting {
  @ApiProperty() id: string;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
  @ApiProperty({ required: false }) deleted_at?: Date;

  @ApiProperty({ enum: DecimalFormat }) decimal_format: DecimalFormat;
  @ApiProperty({ enum: SeparatorType }) decimal_separator: SeparatorType;
  @ApiProperty({ enum: SeparatorType }) thousands_separator: SeparatorType;
  @ApiProperty({ enum: SeparatorType }) float_number: SeparatorType;
  @ApiProperty({ enum: CurrencySymbolPosition }) currency_symbol_position: CurrencySymbolPosition;
  @ApiProperty({ enum: CurrencySymbolSpace }) currency_symbol_space: CurrencySymbolSpace;
  @ApiProperty({ enum: CurrencySymbolAndName }) currency_symbol_and_name: CurrencySymbolAndName;
  @ApiProperty() default_currency: string;

  @ApiProperty({ required: false }) owner_id?: string;
  @ApiProperty({ required: false }) workspace_id?: string;
}
