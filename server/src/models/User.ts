import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'creator' | 'brand' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash?: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  status: AccountStatus;
  isVerified: boolean;
  isProfileComplete: boolean;
  authProvider: 'local' | 'google';
  googleId?: string;
  creatorProfile?: Types.ObjectId;
  brandProfile?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(password: string): Promise<boolean>;
  toSafeObject(): Record<string, unknown>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false, // Do not include in queries by default
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['creator', 'brand', 'admin'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    creatorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'Creator',
    },
    brandProfile: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password in timing-safe manner
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Return safe user representation excluding passwordHash
userSchema.methods.toSafeObject = function (): Record<string, unknown> {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = model<IUser>('User', userSchema);
