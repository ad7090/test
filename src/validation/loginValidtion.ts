import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Please provide a password' })
  @Length(8, 20, { message: 'Password must be between 8 and 20 character' })
  password: string;
}
