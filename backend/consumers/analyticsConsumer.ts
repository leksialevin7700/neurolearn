/**
 * Analytics Consumer Service
 * 
 * Responsibilities:
 * - Consume quiz events from Kafka topics
 * - Aggregate performance metrics
 * - Calculate engagement statistics
 * - Persist analytics to PostgreSQL
 * 
 * Processed data:
 * - Average quiz scores per module
 * - Time spent per module
 * - Attempt counts
 * - User engagement trends
 */

import { Consumer, logLevel } from 'kafkajs';
import { kafka, consumerGroups, topicsConfig } from '../kafka/config';
import { KafkaEvent, deserializeEvent, ModuleQuizEvent, DiagnosticQuizEvent } from '../events/types';
import { getDB } from '../db/client';

class AnalyticsConsumer {
  private consumer: Consumer;
  private isRunning = false;

  constructor() {
    this.consumer = kafka.consumer({
      groupId: consumerGroups.analytics,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  /**
   * Start consuming events
   */
  async start(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topics: [
          topicsConfig.diagnostic_quiz_events.topic,
          topicsConfig.module_quiz_events.topic,
        ],
        fromBeginning: false, // Only new messages
      });

      this.isRunning = true;
      console.log('✓ Analytics Consumer started');

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = deserializeEvent(message.value?.toString() || '{}');
            await this.handleEvent(event);
          } catch (error) {
            console.error('Error processing message:', error);
            // Continue processing other messages
          }
        },
      });
    } catch (error) {
      console.error('✗ Analytics Consumer failed to start:', error);
      throw error;
    }
  }

  /**
   * Stop consuming events
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.consumer.disconnect();
      this.isRunning = false;
      console.log('✓ Analytics Consumer stopped');
    } catch (error) {
      console.error('✗ Error stopping Analytics Consumer:', error);
    }
  }

  /**
   * Route events to appropriate handler
   */
  private async handleEvent(event: KafkaEvent): Promise<void> {
    switch (event.event_type) {
      case 'diagnostic_quiz_completed':
        await this.handleDiagnosticQuiz(event as DiagnosticQuizEvent);
        break;
      case 'module_quiz_completed':
        await this.handleModuleQuiz(event as ModuleQuizEvent);
        break;
      default:
        // Ignore other event types
        break;
    }
  }

  /**
   * Process diagnostic quiz event
   * Updates initial assessment analytics
   */
  private async handleDiagnosticQuiz(event: DiagnosticQuizEvent): Promise<void> {
    try {
      const db = getDB();
      const collection = db.collection('quiz_analytics');

      await collection.updateOne(
        {
          user_id: event.user_id,
          domain: event.domain,
          quiz_type: 'diagnostic'
        },
        {
          $set: {
            average_score: event.score,
            total_attempts: 1,
            last_attempted_at: event.timestamp,
            updated_at: new Date(),
            concepts_covered: event.concepts_covered,
            recommended_format: event.recommended_format,
            module: 'diagnostic',
            course: null
          }
        },
        { upsert: true }
      );

      console.log(
        `✓ Diagnostic quiz analytics updated: ${event.user_id} - ${event.domain} - ${event.score}%`
      );
    } catch (error) {
      console.error('Error handling diagnostic quiz:', error);
    }
  }

  /**
   * Process module quiz event
   * Aggregates module-level performance
   */
  private async handleModuleQuiz(event: ModuleQuizEvent): Promise<void> {
    try {
      const db = getDB();
      const collection = db.collection('quiz_analytics');

      // Get existing record to calculate moving average
      const existing = await collection.findOne({
        user_id: event.user_id,
        module: event.module,
        quiz_type: 'module'
      });

      const totalAttempts = (existing?.total_attempts || 0) + 1;

      const newAvgScore = existing
        ? Math.round((existing.average_score * existing.total_attempts + event.score) / totalAttempts)
        : event.score;

      const newAvgTime = existing
        ? Math.round(((existing.average_time_taken || 0) * existing.total_attempts + event.total_time_seconds) / totalAttempts)
        : event.total_time_seconds;

      await collection.updateOne(
        {
          user_id: event.user_id,
          module: event.module,
          quiz_type: 'module'
        },
        {
          $set: {
            domain: event.domain,
            course: event.course,
            average_score: newAvgScore,
            average_time_taken: newAvgTime,
            total_attempts: totalAttempts,
            last_attempted_at: event.timestamp,
            passed: event.passed,
            concepts_covered: event.concepts_tested,
            updated_at: new Date()
          }
        },
        { upsert: true }
      );

      // Update user engagement metrics
      await this.updateUserEngagement(event);

      console.log(
        `✓ Module quiz analytics updated: ${event.user_id} - ${event.module} - ${event.score}%`
      );
    } catch (error) {
      console.error('Error handling module quiz:', error);
    }
  }

  /**
   * Aggregate user engagement metrics
   */
  private async updateUserEngagement(event: ModuleQuizEvent): Promise<void> {
    try {
      const db = getDB();
      const collection = db.collection('user_engagement');

      const existing = await collection.findOne({
        user_id: event.user_id,
        domain: event.domain
      });

      if (existing) {
        await collection.updateOne(
          { _id: existing._id },
          {
            $inc: {
              total_quiz_attempts: 1,
              total_time_seconds: event.total_time_seconds
            },
            $set: {
              last_activity_at: event.timestamp,
              updated_at: new Date()
            }
          }
        );
      } else {
        await collection.insertOne({
          user_id: event.user_id,
          domain: event.domain,
          modules_started: 1,
          modules_completed: event.passed ? 1 : 0,
          total_quiz_attempts: 1,
          total_time_seconds: event.total_time_seconds,
          last_activity_at: event.timestamp,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user engagement:', error);
    }
  }
}

let consumerInstance: AnalyticsConsumer;

export function getAnalyticsConsumer(): AnalyticsConsumer {
  if (!consumerInstance) {
    consumerInstance = new AnalyticsConsumer();
  }
  return consumerInstance;
}

export default AnalyticsConsumer;
