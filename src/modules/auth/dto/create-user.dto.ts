import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  @ApiProperty()
  name?: string;



  @IsNotEmpty()
  @ApiProperty()
  first_name?: string;

  @IsNotEmpty()
  @ApiProperty()
  last_name?: string;

  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsNotEmpty()
  @ApiProperty()
  email?: string;

  @ApiProperty()
  workspace_id?: string;

  @ApiProperty()
  owner_id?: string;

  @ApiProperty()
  super_id?: string;

  @IsNotEmpty()
  @ApiProperty()
  phone_number?: string;

  @IsOptional()
  @ApiProperty()
  roleId?: string;
  

  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be minimum 8' })
  @ApiProperty()
  password: string;

  @ApiProperty({
    type: String,
    example: 'USER',
  })

  type?: string;

  @IsOptional() // Optional for cases where status needs to be set manually
  @ApiProperty()
  status?: number;

  @IsOptional() // New property for workspace name, only for the OWNER type
  @ApiProperty()
  workspace_name?: string;
}
