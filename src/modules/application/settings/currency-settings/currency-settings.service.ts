import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCurrencySettingDto } from './dto/create-currency-setting.dto';
import { UpdateCurrencySettingDto } from './dto/update-currency-setting.dto';
import { CurrencySettings } from '@prisma/client';
import getSymbolFromCurrency = require('currency-symbol-map');

@Injectable()
export class CurrencySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCurrencySettingDto, ownerId: string, workspaceId: string): Promise<CurrencySettings> {
    return this.prisma.currencySettings.create({
      data: {
        ...data,
        owner_id: ownerId,
        workspace_id: workspaceId,
      },
    });
  }

  async getByOwnerAndWorkspace(ownerId: string, workspaceId: string): Promise<CurrencySettings | null> {
    return this.prisma.currencySettings.findFirst({
      where: { owner_id: ownerId, workspace_id: workspaceId },
    });
  }

  async update(id: string, data: UpdateCurrencySettingDto, ownerId: string, workspaceId: string): Promise<CurrencySettings> {
    const existing = await this.prisma.currencySettings.findFirst({
      where: { id, owner_id: ownerId, workspace_id: workspaceId },
    });
    if (!existing) throw new Error('Currency settings not found or you do not have access to update them');
    return this.prisma.currencySettings.update({
      where: { id },
      data,
    });
  }


  //preview currency settings base on selected options..
  getPreview(settings: any, value: number = 10000) {
    function getDecimalPlaces(format: string) {
      switch (format) {
        case 'NO_DECIMAL': return 0;
        case 'ONE_DECIMAL': return 1;
        case 'TWO_DECIMAL': return 2;
        case 'THREE_DECIMAL': return 3;
        case 'FOUR_DECIMAL': return 4;
        default: return 2;
      }
    }
    function getSeparator(type: string) {
      return type === 'DOT' ? '.' : ',';
    }
    const decimalPlaces = getDecimalPlaces(settings.decimal_format);
    let [intPart, decPart] = value.toFixed(decimalPlaces).split('.');

    // Add thousands separator
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, getSeparator(settings.thousands_separator));

    // Join integer and decimal with decimal separator
    let formatted = intPart;
    if (decimalPlaces > 0) {
      formatted += getSeparator(settings.decimal_separator) + (decPart ?? '');
    }

    // Add currency symbol or name

     let symbol = settings.currency_symbol_and_name === 'WITH_SYMBOL'
      ? (getSymbolFromCurrency(settings.default_currency) || settings.default_currency)
      : settings.default_currency;
    let space = settings.currency_symbol_space === 'WITH_SPACE' ? ' ' : '';
    if (settings.currency_symbol_position === 'PRE') {
      formatted = symbol + space + formatted;
    } else {
      formatted = formatted + space + symbol;
    }

    return formatted;
  }
}