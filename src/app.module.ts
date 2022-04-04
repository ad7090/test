import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configs from './configs';
import { UserController } from './controllers/userController';
import { UserService } from './services/userService';
import { UserSchema } from './models/User';
import { AuthMiddleware } from './middleware/auth';
import { RefreshMiddleware } from './middleware/refresh';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configs],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUrl'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/register', method: RequestMethod.POST },
        { path: 'user/refresh', method: RequestMethod.GET },
      )
      .forRoutes(UserController);

    consumer
      .apply(RefreshMiddleware)
      .exclude(
        { path: 'user/login', method: RequestMethod.POST },
        { path: 'user/register', method: RequestMethod.POST },
        { path: 'user', method: RequestMethod.GET },
        { path: 'user/logout', method: RequestMethod.POST },
        { path: 'user/change-password', method: RequestMethod.POST },
      )
      .forRoutes(UserController);
  }
}
