import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { redisClient } from '../redis';

declare global {
  namespace Express {
    interface Request {
      currentUser?: string;
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization, refresh } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        message: 'User not authorized to access this route',
      });
    }

    if (!refresh) {
      return res.status(401).json({
        message: 'User not authorized to access this route',
      });
    }

    try {
      const decode = verify(authorization, process.env.JWT_SECRET!) as {
        id: string;
      };

      if (!decode) {
        if (refresh) {
          return res.status(401).json({
            message: 'Please refresh your access token',
          });
        }
        return res.status(401).json({
          message: 'User not authorized to access this route',
        });
      }

      // get from redis
      const redisData = await redisClient.get(decode.id);

      if (!redisData) {
        return res.status(401).json({
          message: 'User not authorized to access this route',
        });
      }

      const parse = JSON.parse(redisData);

      req.currentUser = parse.id;
      return next();
    } catch (error) {
      if (refresh) {
        return res.status(401).json({
          message: 'Please refresh your access token',
        });
      }
      return res.status(401).json({
        message: 'User not authorized to access this route',
      });
    }
  }
}
