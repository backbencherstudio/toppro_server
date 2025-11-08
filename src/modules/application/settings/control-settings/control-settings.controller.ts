// import {
//   Controller,
//   Get,
//   Patch,
//   Body,
//   UseGuards,
//   Request,
// } from '@nestjs/common';

// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { ControllerSettingsService } from './control-settings.service';
// import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';


// @Controller('controller-settings')
// @UseGuards(JwtAuthGuard)
// export class ControllerSettingsController {
//   constructor(private readonly controllerSettingsService: ControllerSettingsService) { }

//   // ✅ Get current user's brand/system settings
//   @Get('me')
//   async getMySettings(@Request() req) {
//     return this.controllerSettingsService.getMySettings(req.user);
//   }

//   // ✅ Update current user's settings
//   @Patch('me')
//   async updateMySettings(@Body() dto: UpdateControllerSettingDto, @Request() req) {
//     return this.controllerSettingsService.updateMySettings(dto, req.user);
//   }
// }


import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ControllerSettingsService } from './control-settings.service';
import { UpdateControllerSettingDto } from './dto/update-control-setting.dto';
import { UploadService } from './upload.service';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Controller('controller-settings')
@UseGuards(JwtAuthGuard)
export class ControllerSettingsController {
  private readonly logger = new Logger(ControllerSettingsController.name);

  constructor(
    private readonly controllerSettingsService: ControllerSettingsService,
    private readonly uploadService: UploadService,
  ) { }

  @Get('me')
  async getMySettings(@Request() req) {
    this.logger.log(`Fetching settings for user ${req.user.id} (${req.user.type})`);
    return this.controllerSettingsService.getMySettings(req.user);
  }

  @Patch('me')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo_dark', maxCount: 1 },
        { name: 'logo_light', maxCount: 1 },
        { name: 'logo_favicon', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
      },
    ),
  )
  async updateMySettings(
    @UploadedFiles()
    files: {
      logo_dark?: Express.Multer.File[];
      logo_light?: Express.Multer.File[];
      logo_favicon?: Express.Multer.File[];
    },
    @Request() req,
  ) {
    const user = req.user;
    this.logger.log(`Updating settings for user ${user.id} (${user.type})`);

    // Extract non-file fields from request body
    const body = req.body;
    this.logger.debug('Request body:', body);

    // Transform and validate the DTO
    const dtoToSave = plainToClass(UpdateControllerSettingDto, {
      title_text: body.title_text,
      footer_text: body.footer_text,
      customer_prefix: body.customer_prefix,
      vendor_prefix: body.vendor_prefix,
    });

    const errors = await validate(dtoToSave);
    if (errors.length > 0) {
      this.logger.error('Validation errors:', errors);
      throw new BadRequestException(errors);
    }

    // Helper to upload single file and return path
    const uploadSingle = async (file: Express.Multer.File | undefined, fieldName: string) => {
      if (!file) return null;
      try {
        this.logger.debug(`Uploading ${fieldName} file: ${file.originalname}`);
        const fileArr = [file];
        const fakeTicketId = `controller-settings-${user.id}-${Date.now()}`;
        const uploaded = await this.uploadService.uploadFilesToDescription(
          fakeTicketId,
          user.id,
          '', // workspaceId (not used)
          user.id,
          fileArr,
        );
        if (!uploaded || uploaded.length === 0) return null;
        const filePath = uploaded[0].file_url;
        this.logger.debug(`${fieldName} uploaded to: ${filePath}`);
        return filePath;
      } catch (error) {
        this.logger.error(`Error uploading ${fieldName}:`, error);
        return null;
      }
    };

    // Process file uploads
    if (files?.logo_dark && files.logo_dark.length > 0) {
      const path = await uploadSingle(files.logo_dark[0], 'logo_dark');
      if (path) dtoToSave.logo_dark = path;
    }

    if (files?.logo_light && files.logo_light.length > 0) {
      const path = await uploadSingle(files.logo_light[0], 'logo_light');
      if (path) dtoToSave.logo_light = path;
    }

    if (files?.logo_favicon && files.logo_favicon.length > 0) {
      const path = await uploadSingle(files.logo_favicon[0], 'logo_favicon');
      if (path) dtoToSave.logo_favicon = path;
    }

    this.logger.debug('Final DTO to save:', dtoToSave);

    // Call service to update/create
    return this.controllerSettingsService.updateMySettings(dtoToSave, user);
  }
}