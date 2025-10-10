import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import appConfig from '../../config/app.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // get user details
  @ApiOperation({ summary: 'Get user details' })
  // @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    try {
      const { email } = req.user;
      console.log('Authenticated user type:', req.user.type);

      const response = await this.authService.me(email);

      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch user details',
      };
    }
  }


  // auth.controller.ts
  @Post('register-owner')
  async createOwner(@Body() body) {
    return this.authService.createOwner(body);
  }

  // Removed duplicate admin-only owner creation endpoint to simplify flow

  // ==========================
  // USER REGISTER ENDPOINT
  // ==========================
  @ApiOperation({ summary: 'Register a new USER under owner workspace' })
  @Post('create/user')
  @UseGuards(JwtAuthGuard)
  async registerUser(
    @Body() data: CreateUserDto,
    @Req()
    req: Request & {
      user: {
        id: string;
        owner_id?: string;
        workspace_id?: string;
      };
    },
  ) {
    const { id, owner_id, workspace_id } = req.user;

    console.log('req.user', req.user);
    const {
      name,
      email,
      phone_number,
      address,
      password,
      roleId,
      status,
    } = data;

    if (!workspace_id) {
      throw new HttpException('Workspace ID missing', HttpStatus.BAD_REQUEST);
    }

    const result = await this.authService.registerUser({
      name,
      email,
      phone_number,
      address,
      password,
      owner_id: owner_id || id,
      workspace_id,
      roleId,
      status,
    });

    return result;
  }

  // login user
  @ApiOperation({ summary: 'Login user' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() body: { email: string; password: string; token?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // console.log(req.user);
      const { email, password, token } = body; // Retrieve token and password from the request body
      // const user_id = req.user.id;  // req.user contains the authenticated user's info

      const response = await this.authService.login({
        email,
        password,
        token,
        // user_id: user_id,
      });

      // If login failed (i.e., email not verified), return the response
      if (!response.success) {
        return res.status(401).json(response); // Return the error message to the user
      }
      // store to secure cookies
      // res.cookie('refresh_token', response.authorization.refresh_token, {
      //   httpOnly: true,
      //   secure: true,
      //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      // });

      res.json(response);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Body() body: { refresh_token: string },
  ) {
    try {
      const user_id = req.user.userId;

      const response = await this.authService.refreshToken(
        user_id,
        body.refresh_token,
      );

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    try {
      const userId = req.user.userId;
      const response = await this.authService.revokeRefreshToken(userId);
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleLoginRedirect(@Req() req: Request): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
      data: req.user,
    };
  }

  // update user
  @ApiOperation({ summary: 'Update user' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('update')
  @UseInterceptors(
    FileInterceptor('image', {
      // storage: diskStorage({
      //   destination:
      //     appConfig().storageUrl.rootUrl + appConfig().storageUrl.avatar,
      //   filename: (req, file, cb) => {
      //     const randomName = Array(32)
      //       .fill(null)
      //       .map(() => Math.round(Math.random() * 16).toString(16))
      //       .join('');
      //     return cb(null, `${randomName}${file.originalname}`);
      //   },
      // }),
      storage: memoryStorage(),
    }),
  )
  async updateUser(
    @Req() req: Request,
    @Body() data: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    try {
      const user_id = req.user.userId;
      const response = await this.authService.updateUser(user_id, data, image);
      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update user',
      };
    }
  }

  // --------------change password---------

  @ApiOperation({ summary: 'Forgot password' })
  @Post('forgot-password')
  async forgotPassword(@Body() data: { email: string }) {
    try {
      const email = data.email;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.forgotPassword(email);
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  // verify email to verify the email (POST - for API calls)
  @ApiOperation({ summary: 'Verify email (GET link from email)' })
  @Get('verify-email')
  async verifyEmailGet(@Req() req: Request, @Res() res: Response) {
    try {
      const email = (req.query.email as string) || '';
      const token = (req.query.token as string) || '';
      if (!email || !token) {
        return res.status(HttpStatus.BAD_REQUEST).send('Email and token are required');
      }
      const result = await this.authService.verifyEmail({ email, token });
      if (result.success) {
        return res.status(HttpStatus.OK).send('Registration successfully');
      }
      return res.status(HttpStatus.BAD_REQUEST).send(result.message || 'Invalid or expired token');
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send('Failed to verify email');
    }
  }

  @ApiOperation({ summary: 'Verify email (POST for API clients)' })
  @Post('email-verify')
  async verifyEmailPost(
    @Body() body: { email?: string; token?: string },
    @Res() res: Response,
  ) {
    try {
      const email = body.email || '';
      const token = body.token || '';
      if (!email || !token) {
        return res.status(HttpStatus.BAD_REQUEST).send('Email and token are required');
      }
      const result = await this.authService.verifyEmail({ email, token });
      if (result.success) {
        return res.status(HttpStatus.OK).send('Registration successfully');
      }
      return res.status(HttpStatus.BAD_REQUEST).send(result.message || 'Invalid or expired token');
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send('Failed to verify email');
    }
  }



  // resend verification removed per simplified flow

  // reset password if user forget the password
  @ApiOperation({ summary: 'Reset password' })
  @Post('reset-password')
  async resetPassword(
    @Body() data: { email: string; token: string; password: string },
  ) {
    try {
      const email = data.email;
      const token = data.token;
      const password = data.password;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      if (!token) {
        throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
      }
      if (!password) {
        throw new HttpException(
          'Password not provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.authService.resetPassword({
        email: email,
        token: token,
        password: password,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  // change password if user want to change the password
  @ApiOperation({ summary: 'Change password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() data: { email: string; old_password: string; new_password: string },
  ) {
    try {
      // const email = data.email;
      const user_id = req.user.userId;

      const oldPassword = data.old_password;
      const newPassword = data.new_password;
      // if (!email) {
      //   throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      // }
      if (!oldPassword) {
        throw new HttpException(
          'Old password not provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (!newPassword) {
        throw new HttpException(
          'New password not provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.authService.changePassword({
        // email: email,
        user_id: user_id,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }

  // --------------end change password---------

  // -------change email address------
  @ApiOperation({ summary: 'request email change' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('request-email-change')
  async requestEmailChange(
    @Req() req: Request,
    @Body() data: { email: string },
  ) {
    try {
      const user_id = req.user.userId;
      const email = data.email;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.requestEmailChange(user_id, email);
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  // change email address with token
  @ApiOperation({ summary: 'Change email address' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-email')
  async changeEmail(
    @Req() req: Request,
    @Body() data: { email: string; token: string },
  ) {
    try {
      const user_id = req.user.userId;
      const email = data.email;

      const token = data.token;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      if (!token) {
        throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.changeEmail({
        user_id: user_id,
        new_email: email,
        token: token,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  // change email address without token
  @ApiOperation({ summary: 'Change email address without token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('changeEmail')
  async changeEmailWithoutToken(
    @Req() req: Request,
    @Body() data: { old_email: string; password: string; new_email: string },
  ) {
    try {
      const user_id = req.user.userId; // Extract user ID from JWT token
      const { old_email, password, new_email } = data;

      if (!old_email || !password || !new_email) {
        throw new HttpException(
          'Missing required fields',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.authService.changeEmailWithoutToken({
        user_id,
        old_email,
        password,
        new_email,
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Something went wrong',
      };
    }
  }

  // -------end change email address------

  // --------- 2FA ---------
  @ApiOperation({ summary: 'Generate 2FA secret' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate-2fa-secret')
  async generate2FASecret(@Req() req: Request) {
    try {
      const user_id = req.user.userId;
      return await this.authService.generate2FASecret(user_id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Verify 2FA' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa')
  async verify2FA(@Req() req: Request, @Body() data: { token: string }) {
    try {
      const user_id = req.user.userId;
      const token = data.token;
      return await this.authService.verify2FA(user_id, token);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Enable 2FA' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('enable-2fa')
  async enable2FA(@Req() req: Request) {
    try {
      const user_id = req.user.userId;
      return await this.authService.enable2FA(user_id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('disable-2fa')
  async disable2FA(@Req() req: Request) {
    try {
      const user_id = req.user.userId;
      return await this.authService.disable2FA(user_id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
  // --------- end 2FA ---------
}
