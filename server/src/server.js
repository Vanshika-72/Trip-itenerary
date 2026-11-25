import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import { seedDemoData } from './utils/seed.js';

const PORT = process.env.PORT || 5001;

let server;

const startServer = async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Automatically seeding demo travelers and sample trips...');
      await seedDemoData(false);
    }

    server = app.listen(PORT, () => {
      console.log(`TripMate API Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`API URL: http://localhost:${PORT}/api`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      if (server) {
        server.close(async () => {
          console.log('HTTP server closed.');
          await disconnectDB();
          process.exit(0);
        });
      } else {
        await disconnectDB();
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
