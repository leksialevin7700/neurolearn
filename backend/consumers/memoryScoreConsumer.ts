/**
 * Memory Score Consumer Service
 * 
 * Implements Ebbinghaus Forgetting Curve for spaced repetition
 * 
 * Responsibilities:
 * - Consume module quiz and completion events
 * - Calculate forgetting scores based on memory decay
 * - Generate revision urgency signals
 * - Schedule reviews using spaced repetition intervals
 * - Persist memory scores to database
 * 
 * Algorithm:
 * - Memory score starts at 100 after completing module
 * - Decays exponentially based on time since last review
 * - Revision intervals increase with each successful review
 * - Low memory score = high urgency
 */

import { Consumer } from 'kafkajs';
import { kafka, consumerGroups, topicsConfig } from '../kafka/config';
import {
  KafkaEvent,
  deserializeEvent,
  ModuleQuizEvent,
  ModuleCompletionEvent,
  RevisionUrgency,
} from '../events/types';
import pool from '../db/client';
import { getEventProducer } from '../producers/eventProducer';

class MemoryScoreConsumer {
  private consumer: Consumer;
  private isRunning = false;

  // Spaced repetition intervals (in hours)
  private readonly intervals = [24, 72, 168, 720]; // 1d, 3d, 1w, 1m

