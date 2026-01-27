import 'dotenv/config';
import { getAnalyticsConsumer } from './consumers/analyticsConsumer';
import { getMemoryScoreConsumer } from './consumers/memoryScoreConsumer';
import { getEventProducer } from './producers/eventProducer';
import { initializeTopics, healthCheckKafka } from './kafka/config';
import { connectDB, closeDB } from './db/client';

async function startBackendServices() {
  console.log('🚀 Starting Pathwise AI Backend Services...');

  try {
    // Initialize Database
    console.log('🗄️  Connecting to MongoDB...');
    await connectDB();

    // Variables for shutdown handling
    let producer: any;
    let analyticsConsumer: any;
    let memoryConsumer: any;

    // Initialize Kafka topics (Optional)
    try {
      console.log('📋 Initializing Kafka topics...');
      await initializeTopics();

      // Health check Kafka
      console.log('🔍 Checking Kafka connectivity...');
      const kafkaHealthy = await healthCheckKafka();
      if (!kafkaHealthy) {
        throw new Error('Kafka health check failed');
      }

      // Start event producer
      console.log('📤 Starting Event Producer...');
      producer = getEventProducer();
      await producer.connect();

      // Start consumers
      console.log('📥 Starting Analytics Consumer...');
      analyticsConsumer = getAnalyticsConsumer();
      await analyticsConsumer.start();

      console.log('🧠 Starting Memory Score Consumer...');
      memoryConsumer = getMemoryScoreConsumer();
      await memoryConsumer.start();

      console.log('✅ Kafka services started successfully!');
    } catch (kafkaError) {
      console.warn('⚠️  Kafka is unavailable. Analytics events will not be processed.');
      console.warn('   (Run with Docker if you need the full event-driven analytics system)');
    }

    console.log('✅ All backend services started successfully!');
    console.log('📊 Grafana available at: http://localhost:3000');
    console.log('🐳 Kafka UI available at: http://localhost:8080');
    console.log('🗄️  Mongo Express available at: http://localhost:8085');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down services...');

      if (producer) await producer.disconnect();
      if (analyticsConsumer) await analyticsConsumer.stop();
      if (memoryConsumer) await memoryConsumer.stop();
      await closeDB();

      console.log('👋 Services stopped. Goodbye!');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down services...');

      if (producer) await producer.disconnect();
      if (analyticsConsumer) await analyticsConsumer.stop();
      if (memoryConsumer) await memoryConsumer.stop();
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
