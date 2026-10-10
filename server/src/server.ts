import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initSocketServer } from './realtime/socketServer';

const startServer = async () => {
  // Attempt DB Connection (Non-blocking fallback)
  await connectDatabase();

  const httpServer = http.createServer(app);

  // Attach Socket.IO real-time server
  const io = initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Kampus.VC API Backend & Socket.IO running at http://localhost:${env.PORT}`);
    console.log(`📡 Health Check URL: http://localhost:${env.PORT}/api/health`);
    console.log(`⚡ Environment: ${env.NODE_ENV}`);
  });

  // Graceful Shutdown Handling
  const handleShutdown = async (signal: string) => {
    console.log(`\n⚠️ ${signal} received. Initiating graceful shutdown...`);
    io.close(() => {
      console.log('⚡ Socket.IO server closed.');
    });
    httpServer.close(async () => {
      console.log('🛑 HTTP Server closed.');
      await disconnectDatabase();
      console.log('✅ Shutdown completed cleanly.');
      process.exit(0);
    });

    // Timeout fallback for shutdown
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcing shut down.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});
