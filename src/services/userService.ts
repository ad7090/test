import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel, UserDoc } from '../models/User';
import { verify, hash } from 'argon2';

import { Model } from 'mongoose';
import {
  generateAccessToken,
  generateRefreshToken,
  removeToken,
} from '../utils/generateToken';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDoc, UserModel>,
  ) {}
  async create(
    fullName: string,
    email: string,
    password: string,
    description: string,
    ip?: string,
    device?: string,
  ) {
    // check if user exist

    const user = await this.userModel.findOne({ email });
    if (user) {
      return {
        status: 400,
        success: false,
        message: 'User already exist',
      };
    }

    const newUser = await this.userModel.create({
      email,
      fullName,
      password,
      description,
      ip,
      device,
    });

    // generate token
    const token = await generateAccessToken(newUser.id);
    const refreshToken = await generateRefreshToken(user.id);

    // update user
    await this.userModel.findByIdAndUpdate(newUser.id, {
      $set: {
        accessToken: token.accessToken,
        refreshToken: refreshToken.refreshToken,
      },
    });

    return {
      status: 201,
      success: true,
      message: 'User Register successfully',
      accessToken: token.accessToken,
      refreshToken: refreshToken.refreshToken,
    };
  }

  async login(email: string, password: string, ip?: string, device?: string) {
    // check if user exist

    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      return {
        status: 400,
        success: false,
        message: 'Email or password is wrong!',
      };
    }

    // check password
    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      return {
        status: 400,
        success: false,
        message: 'Email or password is wrong!',
      };
    }

    // generate token
    const token = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    // update user
    await this.userModel.findByIdAndUpdate(user.id, {
      $set: {
        ip,
        device,
        accessToken: token.accessToken,
        refreshToken: refreshToken.refreshToken,
      },
    });

    return {
      status: 200,
      success: true,
      message: 'User login successfully',
      accessToken: token.accessToken,
      refreshToken: refreshToken.refreshToken,
    };
  }

  async changePassword(oldPassword: string, password: string, id: string) {
    // check if user exist

    const user = await this.userModel.findById(id).select('+password');

    if (!user) {
      return {
        status: 404,
        success: false,
        message: 'User Not found',
      };
    }

    // check password
    const isValidPassword = await verify(user.password, oldPassword);

    if (!isValidPassword) {
      return {
        status: 400,
        success: false,
        message: 'Old password is wrong',
      };
    }

    // hash password
    const hashPassword = await hash(password);

    // update user
    await this.userModel.findByIdAndUpdate(user.id, {
      $set: {
        password: hashPassword,
      },
    });

    return {
      status: 200,
      success: true,
      message: 'User password changed successfully',
    };
  }
  async getUser(id: string) {
    // check if user exist

    const user = await this.userModel.findById(id);

    if (!user) {
      return {
        status: 404,
        success: false,
        message: 'User Not found',
      };
    }

    return {
      status: 200,
      success: true,
      message: 'User Info',
      user,
    };
  }

  async refreshToken(id: string) {
    // check if user exist

    const user = await this.userModel.findById(id);

    if (!user) {
      return {
        status: 404,
        success: false,
        message: 'User Not found',
      };
    }

    // generate token
    const token = await generateAccessToken(id);

    // update
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        accessToken: token.accessToken,
      },
    });

    return {
      status: 200,
      success: true,
      message: 'User token refreshed',
      accessToken: token.accessToken,
    };
  }

  async logout(access: string, refresh: string) {
    // decode
    await removeToken(access);
    await removeToken(refresh);

    return {
      status: 200,
      success: true,
      message: 'User logout',
    };
  }
}
