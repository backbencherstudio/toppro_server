// external imports
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

//internal imports
import { UserType, Workspace } from '@prisma/client';
import { DateHelper } from '../../common/helper/date.helper';
import { SojebStorage } from '../../common/lib/Disk/SojebStorage';
import { UcodeRepository } from '../../common/repository/ucode/ucode.repository';
import { UserRepository } from '../../common/repository/user/user.repository';
import appConfig from '../../config/app.config';
import { MailService } from '../../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async me(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          address: true,
          phone_number: true,
          type: true,
          gender: true,
          date_of_birth: true,
          created_at: true,
          owner_id: true,
          workspace_id: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.avatar) {
        user['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + user.avatar,
        );
      }

      if (user) {
        return {
          success: true,
          data: user,
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // update user workspace_id
  async updateUserWorkspace(userId: string, workspace_id: string) {
    try {
      // Update the user's workspace_id field in the database
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { workspace_id },
      });

      return updatedUser;
    } catch (error) {
      throw new Error('Error updating user workspace: ' + error.message);
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    try {
      const data: any = {};
      if (updateUserDto.name) {
        data.name = updateUserDto.name;
      }
      if (updateUserDto.phone_number) {
        data.phone_number = updateUserDto.phone_number;
      }
      if (updateUserDto.country) {
        data.country = updateUserDto.country;
      }
      if (updateUserDto.state) {
        data.state = updateUserDto.state;
      }
      if (updateUserDto.local_government) {
        data.local_government = updateUserDto.local_government;
      }
      if (updateUserDto.city) {
        data.city = updateUserDto.city;
      }
      if (updateUserDto.zip_code) {
        data.zip_code = updateUserDto.zip_code;
      }
      if (updateUserDto.address) {
        data.address = updateUserDto.address;
      }
      if (updateUserDto.gender) {
        data.gender = updateUserDto.gender;
      }
      if (updateUserDto.date_of_birth) {
        data.date_of_birth = DateHelper.format(updateUserDto.date_of_birth);
      }
      if (image) {
        // delete old image from storage
        const oldImage = await this.prisma.user.findFirst({
          where: { id: userId },
          select: { avatar: true },
        });
        if (oldImage.avatar) {
          await SojebStorage.delete(
            appConfig().storageUrl.avatar + oldImage.avatar,
          );
        }
        data.avatar = image.filename;
      }
      const user = await UserRepository.getUserDetails(userId);
      if (user) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            ...data,
          },
        });

        return {
          success: true,
          message: 'User updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async validateUser(
    email: string,
    pass: string,
    token?: string,
  ): Promise<any> {
    const _password = pass;
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      const _isValidPassword = await UserRepository.validatePassword({
        email: email,
        password: _password,
      });
      if (_isValidPassword) {
        const { password, ...result } = user;
        if (user.is_two_factor_enabled) {
          if (token) {
            const isValid = await UserRepository.verify2FA(user.id, token);
            if (!isValid) {
              throw new UnauthorizedException('Invalid token');
              // return {
              //   success: false,
              //   message: 'Invalid token',
              // };
            }
          } else {
            throw new UnauthorizedException('Token is required');
            // return {
            //   success: false,
            //   message: 'Token is required',
            // };
          }
        }
        return result;
      } else {
        throw new UnauthorizedException('Password not matched');
        // return {
        //   success: false,
        //   message: 'Password not matched',
        // };
      }
    } else {
      throw new UnauthorizedException('Email not found');
      // return {
      //   success: false,
      //   message: 'Email not found',
      // };
    }
  }

  async login({ email, password, token }) {
    try {
      // Step 1: Check if there's a pending registration for this email
      const pendingRegistration = await this.prisma.ucode.findFirst({
        where: {
          email,
          expired_at: { gte: new Date() },
          metadata: { not: null },
        },
      });

      if (pendingRegistration) {
        return {
          success: false,
          message: 'Please verify your email to complete registration. Check your inbox for the verification link.',
        };
      }

      // Step 2: Fetch user from the database using the email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { success: false, message: 'User not found. Please register first.' };
      }

      // Step 3: Validate password first
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { success: false, message: 'Invalid password' };
      }

      // Step 4: Check if email is verified for OWNER users
      if (user.type === 'OWNER' && !user.email_verified_at) {
        return {
          success: false,
          message: 'Please verify your email before logging in. Check your inbox for the verification link.'
        };
      }

      // Step 5: Check account status
      if (user.status === 0) {
        if (user.type === 'OWNER') {
          return {
            success: false,
            message: 'Your account is pending verification. Please check your email.',
          };
        } else if (user.type === 'USER') {
          return {
            success: false,
            message: 'Your account is pending approval by the owner.',
          };
        }
      }

      // Step 6: Generate JWT tokens (access and refresh tokens)
      const payload = {
        email: user.email,
        id: user.id,
        owner_id: user.owner_id,
        workspace_id: user.workspace_id,
        type: user.type,
      };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '30d' });
      // const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        success: true,
        message: 'Logged in successfully',
        authorization: {
          type: 'bearer',
          access_token: accessToken,
          // refresh_token: refreshToken,
        },
        type: user.type,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Method to create a Workspace for the Owner
  async createWorkspace({
    ownerName,
    owner_id,
    super_id,
    workspace_name,
  }: {
    ownerName: string;
    owner_id: string;
    super_id: string;
    workspace_name?: string;
  }): Promise<Workspace> {
    try {
      // Ensure ownerId and super_id are provided
      if (!owner_id || !super_id) {
        throw new Error('Owner ID and Super ID must be provided.');
      }

      // Log for debugging
      // console.log('Creating workspace for owner:', {
      //   ownerName,
      //   owner_id,
      //   super_id,
      //   workspace_name,
      // });

      // Create the workspace for the OWNER
      const workspace = await this.prisma.workspace.create({
        data: {
          name: workspace_name, // Dynamic workspace name based on the owner's name
          description: `Workspace created for ${ownerName}`, // Dynamic description based on the owner's name
          owner_id: owner_id,
          super_id: super_id,
          code: this.generateWorkspaceCode(),
        },
      });

      // console.log('Workspace created successfully:', workspace);

      return workspace;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw new Error('Failed to create workspace: ' + error.message);
    }
  }

  // Method to generate a workspace code (if needed)
  private generateWorkspaceCode(): string {
    return `WS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // refresh token
  async refreshToken(user_id: string, refreshToken: string) {
    try {
      // const storedToken = await this.redis.get(`refresh_token:${user_id}`);

      // if (!storedToken || storedToken != refreshToken) {
      //   return {
      //     success: false,
      //     message: 'Refresh token is required',
      //   };
      // }

      if (!user_id) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const userDetails = await UserRepository.getUserDetails(user_id);
      if (!userDetails) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const payload = { email: userDetails.email, id: userDetails.id };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

      return {
        success: true,
        authorization: {
          type: 'bearer',
          access_token: accessToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // revoke refresh token
  async revokeRefreshToken(user_id: string) {
    try {
      // const storedToken = await this.redis.get(`refresh_token:${user_id}`);
      // if (!storedToken) {
      //   return {
      //     success: false,
      //     message: 'Refresh token not found',
      //   };
      // }

      // await this.redis.del(`refresh_token:${user_id}`);

      return {
        success: true,
        message: 'Refresh token revoked successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // auth.service.ts
  async createOwner(dto: any) {
    try {
      const { email, password, name, workspace_name } = dto;

      // 1️⃣ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const superAdmin = await this.prisma.user.findFirst({
        where: { type: 'SUPERADMIN' },
        orderBy: { created_at: 'asc' },
      });

      if (!superAdmin) {
        throw new Error('No SUPERADMIN found. Please create one first.');
      }

<<<<<<< HEAD
      // 3️⃣ Check if email already exists
=======
      // 2️⃣ Check if email already exists
>>>>>>> eef32f918a8bb859478cf2b4f69fbd8cc3b1766f
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new Error('Email already exists.');
      }

<<<<<<< HEAD
      // 4️⃣ Create OWNER user first
      const owner = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          type: 'OWNER',
          super_id: superAdmin.id,
          status: 1,
        },
      });

      // 5️⃣ Create workspace for this owner
      const workspace = await this.createWorkspace({
        ownerName: name,
        owner_id: owner.id,
        super_id: superAdmin.id,
        workspace_name: workspace_name || `${name}'s Workspace`,
      });

      // 6️⃣ Update owner with workspace_id
      await this.prisma.user.update({
        where: { id: owner.id },
        data: { workspace_id: workspace.id },
      });

      // 7️⃣ Return response
      return {
        success: true,
        message: 'Owner and workspace created successfully',
        data: {
          owner,
          workspace,
        },
=======
      // 3️⃣ Check if there's already a pending registration
      const pendingReg = await this.prisma.ucode.findFirst({
        where: {
          email,
          expired_at: { gte: new Date() },
        },
      });

      if (pendingReg) {
        // Delete old pending registration and allow re-registration
        console.log('🔄 Deleting old pending registration to allow new one...');
        await this.prisma.ucode.delete({
          where: { id: pendingReg.id },
        });
        console.log('✅ Old registration deleted. Proceeding with new registration...');
      }

      // 4️⃣ Store registration data temporarily (DON'T create user yet!)
      const registrationData = {
        name,
        email,
        password: hashedPassword,
        type: 'OWNER',
        super_id: superAdmin.id,
        workspace_name: workspace_name || `${name}'s Workspace`,
      };

      // 5️⃣ Create pending registration with token
      const pendingRegistration = await UcodeRepository.createPendingRegistration({
        email,
        registrationData,
      });

      if (!pendingRegistration) {
        throw new Error('Failed to create pending registration');
      }

      // 6️⃣ Send verification email
      await this.mailService.sendVerificationLink({
        email,
        name,
        token: pendingRegistration.token,
      });

      // 7️⃣ Return response
      return {
        success: true,
        message: 'Registration submitted! Please check your email to verify your account and complete registration.',
>>>>>>> eef32f918a8bb859478cf2b4f69fbd8cc3b1766f
      };
    } catch (error) {
      throw new Error('Error creating owner: ' + error.message);
    }
  }
