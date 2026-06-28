import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homify';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log('MongoDB Connected...');
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

export default connectDB;
