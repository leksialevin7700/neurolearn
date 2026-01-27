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
import pool from '../db/client';

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
      const client = await pool.connect();
      try {
        // Check if record exists
        const existingQuery = `
          SELECT * FROM quiz_analytics
          WHERE user_id = $1 AND domain = $2 AND quiz_type = 'diagnostic'
        `;
        const existingResult = await client.query(existingQuery, [event.user_id, event.domain]);
        const existing = existingResult.rows[0];

        if (existing) {
          // Update existing record
          const updateQuery = `
            UPDATE quiz_analytics
            SET average_score = $1, total_attempts = 1, last_attempted_at = $2, updated_at = NOW()
            WHERE id = $3
          `;
          await client.query(updateQuery, [event.score, event.timestamp, existing.id]);
        } else {
          // Insert new record
          const insertQuery = `
            INSERT INTO quiz_analytics (
              user_id, domain, course, module, quiz_type, average_score,
              total_attempts, concepts_covered, recommended_format, last_attempted_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `;
          await client.query(insertQuery, [
            event.user_id, event.domain, null, 'diagnostic', 'diagnostic',
            event.score, 1, event.concepts_covered, event.recommended_format, event.timestamp
          ]);
        }

        console.log(
          `✓ Diagnostic quiz analytics updated: ${event.user_id} - ${event.domain} - ${event.score}%`
        );
      } finally {
        client.release();
      }
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
      const client = await pool.connect();
      try {
        // Check if record exists
        const existingQuery = `
          SELECT * FROM quiz_analytics
          WHERE user_id = $1 AND module = $2 AND quiz_type = 'module'
        `;
        const existingResult = await client.query(existingQuery, [event.user_id, event.module]);
        const existing = existingResult.rows[0];

        const newAvgScore = existing
          ? Math.round((existing.average_score * existing.total_attempts + event.score) /
            (existing.total_attempts + 1))
          : event.score;

        const newAvgTime = existing
          ? Math.round((existing.average_time_taken * existing.total_attempts + event.total_time_seconds) /
            (existing.total_attempts + 1))
          : event.total_time_seconds;

        if (existing) {
          const updateQuery = `
            UPDATE quiz_analytics
            SET average_score = $1, average_time_taken = $2, total_attempts = $3,
                last_attempted_at = $4, passed = $5, updated_at = NOW()
            WHERE id = $6
          `;
          await client.query(updateQuery, [
            newAvgScore, newAvgTime, existing.total_attempts + 1,
            event.timestamp, event.passed, existing.id
          ]);
        } else {
          const insertQuery = `
            INSERT INTO quiz_analytics (
              user_id, domain, course, module, quiz_type, average_score,
              average_time_taken, total_attempts, concepts_covered, passed, last_attempted_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `;
          await client.query(insertQuery, [
            event.user_id, event.domain, event.course, event.module, 'module',
            event.score, event.total_time_seconds, 1, event.concepts_tested,
            event.passed, event.timestamp
          ]);
        }

        // Update user engagement metrics
        await this.updateUserEngagement(event);

        console.log(
          `✓ Module quiz analytics updated: ${event.user_id} - ${event.module} - ${event.score}%`
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error handling module quiz:', error);
    }
  }

  /**
   * Aggregate user engagement metrics
   */
  private async updateUserEngagement(event: ModuleQuizEvent): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        // Check if record exists
        const existingQuery = `
          SELECT * FROM user_engagement
          WHERE user_id = $1 AND domain = $2
        `;
        const existingResult = await client.query(existingQuery, [event.user_id, event.domain]);
        const existing = existingResult.rows[0];

        if (existing) {
          const updateQuery = `
            UPDATE user_engagement
            SET total_quiz_attempts = $1, total_time_seconds = $2, last_activity_at = $3, updated_at = NOW()
            WHERE id = $4
          `;
          await client.query(updateQuery, [
            existing.total_quiz_attempts + 1,
            existing.total_time_seconds + event.total_time_seconds,
            event.timestamp,
            existing.id
          ]);
        } else {
          const insertQuery = `
            INSERT INTO user_engagement (
              user_id, domain, modules_started, modules_completed,
              total_quiz_attempts, total_time_seconds, last_activity_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          await client.query(insertQuery, [
            event.user_id, event.domain, 1, event.passed ? 1 : 0,
            1, event.total_time_seconds, event.timestamp
          ]);
        }
      } finally {
        client.release();
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
