-- ================================================
-- ANALYTICS DATABASE SCHEMA
-- PostgreSQL tables for event-driven analytics
-- ================================================

-- Table: quiz_analytics
-- Stores aggregated quiz performance metrics per user/module
CREATE TABLE IF NOT EXISTS quiz_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL, -- 'dsa' | 'webdev' | 'ai-ml'
  course TEXT,
  module TEXT NOT NULL,
  quiz_type TEXT NOT NULL, -- 'diagnostic' | 'module'
  
  -- Metrics
  average_score FLOAT DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  average_time_taken INTEGER DEFAULT 0, -- seconds
  concepts_covered TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_format TEXT, -- 'video' | 'text' | 'mixed'
  passed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  first_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT quiz_analytics_user_module UNIQUE(user_id, module, quiz_type)
);

CREATE INDEX idx_quiz_analytics_user ON quiz_analytics(user_id);
CREATE INDEX idx_quiz_analytics_domain ON quiz_analytics(domain);
CREATE INDEX idx_quiz_analytics_module ON quiz_analytics(module);


-- Table: memory_scores
-- Tracks spaced repetition and forgetting curve scores
CREATE TABLE IF NOT EXISTS memory_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  module TEXT NOT NULL,
  
  -- Memory metrics (0-100 scale)
  current_score FLOAT DEFAULT 100,           -- Confidence in retention
  forgetting_score FLOAT DEFAULT 0,          -- Risk of forgetting
  
  -- Revision tracking
  revision_urgency TEXT DEFAULT 'low',       -- 'high' | 'medium' | 'low'
  decay_factor FLOAT DEFAULT 1.0,            -- Ebbinghaus decay multiplier
  review_count INTEGER DEFAULT 0,            -- Number of successful reviews
  
  -- Scheduling
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  days_since_review INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT memory_scores_user_module UNIQUE(user_id, module)
);

CREATE INDEX idx_memory_scores_user ON memory_scores(user_id);
CREATE INDEX idx_memory_scores_urgency ON memory_scores(revision_urgency);
CREATE INDEX idx_memory_scores_next_review ON memory_scores(next_review_at);


-- Table: user_engagement
-- Aggregate user activity and engagement metrics
CREATE TABLE IF NOT EXISTS user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  
  -- Progress metrics
  modules_started INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  
  -- Activity metrics
  total_quiz_attempts INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  
  -- Timestamps
  first_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_engagement_user_domain UNIQUE(user_id, domain)
);

CREATE INDEX idx_user_engagement_user ON user_engagement(user_id);
CREATE INDEX idx_user_engagement_domain ON user_engagement(domain);
CREATE INDEX idx_user_engagement_last_activity ON user_engagement(last_activity_at);


-- Table: revision_signals
-- Queue of scheduled revisions for spaced repetition
CREATE TABLE IF NOT EXISTS revision_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  
  -- Urgency level
  urgency_level TEXT NOT NULL, -- 'high' | 'medium' | 'low'
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT revision_signals_unique UNIQUE(user_id, module_id, scheduled_at)
);

CREATE INDEX idx_revision_signals_user ON revision_signals(user_id);
CREATE INDEX idx_revision_signals_scheduled ON revision_signals(scheduled_at);
CREATE INDEX idx_revision_signals_urgency ON revision_signals(urgency_level);


-- Table: event_metrics
-- Aggregate event processing metrics for monitoring
CREATE TABLE IF NOT EXISTS event_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  
  -- Counters
  events_processed INTEGER DEFAULT 0,
  events_failed INTEGER DEFAULT 0,
  
  -- Performance
  avg_processing_time_ms FLOAT DEFAULT 0,
  max_processing_time_ms FLOAT DEFAULT 0,
  
  -- Time bucket (5-minute windows)
  time_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT event_metrics_unique UNIQUE(event_type, topic, time_bucket)
);

CREATE INDEX idx_event_metrics_time_bucket ON event_metrics(time_bucket DESC);


-- ================================================
-- VIEWS FOR GRAFANA DASHBOARDS
-- ================================================

