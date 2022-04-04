//-------------------------------start imports-----------------------------
import { sign, verify } from 'jsonwebtoken';
import { redisClient } from '../redis';
import { nanoid } from 'nanoid/async';
//-------------------------------end imports-------------------------------
//-------------------------------start code-------------------------------

const createID = async () => {
  const id = await nanoid();
  return id;
};

// 5 min
export const generateAccessToken = async (id: string) => {
  const accessId = await createID();
  const accessToken = sign({ id: accessId }, process.env.JWT_SECRET!, {
    expiresIn: 60 * 5,
  });

  await redisClient.set(accessId, JSON.stringify({ id }), 'EX', 60 * 5);

  return {
    accessToken,
  };
};

//  30 day
export const generateRefreshToken = async (id: string) => {
  const refreshId = await createID();
  const refreshToken = sign({ id: refreshId }, process.env.JWT_SECRET!, {
    expiresIn: 60 * 60 * 30,
  });

  await redisClient.set(refreshId, JSON.stringify({ id }), 'EX', 60 * 60 * 30);

  return {
    refreshToken,
  };
};

export const removeToken = async (token: string) => {
  try {
    const decode = verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    if (decode) {
      // remove
      await redisClient.del(decode.id);
    }
    return true;
  } catch (error) {
    return false;
  }
};
