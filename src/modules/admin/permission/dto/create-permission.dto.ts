import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  title: string;  

  @IsString()
  @IsNotEmpty()
  action: string;  

  
  
  @IsString()
  @IsNotEmpty()
  subject: string;  
}
