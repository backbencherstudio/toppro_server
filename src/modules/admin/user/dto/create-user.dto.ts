import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;


  @IsOptional()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsOptional()
  @ApiProperty({
    description: 'The phone_number of the user',
    example: '823749823694783',
  })
  phone_number: string;

  @IsOptional()
  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  password: string;

  @IsOptional()
  @ApiProperty({
    description: 'The type of the user',
    example: 'user',
  })
  type?: string;
}
