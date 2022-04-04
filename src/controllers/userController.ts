import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { UserService } from '../services/userService';
import { RegisterDto } from '../validation/registerValidtion';
import { LoginDto } from '../validation/loginValidtion';
import { Response, Request } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { PasswordDto } from 'src/validation/passwordValidation';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  async loginUser(
    @Res() response: Response,
    @Req() request: Request,
    @RealIP() ip: string,
    @Body() loginDto: LoginDto,
  ) {
    const result = await this.userService.login(
      loginDto.email,
      loginDto.password,
      ip,
      request.headers['user-agent'],
    );

    return response.status(result.status).json(result);
  }
  @Post('register')
  async registerUser(
    @Res() response: Response,
    @Req() request: Request,
    @RealIP() ip: string,
    @Body() registerDto: RegisterDto,
  ) {
    const result = await this.userService.create(
      registerDto.fullName,
      registerDto.email,
      registerDto.password,
      registerDto.description,
      ip,
      request.headers['user-agent'],
    );
    return response.status(result.status).json(result);
  }
  @Post('change-password')
  async changePassword(
    @Res() response: Response,
    @Req() request: Request,
    @Body() passwordDto: PasswordDto,
  ) {
    const result = await this.userService.changePassword(
      passwordDto.oldPassword,
      passwordDto.password,
      request.currentUser!,
    );
    return response.status(result.status).json(result);
  }
  @Get()
  async getUserInfo(@Res() response: Response, @Req() request: Request) {
    const result = await this.userService.getUser(request.currentUser!);
    return response.status(result.status).json(result);
  }
  @Get('refresh')
  async getRefresh(@Res() response: Response, @Req() request: Request) {
    const result = await this.userService.refreshToken(request.currentUser!);
    return response.status(result.status).json(result);
  }

  @Post('logout')
  async logoutUser(@Res() response: Response, @Req() request: Request) {
    const { authorization, refresh } = request.headers;
    const result = await this.userService.logout(
      authorization,
      refresh as string,
    );
    return response.status(result.status).json(result);
  }
}