  constructor() {
    this.consumer = kafka.consumer({
      groupId: consumerGroups.memoryScoring,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  /**
   * Start consuming events for memory scoring
   */
  async start(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topics: [
          topicsConfig.module_quiz_events.topic,
          topicsConfig.module_completion_events.topic,
        ],
        fromBeginning: false,
      });

      this.isRunning = true;
      console.log('✓ Memory Score Consumer started');

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = deserializeEvent(message.value?.toString() || '{}');
            await this.handleEvent(event);
          } catch (error) {
            console.error('Error processing message:', error);
          }
        },
      });
    } catch (error) {
      console.error('✗ Memory Score Consumer failed to start:', error);
      throw error;
    }
  }

  /**
   * Stop consumer
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      await this.consumer.disconnect();
      this.isRunning = false;
      console.log('✓ Memory Score Consumer stopped');
    } catch (error) {
      console.error('✗ Error stopping Memory Score Consumer:', error);
    }
  }

  /**
   * Route events to handlers
   */
  private async handleEvent(event: KafkaEvent): Promise<void> {
    switch (event.event_type) {
      case 'module_quiz_completed':
        await this.handleModuleQuiz(event as ModuleQuizEvent);
        break;
      case 'module_completed':
        await this.handleModuleCompletion(event as ModuleCompletionEvent);
        break;
      default:
        break;
    }
  }

  /**
   * Handle module quiz completion
   * Update memory score based on performance
   */
  private async handleModuleQuiz(event: ModuleQuizEvent): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        // Check if record exists
        const existingQuery = `
          SELECT * FROM memory_scores
          WHERE user_id = $1 AND module = $2
        `;
        const existingResult = await client.query(existingQuery, [event.user_id, event.module]);
        const existing = existingResult.rows[0];

        if (!existing) {
          // First attempt - initialize memory score
          const initialScore = this.calculateInitialMemoryScore(event.score);
          await this.createMemoryRecord(event, initialScore);
        } else {
          // Update existing memory score based on performance
          const updatedScore = this.updateMemoryScore(
            existing.current_score,
            existing.days_since_review || 0,
            event.score
          );

          const updateQuery = `
            UPDATE memory_scores
            SET current_score = $1, last_reviewed_at = $2, days_since_review = 0, updated_at = NOW()
            WHERE id = $3
          `;
          await client.query(updateQuery, [updatedScore, event.timestamp, existing.id]);
        }

        // Calculate and publish revision signal
        await this.publishRevisionSignal(event);

        console.log(
          `✓ Memory score updated: ${event.user_id} - ${event.module} - score=${event.score}%`
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error handling module quiz for memory:', error);
    }
  }

  /**
   * Handle module completion
   * Initialize memory score for newly completed modules
   */
  private async handleModuleCompletion(event: ModuleCompletionEvent): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        // Check if record exists
        const existingQuery = `
          SELECT * FROM memory_scores
          WHERE user_id = $1 AND module = $2
        `;
        const existingResult = await client.query(existingQuery, [event.user_id, event.module]);
        const existing = existingResult.rows[0];

        if (!existing) {
          const initialScore = this.calculateInitialMemoryScore(event.final_score);
          await this.createMemoryRecord(event, initialScore);
        }

        console.log(`✓ Memory initialized: ${event.user_id} - ${event.module}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error handling module completion:', error);
    }
  }

  /**
   * Create initial memory score record
   */
  private async createMemoryRecord(
    event: ModuleQuizEvent | ModuleCompletionEvent,
    initialScore: number
  ): Promise<void> {
    const client = await pool.connect();
    try {
      const forgettingScore = 100 - initialScore;
      const nextReviewDate = this.calculateNextReviewDate(0); // First review in 24h

      const insertQuery = `
        INSERT INTO memory_scores (
          user_id, domain, module, current_score, forgetting_score,
          revision_urgency, last_reviewed_at, next_review_at, decay_factor, review_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      await client.query(insertQuery, [
        event.user_id, event.domain, event.module, initialScore, forgettingScore,
        this.calculateUrgency(forgettingScore), event.timestamp, nextReviewDate.toISOString(),
        1.0, 0
      ]);
    } finally {
      client.release();
    }
  }

  /**
   * Calculate initial memory score (boost from quiz performance)
   * Formulae: base 70% confidence + (score - 60) % bonus
   */
  private calculateInitialMemoryScore(quizScore: number): number {
    if (quizScore < 60) {
      // Below passing score = lower confidence
      return Math.max(40, quizScore * 0.8);
    }
    // Above passing = confidence boost
    const bonus = Math.min(30, (quizScore - 60) * 1.5);
    return Math.min(100, 70 + bonus);
  }

  /**
   * Update memory score using forgetting curve
   * Considers time decay and quiz performance
   */
  private updateMemoryScore(
    currentScore: number,
    daysSinceReview: number,
    newQuizScore: number
  ): number {
    // Exponential decay factor: score decays based on days passed
    const decayFactor = Math.exp(-daysSinceReview / 7); // 7-day half-life
    const decayedScore = currentScore * decayFactor;

    // Boost from new quiz attempt
    const performanceBoost = newQuizScore >= 80 ? 15 : newQuizScore >= 60 ? 5 : 0;

    const updatedScore = decayedScore + performanceBoost;
    return Math.min(100, Math.max(0, updatedScore));
  }

  /**
   * Calculate next review date based on spaced repetition
   */
  private calculateNextReviewDate(reviewCount: number): Date {
    const intervalIndex = Math.min(reviewCount, this.intervals.length - 1);
    const intervalHours = this.intervals[intervalIndex];
    const nextDate = new Date();
    nextDate.setHours(nextDate.getHours() + intervalHours);
    return nextDate;
  }

  /**
   * Convert forgetting score to urgency level
   */
  private calculateUrgency(forgettingScore: number): RevisionUrgency {
    if (forgettingScore >= 60) return 'high';
    if (forgettingScore >= 35) return 'medium';
    return 'low';
  }

  /**
   * Publish revision recommendation event
   */
  private async publishRevisionSignal(event: ModuleQuizEvent): Promise<void> {
    try {
      const producer = getEventProducer();
      const forgettingScore = 100 - this.calculateInitialMemoryScore(event.score);
      const urgency = this.calculateUrgency(forgettingScore);
      const nextReview = this.calculateNextReviewDate(0);

      await producer.publishRevisionRecommendation(
        event.user_id,
        event.module,
        event.domain,
        urgency,
        'low_confidence',
        new Date(event.timestamp),
        nextReview,
        this.calculateInitialMemoryScore(event.score),
        forgettingScore
      );

      console.log(
        `✓ Revision signal published: ${event.user_id} - ${event.module} - urgency=${urgency}`
      );
    } catch (error) {
      console.error('Error publishing revision signal:', error);
    }
  }
}

let consumerInstance: MemoryScoreConsumer;

export function getMemoryScoreConsumer(): MemoryScoreConsumer {
  if (!consumerInstance) {
    consumerInstance = new MemoryScoreConsumer();
  }
  return consumerInstance;
}

export default MemoryScoreConsumer;
