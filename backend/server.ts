import 'dotenv/config';
import { connectDB, closeDB } from './db/client';

async function startBackendServices() {
  console.log('🚀 Starting Pathwise AI Backend Services...');

  try {
    // Initialize Database
    console.log('🗄️  Connecting to MongoDB...');
    await connectDB();



    console.log('✅ All backend services started successfully!');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down services...');

      await closeDB();

      console.log('👋 Services stopped. Goodbye!');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down services...');

      await closeDB();

      console.log('👋 Services stopped. Goodbye!');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start backend services:', error);
    process.exit(1);
  }
}

// Start the services
startBackendServices();
