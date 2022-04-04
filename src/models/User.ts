//-------------------------------start imports-----------------------------
import mongoose from 'mongoose';
import { hash } from 'argon2';
//-------------------------------end imports-------------------------------
//-------------------------------start code-------------------------------
interface UserProps {
  fullName: string;
  email: string;
  password: string;
  ip: string;
  device: string;
  accessToken: string;
  refreshToken: string;
  description: string;
}
export interface UserDoc extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  ip: string;
  device: string;
  accessToken: string;
  refreshToken: string;
  description: string;
}
export interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserProps): UserDoc;
}
export const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    ip: {
      type: String,
    },
    device: {
      type: String,
    },
    description: {
      type: String,
    },
    accessToken: {
      type: String,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    timestamps: true,
  },
);

// hash password before storing
UserSchema.pre('save', async function (next) {
  const user = this;
  // check to see password modified
  if (!user.isModified('password')) next();
  // hashing
  const hashed = await hash(this.get('password'));
  this.set('password', hashed);
  next();
}); //end
