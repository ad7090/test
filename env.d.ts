declare namespace NodeJS {
  export interface ProcessEnv {
    MONGO_URL: string;
    PORT: string;
    JWT_SECRET: string;
    JWT_EXPIRE: string;
    REDIS_SERVER: string;
  }
}