-- View: vw_forgetting_risk_summary
-- Aggregates forgetting risk across users
CREATE OR REPLACE VIEW vw_forgetting_risk_summary AS
SELECT 
  domain,
  revision_urgency,
  COUNT(*) AS user_count,
  ROUND(AVG(current_score)::numeric, 2) AS avg_memory_score,
  ROUND(AVG(forgetting_score)::numeric, 2) AS avg_forgetting_score,
  NOW() AS snapshot_time
FROM memory_scores
GROUP BY domain, revision_urgency;


-- View: vw_engagement_summary
-- User engagement aggregated by domain
CREATE OR REPLACE VIEW vw_engagement_summary AS
SELECT 
  domain,
  COUNT(DISTINCT user_id) AS active_users,
  ROUND(AVG(modules_completed)::numeric, 2) AS avg_modules_completed,
  ROUND((AVG(total_time_seconds) / 3600.0)::numeric, 2) AS avg_hours_spent,
  SUM(total_quiz_attempts) AS total_quiz_attempts,
  MAX(last_activity_at) AS last_activity,
  NOW() AS snapshot_time
FROM user_engagement
GROUP BY domain;


-- View: vw_module_performance
-- Performance metrics per module
CREATE OR REPLACE VIEW vw_module_performance AS
SELECT 
  domain,
  module,
  COUNT(*) AS user_attempts,
  ROUND(AVG(average_score)::numeric, 2) AS avg_score,
  ROUND(MAX(average_score)::numeric, 2) AS max_score,
  ROUND(MIN(average_score)::numeric, 2) AS min_score,
  ROUND((AVG(average_time_taken) / 60.0)::numeric, 2) AS avg_time_minutes,
  SUM(CASE WHEN passed THEN 1 ELSE 0 END) AS passed_count,
  ROUND((SUM(CASE WHEN passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100)::numeric, 2) AS pass_rate,
  NOW() AS snapshot_time
FROM quiz_analytics
WHERE quiz_type = 'module'
GROUP BY domain, module;


-- View: vw_revision_queue
-- Current revision queue with urgency
CREATE OR REPLACE VIEW vw_revision_queue AS
SELECT 
  user_id,
  COUNT(*) AS revisions_pending,
  SUM(CASE WHEN urgency_level = 'high' THEN 1 ELSE 0 END) AS high_urgency_count,
  SUM(CASE WHEN urgency_level = 'medium' THEN 1 ELSE 0 END) AS medium_urgency_count,
  SUM(CASE WHEN urgency_level = 'low' THEN 1 ELSE 0 END) AS low_urgency_count,
  MIN(scheduled_at) AS next_due_date,
  NOW() AS snapshot_time
FROM revision_signals
WHERE completed = FALSE AND scheduled_at <= NOW()
GROUP BY user_id;


-- ================================================
-- FUNCTIONS FOR ANALYTICS
-- ================================================

-- Function: calculate_memory_decay
-- Updates memory scores based on forgetting curve
CREATE OR REPLACE FUNCTION calculate_memory_decay()
RETURNS void AS $$
BEGIN
  UPDATE memory_scores
  SET 
    current_score = GREATEST(0, LEAST(100, 
      current_score * EXP(-EXTRACT(EPOCH FROM (NOW() - last_reviewed_at)) / (7 * 86400))
    )),
    forgetting_score = LEAST(100, GREATEST(0, 
      100 - (current_score * EXP(-EXTRACT(EPOCH FROM (NOW() - last_reviewed_at)) / (7 * 86400)))
    )),
    revision_urgency = CASE 
      WHEN current_score * EXP(-EXTRACT(EPOCH FROM (NOW() - last_reviewed_at)) / (7 * 86400)) < 40 THEN 'high'
      WHEN current_score * EXP(-EXTRACT(EPOCH FROM (NOW() - last_reviewed_at)) / (7 * 86400)) < 70 THEN 'medium'
      ELSE 'low'
    END,
    updated_at = NOW()
  WHERE last_reviewed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;


-- Trigger: auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_quiz_analytics_updated BEFORE UPDATE ON quiz_analytics
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_memory_scores_updated BEFORE UPDATE ON memory_scores
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_engagement_updated BEFORE UPDATE ON user_engagement
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
