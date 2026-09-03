const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn(
      'MONGODB_URI is not set. Skipping MongoDB connection. Add it to your .env file to enable database persistence.',
    );
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.warn('Gracefully falling back to in-memory store.');
    return false;
  }
};

module.exports = connectDB;
