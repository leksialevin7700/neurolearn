/**
 * API Routes for Event Publishing
 * REST endpoints for publishing Kafka events
 * 
 * These routes are called by the frontend/API layer
 * when users interact with the learning platform
 */

import { Router, Request, Response } from 'express';
import { getEventProducer } from '../producers/eventProducer';

const router = Router();
const producer = getEventProducer();

// ==================== QUIZ EVENTS ====================

/**
 * POST /api/events/user-login
 * Publish user login event
 */
router.post('/user-login', async (req: Request, res: Response) => {
  try {
    const { userId, sessionId, domain } = req.body;

    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields: userId, sessionId' });
    }

    await producer.publishUserLogin(userId, sessionId, domain);
    res.json({ success: true, message: 'User login event published' });
  } catch (error) {
    console.error('Error publishing user login event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

/**
 * POST /api/events/domain-selection
 * Publish domain selection event
 */
router.post('/domain-selection', async (req: Request, res: Response) => {
  try {
    const { userId, domain } = req.body;

    if (!userId || !domain) {
      return res.status(400).json({ error: 'Missing required fields: userId, domain' });
    }

    await producer.publishDomainSelection(userId, domain);
    res.json({ success: true, message: 'Domain selection event published' });
  } catch (error) {
    console.error('Error publishing domain selection event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

/**
 * POST /api/events/diagnostic-quiz
 * Publish diagnostic quiz completion event
 */
router.post('/diagnostic-quiz', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      domain,
      score,
      timeTakenSeconds,
      conceptsCovered,
      recommendedFormat,
    } = req.body;

    if (!userId || !domain || score === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, domain, score',
      });
    }

    await producer.publishDiagnosticQuiz(
      userId,
      domain,
      score,
      timeTakenSeconds || 0,
      conceptsCovered || [],
      recommendedFormat || 'mixed'
    );

    res.json({ success: true, message: 'Diagnostic quiz event published' });
  } catch (error) {
    console.error('Error publishing diagnostic quiz event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

/**
 * POST /api/events/module-quiz
 * Publish module quiz completion event
 */
router.post('/module-quiz', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      domain,
      module,
      moduleIndex,
      score,
      timeTakenSeconds,
      attempts,
      conceptsTested,
      passed,
    } = req.body;

    if (!userId || !domain || !module || score === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, domain, module, score',
      });
    }

    await producer.publishModuleQuiz(
      userId,
      domain,
      module,
      moduleIndex || 0,
      score,
      timeTakenSeconds || 0,
      attempts || 1,
      conceptsTested || [],
      passed ?? score >= 60
    );

    res.json({ success: true, message: 'Module quiz event published' });
  } catch (error) {
    console.error('Error publishing module quiz event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

/**
 * POST /api/events/module-completion
 * Publish module completion event
 */
router.post('/module-completion', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      domain,
      module,
      completionTimeSeconds,
      totalAttempts,
      finalScore,
      contentFormatUsed,
      nextModule,
    } = req.body;

    if (!userId || !domain || !module) {
      return res.status(400).json({
        error: 'Missing required fields: userId, domain, module',
      });
    }

    await producer.publishModuleCompletion(
      userId,
      domain,
      module,
      completionTimeSeconds || 0,
      totalAttempts || 1,
      finalScore || 0,
      contentFormatUsed || 'text',
      nextModule
    );

    res.json({ success: true, message: 'Module completion event published' });
  } catch (error) {
    console.error('Error publishing module completion event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

/**
 * POST /api/events/revision-recommendation
 * Publish revision recommendation event
 */
router.post('/revision-recommendation', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      module,
      domain,
      urgencyLevel,
      reason,
      lastReviewDate,
      recommendedReviewDate,
      currentMemoryScore,
      forgettingScore,
    } = req.body;

    if (!userId || !module || !domain) {
      return res.status(400).json({
        error: 'Missing required fields: userId, module, domain',
      });
    }

    await producer.publishRevisionRecommendation(
      userId,
      module,
      domain,
      urgencyLevel || 'medium',
      reason || 'scheduled_review',
      new Date(lastReviewDate || Date.now()),
      new Date(recommendedReviewDate || Date.now()),
      currentMemoryScore || 50,
      forgettingScore || 50
    );

    res.json({ success: true, message: 'Revision recommendation event published' });
  } catch (error) {
    console.error('Error publishing revision recommendation event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

// ==================== HEALTH & STATUS ====================

/**
 * GET /api/events/health
 * Check event producer health
 */
router.get('/health', (req: Request, res: Response) => {
  const isReady = producer.isReady();
  res.json({
    status: isReady ? 'healthy' : 'unhealthy',
    producer_connected: isReady,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/events/status
 * Get detailed event producer status
 */
router.get('/status', (req: Request, res: Response) => {
  res.json({
    producer_status: producer.isReady() ? 'connected' : 'disconnected',
    kafka_broker: process.env.KAFKA_BROKER || 'localhost:9092',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
  });
});

export default router;
