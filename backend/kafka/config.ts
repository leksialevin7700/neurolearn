import { Kafka, logLevel } from 'kafkajs';

/**
 * Kafka Configuration for Learning Platform
 * Single broker setup suitable for hackathon scale
 */

export const kafkaConfig = {
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  clientId: 'pathwise-ai-app',
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 8,
    multiplier: 2,
    maxRetryTime: 30000,
  },
  ssl: process.env.KAFKA_SSL === 'true',
  sasl: process.env.KAFKA_SASL_ENABLED === 'true' ? {
    mechanism: 'plain',
    username: process.env.KAFKA_SASL_USERNAME || '',
    password: process.env.KAFKA_SASL_PASSWORD || '',
  } : undefined,
};

/**
 * Initialize Kafka instance with proper logging
 */
export const kafka = new Kafka({
  ...kafkaConfig,
  logLevel: process.env.NODE_ENV === 'production' ? logLevel.ERROR : logLevel.INFO,
});

/**
 * Topic Configuration
 * All topics use 1 partition and 1 replication (hackathon scale)
 * Retention: 7 days for event replay capability
 */
export const topicsConfig = {
  user_login_events: {
    topic: 'user_login_events',
    partitions: 1,
    replicationFactor: 1,
    configEntries: [{ name: 'retention.ms', value: '604800000' }], // 7 days
  },
  learning_domain_selection_events: {
    topic: 'learning_domain_selection_events',
    partitions: 1,
    replicationFactor: 1,
    configEntries: [{ name: 'retention.ms', value: '604800000' }],
  },
  diagnostic_quiz_events: {
    topic: 'diagnostic_quiz_events',
    partitions: 1,
    replicationFactor: 1,
    configEntries: [{ name: 'retention.ms', value: '604800000' }],
  },
  module_quiz_events: {
    topic: 'module_quiz_events',
    partitions: 1,
    replicationFactor: 1,
    configEntries: [{ name: 'retention.ms', value: '604800000' }],
  },
  module_completion_events: {
    topic: 'module_completion_events',
    partitions: 1,
    replicationFactor: 1,
    configEntries: [{ name: 'retention.ms', value: '604800000' }],
  },
  revision_recommendation_events: {
    topic: 'revision_recommendation_events',
    partitions: 1,
    replicationFactor: 1,
    configEntries: [{ name: 'retention.ms', value: '604800000' }],
  },
};

/**
 * Consumer Groups
 * Each consumer group tracks offsets independently
 */
export const consumerGroups = {
  analytics: 'analytics-consumer-group',
  memoryScoring: 'memory-score-consumer-group',
  metrics: 'metrics-aggregator-group',
};

/**
 * Producer Configuration
 * Ensures reliability with acknowledgment from all replicas
 */
export const producerConfig = {
  timeout: 30000,
  compression: 1, // Gzip compression for smaller payload
  maxInFlightRequests: 5,
  idempotent: true, // Prevent duplicate messages
  transactionTimeout: 30000,
};

/**
 * Initialize Topics (run once on startup)
 */
export async function initializeTopics() {
  const admin = kafka.admin();
  
  try {
    await admin.connect();
    
    const topicsList = Object.values(topicsConfig);
    const existingTopics = await admin.listTopics();
    
    const newTopics = topicsList.filter(
      (topic) => !existingTopics.includes(topic.topic)
    );
    
    if (newTopics.length > 0) {
      console.log(`Creating ${newTopics.length} topics...`);
      await admin.createTopics({
        topics: newTopics,
        validateOnly: false,
        timeout: 5000,
      });
      console.log('Topics created successfully');
    } else {
      console.log('All topics already exist');
    }
  } catch (error) {
    console.error('Error initializing topics:', error);
    throw error;
  } finally {
    await admin.disconnect();
  }
}

/**
 * Health Check: Verify Kafka connectivity
 */
export async function healthCheckKafka(): Promise<boolean> {
  const admin = kafka.admin();
  
  try {
    await admin.connect();
    const cluster = await admin.describeCluster();
    console.log(`Connected to Kafka broker: ${cluster.controller}`);
    await admin.disconnect();
    return true;
  } catch (error) {
    console.error('Kafka health check failed:', error);
    return false;
  }
}
