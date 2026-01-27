import 'dotenv/config';
import { getAnalyticsConsumer } from './consumers/analyticsConsumer';
import { getMemoryScoreConsumer } from './consumers/memoryScoreConsumer';
import { getEventProducer } from './producers/eventProducer';
import { initializeTopics, healthCheckKafka } from './kafka/config';

async function startBackendServices() {
  console.log('🚀 Starting Pathwise AI Backend Services...');

  try {
    // Initialize Kafka topics
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
    const producer = getEventProducer();
    await producer.connect();

    // Start consumers
    console.log('📥 Starting Analytics Consumer...');
    const analyticsConsumer = getAnalyticsConsumer();
    await analyticsConsumer.start();

    console.log('🧠 Starting Memory Score Consumer...');
    const memoryConsumer = getMemoryScoreConsumer();
    await memoryConsumer.start();

    console.log('✅ All backend services started successfully!');
    console.log('📊 Grafana available at: http://localhost:3000');
    console.log('🐳 Kafka UI available at: http://localhost:8080');
    console.log('🗄️  PgAdmin available at: http://localhost:5050');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down services...');

      await producer.disconnect();
      await analyticsConsumer.stop();
      await memoryConsumer.stop();

      console.log('👋 Services stopped. Goodbye!');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down services...');

      await producer.disconnect();
      await analyticsConsumer.stop();
      await memoryConsumer.stop();

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
