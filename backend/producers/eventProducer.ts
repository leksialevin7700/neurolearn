/**
 * Kafka Event Producer Service
 * Publishes user interaction events to Kafka topics
 * 
 * Responsibilities:
 * - Accept events from REST API/webhooks
 * - Route events to appropriate Kafka topics
 * - Handle retries on failure
 * - Log event publishing for debugging
 */

import { Producer, logLevel } from 'kafkajs';
import { kafka, producerConfig, topicsConfig } from '../kafka/config';
import { KafkaEvent, serializeEvent } from '../events/types';

class EventProducer {
  private producer: Producer;
  private isConnected = false;

  constructor() {
    this.producer = kafka.producer(producerConfig);
  }

  /**
   * Connect to Kafka broker
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✓ Event Producer connected to Kafka');
    } catch (error) {
      console.error('✗ Failed to connect Event Producer:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Kafka broker
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('✓ Event Producer disconnected');
    } catch (error) {
      console.error('✗ Error disconnecting Event Producer:', error);
      throw error;
    }
  }

  /**
   * Publish user login event
   */
  async publishUserLogin(userId: string, sessionId: string, domain?: string): Promise<void> {
    const event: KafkaEvent = {
      event_type: 'user_login',
      user_id: userId,
      session_id: sessionId,
      domain: domain as any,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent(event, topicsConfig.user_login_events.topic);
  }

  /**
   * Publish domain selection event
   */
  async publishDomainSelection(userId: string, domain: string): Promise<void> {
    const event: KafkaEvent = {
      event_type: 'domain_selected',
      user_id: userId,
      domain: domain as any,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent(event, topicsConfig.learning_domain_selection_events.topic);
  }

  /**
   * Publish diagnostic quiz event
   */
  async publishDiagnosticQuiz(
    userId: string,
    domain: string,
    score: number,
    timeTakenSeconds: number,
    conceptsCovered: string[],
    recommendedFormat: string
  ): Promise<void> {
    const event: KafkaEvent = {
      event_type: 'diagnostic_quiz_completed',
      user_id: userId,
      domain: domain as any,
      score,
      max_score: 100,
      total_time_seconds: timeTakenSeconds,
      recommended_format: recommendedFormat as any,
      concepts_covered: conceptsCovered,
      questions_attempted: 5,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent(event, topicsConfig.diagnostic_quiz_events.topic);
  }

  /**
   * Publish module quiz event
   */
  async publishModuleQuiz(
    userId: string,
    domain: string,
    module: string,
    moduleIndex: number,
    score: number,
    timeTakenSeconds: number,
    attempts: number,
    conceptsTested: string[],
    passed: boolean
  ): Promise<void> {
    const event: KafkaEvent = {
      event_type: 'module_quiz_completed',
      user_id: userId,
      domain: domain as any,
      module,
      module_index: moduleIndex,
      score,
      max_score: 100,
      total_time_seconds: timeTakenSeconds,
      attempts,
      concepts_tested: conceptsTested,
      passed,
      questions_answered: 3,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent(event, topicsConfig.module_quiz_events.topic);
  }

  /**
   * Publish module completion event
   */
  async publishModuleCompletion(
    userId: string,
    domain: string,
    module: string,
    completionTimeSeconds: number,
    totalAttempts: number,
    finalScore: number,
    contentFormatUsed: string,
    nextModule?: string
  ): Promise<void> {
    const event: KafkaEvent = {
      event_type: 'module_completed',
      user_id: userId,
      domain: domain as any,
      module,
      completion_time_seconds: completionTimeSeconds,
      total_attempts: totalAttempts,
      final_score: finalScore,
      content_format_used: contentFormatUsed as any,
      next_module: nextModule,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent(event, topicsConfig.module_completion_events.topic);
  }

  /**
   * Publish revision recommendation event
   */
  async publishRevisionRecommendation(
    userId: string,
    module: string,
    domain: string,
    urgencyLevel: string,
    reason: string,
    lastReviewDate: Date,
    recommendedReviewDate: Date,
    currentMemoryScore: number,
    forgettingScore: number
  ): Promise<void> {
    const event: KafkaEvent = {
      event_type: 'revision_scheduled',
      user_id: userId,
      module,
      domain: domain as any,
      urgency_level: urgencyLevel as any,
      reason: reason as any,
      last_review_date: lastReviewDate.toISOString(),
      recommended_review_date: recommendedReviewDate.toISOString(),
      current_memory_score: currentMemoryScore,
      forgetting_score: forgettingScore,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent(event, topicsConfig.revision_recommendation_events.topic);
  }

  /**
   * Generic event publishing method
   * Handles routing, serialization, and error handling
   */
  private async publishEvent(event: KafkaEvent, topic: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Producer is not connected to Kafka');
    }

    try {
      const serialized = serializeEvent(event);
      
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.user_id, // Partition by user_id for ordering
            value: serialized,
            headers: {
              'event-type': event.event_type,
              'timestamp': new Date().toISOString(),
            },
          },
        ],
      });

      console.log(
        `✓ Event published: ${event.event_type} for user ${event.user_id} to topic ${topic}`
      );
    } catch (error) {
      console.error(`✗ Failed to publish event to ${topic}:`, error);
      // In production, implement exponential backoff retry logic here
      throw error;
    }
  }

  /**
   * Health check for producer
   */
  isReady(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let producerInstance: EventProducer;

export function getEventProducer(): EventProducer {
  if (!producerInstance) {
    producerInstance = new EventProducer();
  }
  return producerInstance;
}

export default EventProducer;
