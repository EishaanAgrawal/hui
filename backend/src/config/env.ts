import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'farmdirect_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  PLATFORM_COMMISSION_PERCENTAGE: process.env.PLATFORM_COMMISSION_PERCENTAGE
    ? parseFloat(process.env.PLATFORM_COMMISSION_PERCENTAGE)
    : 5.0,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_farmdirectdemo123',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'farmdirect_rzp_mock_secret_key',
};
