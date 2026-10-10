import mongoose from 'mongoose';
import { env } from './env';

export interface DatabaseState {
  isConnected: boolean;
  status: string;
  host?: string;
  name?: string;
}

export const getDatabaseState = (): DatabaseState => {
  const readyState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isConnected = readyState === 1;
  return {
    isConnected,
    status: states[readyState] || 'unknown',
    host: isConnected ? mongoose.connection.host : undefined,
    name: isConnected ? mongoose.connection.name : undefined,
  };
};

export const connectDatabase = async (): Promise<boolean> => {
  if (!env.MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI not set. Running in database-disconnected mode.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      retryWrites: true,
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.warn(`⚠️ MongoDB connection warning: ${errMessage}`);
    console.warn('ℹ️ Application will continue running without database persistence.');
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed gracefully.');
  }
};
