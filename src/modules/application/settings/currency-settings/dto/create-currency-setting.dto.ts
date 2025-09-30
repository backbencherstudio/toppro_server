import { IsEnum, IsString, IsOptional } from 'class-validator';
import { DecimalFormat, SeparatorType, CurrencySymbolPosition, CurrencySymbolSpace, CurrencySymbolAndName } from '@prisma/client';

export class CreateCurrencySettingDto {
  @IsEnum(DecimalFormat)
  decimal_format: DecimalFormat;

  @IsEnum(SeparatorType)
  decimal_separator: SeparatorType;

  @IsEnum(SeparatorType)
  thousands_separator: SeparatorType;

  @IsEnum(SeparatorType)
  float_number: SeparatorType;

  @IsEnum(CurrencySymbolPosition)
  currency_symbol_position: CurrencySymbolPosition;

  @IsEnum(CurrencySymbolSpace)
  currency_symbol_space: CurrencySymbolSpace;

  @IsEnum(CurrencySymbolAndName)
  currency_symbol_and_name: CurrencySymbolAndName;

  @IsString()
  default_currency: string;
}