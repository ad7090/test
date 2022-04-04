import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Please provide a password' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 character' })
  password: string;

  @IsNotEmpty({ message: 'Please provide a your full name' })
  @Length(3, 200, { message: 'Full name can not be less than 3' })
  fullName: string;

  @IsNotEmpty({ message: 'Please provide a description' })
  description: string;
}
