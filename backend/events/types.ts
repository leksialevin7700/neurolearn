/**
 * Event Type Definitions and Interfaces
 * Represents all events flowing through the Kafka pipeline
 */

// ==================== EVENT TYPES ====================

export type EventType =
  | 'user_login'
  | 'domain_selected'
  | 'diagnostic_quiz_completed'
  | 'module_quiz_completed'
  | 'module_completed'
  | 'revision_scheduled';

export type Domain = 'dsa' | 'webdev' | 'ai-ml';
export type QuizType = 'diagnostic' | 'module';
export type RevisionUrgency = 'high' | 'medium' | 'low';
export type ContentFormat = 'video' | 'text' | 'mixed';

// ==================== BASE EVENT STRUCTURE ====================

export interface BaseEvent {
  event_type: EventType;
  user_id: string;
  timestamp: string; // ISO8601
}

// ==================== SPECIFIC EVENT INTERFACES ====================

export interface UserLoginEvent extends BaseEvent {
  event_type: 'user_login';
  session_id: string;
  domain?: Domain;
}

export interface DomainSelectionEvent extends BaseEvent {
  event_type: 'domain_selected';
  domain: Domain;
}

export interface DiagnosticQuizEvent extends BaseEvent {
  event_type: 'diagnostic_quiz_completed';
  domain: Domain;
  score: number; // 0-100
  max_score: number;
  total_time_seconds: number;
  recommended_format: ContentFormat;
  concepts_covered: string[];
  questions_attempted: number;
}

export interface ModuleQuizEvent extends BaseEvent {
  event_type: 'module_quiz_completed';
  domain: Domain;
  course?: string;
  module: string;
  module_index: number;
  score: number; // 0-100
  max_score: number;
  total_time_seconds: number;
  attempts: number;
  concepts_tested: string[];
  passed: boolean; // score >= 60
  questions_answered: number;
}

export interface ModuleCompletionEvent extends BaseEvent {
  event_type: 'module_completed';
  domain: Domain;
  course?: string;
  module: string;
  completion_time_seconds: number;
  total_attempts: number;
  final_score: number;
  content_format_used: ContentFormat;
  next_module?: string;
}

export interface RevisionRecommendationEvent extends BaseEvent {
  event_type: 'revision_scheduled';
  module: string;
  domain: Domain;
  urgency_level: RevisionUrgency;
  reason: 'memory_decay' | 'low_confidence' | 'scheduled_review';
  last_review_date: string;
  recommended_review_date: string;
  current_memory_score: number;
  forgetting_score: number;
}

// ==================== UNION TYPE ====================

export type KafkaEvent =
  | UserLoginEvent
  | DomainSelectionEvent
  | DiagnosticQuizEvent
  | ModuleQuizEvent
  | ModuleCompletionEvent
  | RevisionRecommendationEvent;

// ==================== SAMPLE EVENTS (For Testing) ====================

export const SAMPLE_EVENTS = {
  userLogin: {
    event_type: 'user_login',
    user_id: 'user_123',
    session_id: 'sess_abc123',
    timestamp: new Date().toISOString(),
  } as UserLoginEvent,

  domainSelection: {
    event_type: 'domain_selected',
    user_id: 'user_123',
    domain: 'dsa' as Domain,
    timestamp: new Date().toISOString(),
  } as DomainSelectionEvent,

  diagnosticQuiz: {
    event_type: 'diagnostic_quiz_completed',
    user_id: 'user_123',
    domain: 'dsa' as Domain,
    score: 72,
    max_score: 100,
    total_time_seconds: 540,
    recommended_format: 'mixed' as ContentFormat,
    concepts_covered: ['Array Indexing', 'Time Complexity', 'Two Pointers'],
    questions_attempted: 5,
    timestamp: new Date().toISOString(),
  } as DiagnosticQuizEvent,

  moduleQuiz: {
    event_type: 'module_quiz_completed',
    user_id: 'user_123',
    domain: 'dsa' as Domain,
    module: 'dsa-arrays',
    module_index: 0,
    score: 85,
    max_score: 100,
    total_time_seconds: 420,
    attempts: 1,
    concepts_tested: ['Array Access', 'Sliding Window'],
    passed: true,
    questions_answered: 3,
    timestamp: new Date().toISOString(),
  } as ModuleQuizEvent,

  moduleCompletion: {
    event_type: 'module_completed',
    user_id: 'user_123',
    domain: 'dsa' as Domain,
    module: 'dsa-arrays',
    completion_time_seconds: 1200,
    total_attempts: 1,
    final_score: 85,
    content_format_used: 'text' as ContentFormat,
    next_module: 'dsa-linked-lists',
    timestamp: new Date().toISOString(),
  } as ModuleCompletionEvent,

  revisionRecommendation: {
    event_type: 'revision_scheduled',
    user_id: 'user_123',
    module: 'dsa-arrays',
    domain: 'dsa' as Domain,
    urgency_level: 'medium' as RevisionUrgency,
    reason: 'memory_decay' as const,
    last_review_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    recommended_review_date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    current_memory_score: 68,
    forgetting_score: 32,
    timestamp: new Date().toISOString(),
  } as RevisionRecommendationEvent,
};

// ==================== EVENT VALIDATION ====================

export function validateEvent(event: any): event is KafkaEvent {
  if (!event || typeof event !== 'object') return false;
  
  const requiredFields = ['event_type', 'user_id', 'timestamp'];
  return requiredFields.every(field => field in event);
}

// ==================== EVENT SERIALIZATION ====================

export function serializeEvent(event: KafkaEvent): string {
  return JSON.stringify(event);
}

export function deserializeEvent(data: string): KafkaEvent {
  return JSON.parse(data) as KafkaEvent;
}
