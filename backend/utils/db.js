const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose
 * Reads connection URI from environment variable MONGODB_URI
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI not found in .env. Please set your MongoDB Atlas connection string in backend/.env');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout fast if URI is unreachable
    });
    console.log(`DB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.warn('⚠️ Server will continue running, but database operations require a valid MongoDB Atlas connection string in backend/.env');
    return null;
  }
};

module.exports = connectDB;
