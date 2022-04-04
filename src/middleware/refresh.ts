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
export class RefreshMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { refresh } = req.headers;

    if (!refresh) {
      return res.status(401).json({
        message: 'User not authorized to access this route',
      });
    }

    try {
      const decode = verify(refresh as string, process.env.JWT_SECRET!) as {
        id: string;
      };

      if (!decode) {
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
      return res.status(401).json({
        message: 'User not authorized to access this route',
      });
    }
  }
}
