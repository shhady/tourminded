import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is not defined. Please add it to .env.local');
}

/**
 * Cached connection to prevent excessive reconnections in development
 */
let cached = globalThis.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Creating new MongoDB connection...');
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Avoid long timeout errors
      socketTimeoutMS: 45000, // Keep connection stable
    };

    cached.promise = mongoose.connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        cached.promise = null; // Reset promise on failure
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    globalThis.mongoose = cached; // Cache globally for Vercel
    return cached.conn;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    cached.promise = null; // Allow retrying on next request
    throw error;
  }
}

export default connectDB;