<<<<<<< HEAD
=======

>>>>>>> eef32f918a8bb859478cf2b4f69fbd8cc3b1766f

  // async register({
  //   name,
  //   first_name,
  //   last_name,
  //   email,
  //   phone_number,
  //   address,
  //   password,
  //   type,
  //   status,
  //   owner_id,
  //   super_id,
  //   workspace_id,
  //   roleId,
  // }: {
  //   name: string;
  //   first_name: string;
  //   last_name: string;
  //   email: string;
  //   phone_number: string;
  //   address: string;
  //   password: string;
  //   type: string;
  //   status?: number;
  //   owner_id?: string;
  //   super_id?: string;
  //   workspace_id?: string;
  //   roleId?: string;
  // }): Promise<any> {
  //   console.log(
  //     'register service',
  //     type,
  //     owner_id,
  //     super_id,
  //     workspace_id,
  //     name,
  //   );
  //   try {
  //     // Check if email already exists
  //     const existingUser = await this.prisma.user.findUnique({
  //       where: { email },
  //     });

  //     if (existingUser) {
  //       return { success: false, message: 'Email already exists' };
  //     }

  //     // Hash the password before saving
  //     const hashedPassword = await bcrypt.hash(password, 10);

  //     // Create the User with appropriate fields based on the type
  //     const user = await this.prisma.user.create({
  //       data: {
  //         name,
  //         first_name,
  //         last_name,
  //         email,
  //         phone_number,
  //         address,
  //         password: hashedPassword,
  //         status,
  //         type: UserType[type.toUpperCase() as keyof typeof UserType],

  //         ...(type === 'OWNER' && {
  //           super_id: super_id,
  //           // workspace_id: workspace_id, // later assign
  //         }),

  //         ...(type === 'USER' && {
  //           owner_id: owner_id,
  //           // super_id: super_id,
  //           workspace_id: workspace_id,
  //           ...(roleId && {
  //             roles: {
  //               connect: { id: roleId },
  //             },
  //           }),
  //         }),
  //       },
  //     });

  //     // If the user is of type 'OWNER', send a verification email
  //     if (type === 'OWNER') {
  //       // Generate a verification token for email
  //       const token = await UcodeRepository.createVerificationToken({
  //         userId: user.id,
  //         email: user.email,
  //       });

  //       // Send the verification email with the token
  //       await this.mailService.sendVerificationLink({
  //         email: user.email,
  //         name: user.name,
  //         token: token.token,
  //         type: type,
  //       });
  //     }

  //     return {
  //       success: true,
  //       message: 'User registered successfully',
  //       data: user,
  //     };
  //   } catch (error) {
  //     throw new Error('Error registering user: ' + error.message);
  //   }
  // }

  // ==========================
  // REGISTER OWNER
  // ==========================
  async registerOwner({
    name,
    email,
    phone_number,
    address,
    password,
    super_id,
    workspace_name,
    roleId,
  }: {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    password: string;
    super_id: string;
    workspace_name?: string;
    roleId?: string;
  }): Promise<any> {
    try {
      // Check if email exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return { success: false, message: 'Email already exists' };
      }

      // Check if there's already a pending registration for this email
      const pendingReg = await this.prisma.ucode.findFirst({
        where: {
          email,
          expired_at: { gte: new Date() },
        },
      });

      if (pendingReg) {
        // Option 1: Block duplicate registration (commented out)
        // return {
        //   success: false,
        //   message: 'A verification email has already been sent. Please check your inbox or use the resend verification endpoint.',
        // };

        // Option 2: Delete old pending registration and allow re-registration
        console.log('🔄 Deleting old pending registration to allow new one...');
        await this.prisma.ucode.delete({
          where: { id: pendingReg.id },
        });
        console.log('✅ Old registration deleted. Proceeding with new registration...');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Store registration data temporarily (DON'T create user yet!)
      const registrationData = {
        name,
        email,
        phone_number,
        address,
        password: hashedPassword,
        type: 'OWNER',
        super_id,
        workspace_name: workspace_name || `${name}'s Workspace`,
        roleId,
      };

      // Create pending registration with token
      const pendingRegistration = await UcodeRepository.createPendingRegistration({
        email,
        registrationData,
      });

      if (!pendingRegistration) {
        throw new Error('Failed to create pending registration');
      }

      // Send verification email
      await this.mailService.sendVerificationLink({
        email,
        name,
        token: pendingRegistration.token,
      });

      return {
        success: true,
        message: 'Registration submitted! Please check your email to verify your account and complete registration.',
      };
    } catch (error) {
      throw new Error('Error registering owner: ' + error.message);
    }
  }

  // ==========================
  // REGISTER USER
  // ==========================
  async registerUser({
    name,
    email,
    phone_number,
    address,
    password,
    owner_id,
    workspace_id,
    roleId,
    status,
  }: {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    password?: string; // 👈 optional
    owner_id: string;
    workspace_id: string;
    roleId?: string;
    status?: number;
  }): Promise<any> {
    try {
      // ✅ Check workspace validity
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspace_id },
      });
      if (!workspace) {
        return {
          success: false,
          message: 'Invalid workspace_id: Workspace not found',
        };
      }

      // ✅ Check email duplication
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return { success: false, message: 'Email already exists' };
      }

      // ✅ Password hashing only if provided
      let hashedPassword: string | null = null;
      if (password && password.trim() !== '') {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // ✅ Create user
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          phone_number,
          address,
          password: hashedPassword, // can be null
          type: UserType.USER,
          status: status ?? 1,
          owner_id,
          workspace_id,
          ...(roleId && { roles: { connect: { id: roleId } } }),
        },
      });

      return {
        success: true,
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error registering user: ' + error.message,
      };
    }
  }

  async forgotPassword(email) {
    try {
      const user = await UserRepository.exist({
        field: 'email',
        value: email,
      });

      if (user) {
        const token = await UcodeRepository.createToken({
          userId: user.id,
          isOtp: true,
        });

        await this.mailService.sendOtpCodeToEmail({
          email: email,
          name: user.name,
          otp: token,
        });

        return {
          success: true,
          message: 'We have sent an OTP code to your email',
        };
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async resetPassword({ email, token, password }) {
    try {
      const user = await UserRepository.exist({
        field: 'email',
        value: email,
      });

      if (user) {
        const existToken = await UcodeRepository.validateToken({
          email: email,
          token: token,
        });

        if (existToken) {
          await UserRepository.changePassword({
            email: email,
            password: password,
          });

          // delete otp code
          await UcodeRepository.deleteToken({
            email: email,
            token: token,
            userId: user.id,
          });

          return {
            success: true,
            message: 'Password updated successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid token',
          };
        }
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async verifyEmail({ email, token }) {
    try {
      console.log('🔍 Verifying email:', email);
      console.log('🔍 Token:', token);

      // Only allow OWNER verification via pending registration metadata
      const pendingRegistration = await UcodeRepository.getPendingRegistration({
        email,
        token,
      });

      console.log('🔍 Pending registration found:', !!pendingRegistration);
      console.log('🔍 Has metadata:', !!pendingRegistration?.metadata);

      if (pendingRegistration && pendingRegistration.metadata) {
        // New flow: Create user from pending registration
        const registrationData: any = pendingRegistration.metadata;

        // Enforce OWNER-only verification
        if ((registrationData.type || 'OWNER') !== 'OWNER') {
          return {
            success: false,
            message: 'Email verification is only required for owner registration',
          };
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return {
            success: false,
            message: 'User already exists',
          };
        }

        // Create OWNER user with status 1 (active by default!)
        console.log('✅ Creating user from registration data...');
        const owner = await this.prisma.user.create({
          data: {
            name: registrationData.name,
            email: registrationData.email,
            phone_number: registrationData.phone_number,
            address: registrationData.address,
            password: registrationData.password, // Already hashed
            type: UserType.OWNER,
            status: 1, // 👈 Active from the start!
            super_id: registrationData.super_id,
            email_verified_at: new Date(), // Mark as verified
            ...(registrationData.roleId && {
              roles: {
                connect: { id: registrationData.roleId },
              },
            }),
          },
        });
        console.log('✅ User created:', owner.id);

        // Create workspace for owner
        console.log('✅ Creating workspace...');
        const workspace = await this.createWorkspace({
          ownerName: registrationData.name,
          owner_id: owner.id,
          super_id: registrationData.super_id,
          workspace_name: registrationData.workspace_name,
        });
        console.log('✅ Workspace created:', workspace.id);

        // Update owner with workspace_id
        console.log('✅ Linking user to workspace...');
        await this.updateUserWorkspace(owner.id, workspace.id);
        console.log('✅ User linked to workspace');

        // Delete the pending registration token
        console.log('✅ Deleting pending registration token...');
        await this.prisma.ucode.delete({
          where: { id: pendingRegistration.id },
        });
        console.log('✅ Token deleted');

        console.log('🎉 Email verification completed successfully!');
        return {
          success: true,
          message: 'Email verified successfully! Your account has been created and is now active. You can login now.',
          data: { owner, workspace },
        };
      }

      // No pending registration found => invalid for owner-only flow
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    } catch (error) {
      console.error('❌ Verification error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // resendVerificationEmail removed per simplified flow

  async changePassword({ user_id, oldPassword, newPassword }) {
    try {
      const user = await UserRepository.getUserDetails(user_id);

      if (user) {
        const _isValidPassword = await UserRepository.validatePassword({
          email: user.email,
          password: oldPassword,
        });
        if (_isValidPassword) {
          await UserRepository.changePassword({
            email: user.email,
            password: newPassword,
          });

          return {
            success: true,
            message: 'Password updated successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid password',
          };
        }
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async requestEmailChange(user_id: string, email: string) {
    try {
      const user = await UserRepository.getUserDetails(user_id);
      if (user) {
        const token = await UcodeRepository.createToken({
          userId: user.id,
          isOtp: true,
          email: email,
        });

        await this.mailService.sendOtpCodeToEmail({
          email: email,
          name: email,
          otp: token,
        });

        return {
          success: true,
          message: 'We have sent an OTP code to your email',
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async changeEmail({
    user_id,
    new_email,
    token,
  }: {
    user_id: string;
    new_email: string;
    token: string;
  }) {
    try {
      const user = await UserRepository.getUserDetails(user_id);

      if (user) {
        const existToken = await UcodeRepository.validateToken({
          email: new_email,
          token: token,
          forEmailChange: true,
        });

        if (existToken) {
          await UserRepository.changeEmail({
            user_id: user.id,
            new_email: new_email,
          });

          // delete otp code
          await UcodeRepository.deleteToken({
            email: new_email,
            token: token,
            userId: user.id,
          });

          return {
            success: true,
            message: 'Email updated successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid token',
          };
        }
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // change email without token
  async changeEmailWithoutToken({
    user_id,
    old_email,
    password,
    new_email,
  }: {
    user_id: string;
    old_email: string;
    password: string;
    new_email: string;
  }) {
    try {
      // Step 1: Fetch the user by user_id
      const user = await UserRepository.getUserDetails(user_id);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Step 2: Verify that the provided old email matches the one in the database
      if (user.email !== old_email) {
        return {
          success: false,
          message: 'Current email does not match',
        };
      }

      // Step 3: Validate the provided password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Incorrect password',
        };
      }

      // Step 4: Check if the new email is already in use by another user
      const existingUser = await UserRepository.exist({
        field: 'email',
        value: new_email,
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Email is already in use',
        };
      }

      // Step 5: Update the email in the database
      const updatedUser = await UserRepository.updateUser(user_id, {
        email: new_email,
      });
      // console.log("updatedUser",updatedUser);

      if (!updatedUser) {
        return {
          success: false,
          message: 'Failed to update email',
        };
      }

      // Step 6: Return success response
      return {
        success: true,
        message: 'Email updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while updating the email',
      };
    }
  }

  // --------- 2FA ---------
  async generate2FASecret(user_id: string) {
    try {
      return await UserRepository.generate2FASecret(user_id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async verify2FA(user_id: string, token: string) {
    try {
      const isValid = await UserRepository.verify2FA(user_id, token);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid token',
        };
      }
      return {
        success: true,
        message: '2FA verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async enable2FA(user_id: string) {
    try {
      const user = await UserRepository.getUserDetails(user_id);
      if (user) {
        await UserRepository.enable2FA(user_id);
        return {
          success: true,
          message: '2FA enabled successfully',
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async disable2FA(user_id: string) {
    try {
      const user = await UserRepository.getUserDetails(user_id);
      if (user) {
        await UserRepository.disable2FA(user_id);
        return {
          success: true,
          message: '2FA disabled successfully',
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
  // --------- end 2FA ---------
}
