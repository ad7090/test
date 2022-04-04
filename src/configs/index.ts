//-------------------------------start imports-----------------------------

//-------------------------------end imports-------------------------------
//-------------------------------start code-------------------------------
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,

  mongoUrl: process.env.MONGO_URL!,

  secret: process.env.JWT_SECRET!,
  expire: parseInt(process.env.JWT_EXPIRE, 10) || 60,
});
