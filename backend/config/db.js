const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/property_management';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/property_management';

  // Try primary connection first
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000, // 8 second timeout
      connectTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${error.message}`);
  }

  // If primary URI was Atlas, try local MongoDB as fallback
  if (primaryUri !== localFallbackUri) {
    console.log('Attempting fallback to local MongoDB (127.0.0.1)...');
    try {
      const conn = await mongoose.connect(localFallbackUri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
      return;
    } catch (localError) {
      console.warn(`Local MongoDB also unavailable: ${localError.message}`);
    }
  }

  // If both fail, run in degraded mode (no database). Frontend will use mock data.
  console.warn('⚠️  WARNING: Running without database. Frontend will use mock data fallback.');
  console.warn('   To fix: Ensure MongoDB is running locally OR whitelist your IP in Atlas.');
};

module.exports = connectDB;
