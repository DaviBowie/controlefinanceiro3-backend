import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsString()
  @MaxLength(100)
  password: string;
}
