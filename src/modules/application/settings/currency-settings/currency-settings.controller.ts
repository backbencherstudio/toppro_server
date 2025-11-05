import { Controller, Post, Body, Request, Res, UseGuards, Get, Patch, Param } from '@nestjs/common';
import { CurrencySettingsService } from './currency-settings.service';
import { CreateCurrencySettingDto } from './dto/create-currency-setting.dto';
import { UpdateCurrencySettingDto } from './dto/update-currency-setting.dto';
import { CurrencySettings } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

// @Controller('currency-settings')
// @UseGuards(JwtAuthGuard)
// export class CurrencySettingsController {
//   constructor(private readonly currencySettingsService: CurrencySettingsService) { }

//   @Post()
//   async create(@Request() req, @Body() dto: CreateCurrencySettingDto, @Res() res: Response): Promise<Response<CurrencySettings>> {
//     const { id: owner_id, workspace_id, type } = req.user;
//     if (type !== 'OWNER' ) return res.status(400).json({ success: false, message: 'Only owners can create currency settings.' });
//     if (!owner_id || !workspace_id) return res.status(400).json({ success: false, message: 'Owner ID and Workspace ID are required' });
//     try {
//       const result = await this.currencySettingsService.create(dto, owner_id, workspace_id);
//       return res.json(result);
//     } catch (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   @Get()
//   async get(@Request() req, @Res() res: Response): Promise<Response<CurrencySettings | null>> {
//     const { id: owner_id, workspace_id, type } = req.user;
//     if (type !== 'OWNER') return res.status(400).json({ success: false, message: 'Only owners can view currency settings.' });
//     if (!owner_id || !workspace_id) return res.status(400).json({ success: false, message: 'Owner ID and Workspace ID are required' });
//     try {
//       const settings = await this.currencySettingsService.getByOwnerAndWorkspace(owner_id, workspace_id);
//       if (!settings) return res.status(404).json({ success: false, message: 'Currency settings not found.' });
//       const preview = this.currencySettingsService.getPreview(settings);
//       return res.json({ ...settings, preview });
//     } catch (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   @Patch(':id')
//   async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateCurrencySettingDto, @Res() res: Response): Promise<Response<CurrencySettings>> {
//     const { id: owner_id, workspace_id, type } = req.user;
//     if (type !== 'OWNER') return res.status(400).json({ success: false, message: 'Only owners can update currency settings.' });
//     if (!owner_id || !workspace_id) return res.status(400).json({ success: false, message: 'Owner ID and Workspace ID are required' });
//     try {
//       const result = await this.currencySettingsService.update(id, dto, owner_id, workspace_id);
//       const preview = this.currencySettingsService.getPreview(result);
//       return res.json({ ...result, preview });
//     } catch (error) {
//       return res.status(500).json({ success: false, message: error.message });
//     }
//   }
// }
@Controller('currency-settings')
@UseGuards(JwtAuthGuard)
export class CurrencySettingsController {
  constructor(private readonly currencySettingsService: CurrencySettingsService) { }

  @Post()
  async create(@Request() req, @Body() dto: CreateCurrencySettingDto, @Res() res: Response): Promise<Response<CurrencySettings>> {
    const { id: owner_id, workspace_id, type } = req.user;
    
    // Check if the user is either OWNER or SUPERADMIN
    if (type !== 'OWNER' && type !== 'SUPERADMIN') {
      return res.status(400).json({ success: false, message: 'Only owners and superadmins can create currency settings.' });
    }

    // If the user is not a SUPERADMIN, check for owner_id and workspace_id
    if (type !== 'SUPERADMIN' && (!owner_id || !workspace_id)) {
      return res.status(400).json({ success: false, message: 'Owner ID and Workspace ID are required' });
    }

    try {
      const result = await this.currencySettingsService.create(dto, owner_id, workspace_id);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  @Get()
  async get(@Request() req, @Res() res: Response): Promise<Response<CurrencySettings | null>> {
    const { id: owner_id, workspace_id, type } = req.user;

    // Check if the user is either OWNER or SUPERADMIN
    if (type !== 'OWNER' && type !== 'SUPERADMIN') {
      return res.status(400).json({ success: false, message: 'Only owners and superadmins can view currency settings.' });
    }

    // If the user is not a SUPERADMIN, check for owner_id and workspace_id
    if (type !== 'SUPERADMIN' && (!owner_id || !workspace_id)) {
      return res.status(400).json({ success: false, message: 'Owner ID and Workspace ID are required' });
    }

    try {
      const settings = await this.currencySettingsService.getByOwnerAndWorkspace(owner_id, workspace_id);
      if (!settings) return res.status(404).json({ success: false, message: 'Currency settings not found.' });
      const preview = this.currencySettingsService.getPreview(settings);
      return res.json({ ...settings, preview });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateCurrencySettingDto, @Res() res: Response): Promise<Response<CurrencySettings>> {
    const { id: owner_id, workspace_id, type } = req.user;

    // Check if the user is either OWNER or SUPERADMIN
    if (type !== 'OWNER' && type !== 'SUPERADMIN') {
      return res.status(400).json({ success: false, message: 'Only owners and superadmins can update currency settings.' });
    }

    // If the user is not a SUPERADMIN, check for owner_id and workspace_id
    if (type !== 'SUPERADMIN' && (!owner_id || !workspace_id)) {
      return res.status(400).json({ success: false, message: 'Owner ID and Workspace ID are required' });
    }

    try {
      const result = await this.currencySettingsService.update(id, dto, owner_id, workspace_id);
      const preview = this.currencySettingsService.getPreview(result);
      return res.json({ ...result, preview });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
