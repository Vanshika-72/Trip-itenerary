import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri === 'memory' || process.env.NODE_ENV === 'test') {
      try {
        console.log('Starting in-memory MongoDB server for development/testing...');
        memoryServer = await MongoMemoryServer.create();
        mongoUri = memoryServer.getUri();
        console.log(`In-memory MongoDB started at: ${mongoUri}`);
      } catch (memErr) {
        console.warn('Could not launch in-memory MongoDB, will attempt fallback uri:', memErr.message);
      }
    }

    if (!mongoUri) {
      mongoUri = 'mongodb://127.0.0.1:27017/tripmate';
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If external Mongo failed and we're not in production, attempt MongoMemoryServer fallback
    if (process.env.NODE_ENV !== 'production' && !memoryServer) {
      try {
        console.log('Attempting MongoMemoryServer fallback...');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`Fallback in-memory MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (memError) {
        console.error('Failed to start memory server fallback:', memError.message);
      }
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('MongoDB Disconnected safely.');
  } catch (error) {
    console.error('Error during database disconnect:', error.message);
  }
};
