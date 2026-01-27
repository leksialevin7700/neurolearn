# Event-Driven Analytics & Monitoring Implementation Guide

## Quick Start (5 minutes)

### 1. Start Infrastructure
```bash
docker-compose up -d
```
This starts:
- Zookeeper (2181)
- Kafka (9092)
- MongoDB (27017)
- Grafana (3000)
- Kafka UI (8080)
- Mongo Express (8082)

### 2. Initialize Analytics Database
MongoDB will automatically create the database and collections on first write. You can view the data using Mongo Express at http://localhost:8082.

### 3. Start Services
```bash
# Install dependencies
npm install

# Start producer (publishes events from API)
npm run start:producer

# Start consumers (processes events)
npm run start:consumers

# Start main app
npm run dev
```

### 4. Access Dashboards
- **Grafana**: http://localhost:3000 (admin/admin)
- **Kafka UI**: http://localhost:8080
- **Mongo Express**: http://localhost:8082

---

## System Architecture

### Event Flow
```
Frontend/API
    ↓
    Publish Events → Kafka Topics
    ↓
    Consumers Process → MongoDB
    ↓
    Grafana Queries → Real-time Dashboards
```

### Kafka Topics

| Topic | Purpose | Consumer |
|-------|---------|----------|
| `user_login_events` | Session tracking | Analytics |
| `learning_domain_selection_events` | Domain selection | Analytics |
| `diagnostic_quiz_events` | Initial assessment | Analytics, Memory |
| `module_quiz_events` | Module performance | Analytics, Memory |
| `module_completion_events` | Progress tracking | Analytics, Memory |
| `revision_recommendation_events` | Spaced repetition | Stored in DB |

### Event Publishing (from Frontend)

```typescript
// Example: Publish quiz result
fetch('/api/events/module-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_123',
    domain: 'dsa',
    module: 'dsa-arrays',
    moduleIndex: 0,
    score: 85,
    timeTakenSeconds: 420,
    attempts: 1,
    conceptsTested: ['Array Access', 'Sliding Window'],
    passed: true
  })
});
```

### Event Consumption (Analytics)

**Analytics Consumer**:
- Aggregates quiz metrics (avg score, attempts, time)
- Tracks user engagement (modules started/completed)
- Updates `quiz_analytics` and `user_engagement` tables

**Memory Score Consumer**:
- Implements Ebbinghaus forgetting curve
- Calculates revision urgency (high/medium/low)
- Schedules reviews using spaced repetition
- Updates `memory_scores` and publishes `revision_recommendation_events`

---

## Database Schema Overview

### quiz_analytics
Aggregated quiz performance per user/module
```sql
SELECT * FROM quiz_analytics 
WHERE user_id = 'user_123' AND domain = 'dsa'
ORDER BY last_attempted_at DESC;
```

### memory_scores
Spaced repetition tracking with forgetting curves
```sql
SELECT * FROM memory_scores 
WHERE revision_urgency = 'high'
ORDER BY next_review_at ASC;
```

### user_engagement
User activity summaries by domain
```sql
SELECT * FROM user_engagement 
WHERE last_activity_at > NOW() - INTERVAL '24 hours'
ORDER BY last_activity_at DESC;
```

### revision_signals
Queue of scheduled reviews
```sql
SELECT * FROM revision_signals 
WHERE completed = FALSE 
AND scheduled_at <= NOW()
ORDER BY urgency_level DESC;
```

---

## Grafana Dashboards

### Dashboard: Learning Platform Analytics

**Row 1: Overview Metrics**
- Forgetting Risk Distribution (pie chart)
- Average Memory Score (gauge)
- Memory Score Trends (7-day line chart)

**Row 2: Engagement Metrics**
- Quiz Attempts (24-hour bar chart)
- Average Time per Module (line chart)

**Row 3: Urgency Signals**
- High/Medium/Low Urgency Counts (stat cards)
- Active Users (stat card)

**Row 4: Module Performance**
- Performance Scorecard (module scores by domain)

### Refresh Rate
- Auto-refresh: 10 seconds
- Time range: Last 7 days (configurable)

### Adding Custom Panels
1. Click "Edit" on dashboard
2. Click "Add panel" → "Add query"
3. Select PostgreSQL data source
4. Write SQL query:
   ```sql
   SELECT domain, COUNT(*) as user_count 
   FROM quiz_analytics 
   WHERE last_attempted_at > NOW() - INTERVAL '24 hours'
   GROUP BY domain;
   ```
5. Choose visualization (Graph, Table, Gauge, etc.)
6. Save dashboard

---

## Memory Scoring Algorithm

### Forgetting Curve (Ebbinghaus)
```
Memory Score = Current Score × e^(-days_since_review / 7)
```

### Initial Memory Score
```
If quiz_score < 60:
  memory_score = quiz_score × 0.8
Else:
  memory_score = 70 + min(30, (quiz_score - 60) × 1.5)
```

### Revision Urgency
```
forgetting_score = 100 - memory_score

If forgetting_score ≥ 60: HIGH urgency
If forgetting_score ≥ 35: MEDIUM urgency
Else: LOW urgency
```

### Spaced Repetition Intervals
```
Interval 1: 24 hours (1 day)
Interval 2: 72 hours (3 days)
Interval 3: 168 hours (1 week)
Interval 4: 720 hours (1 month)
```

---

## Testing Events

### Using cURL
```bash
# Test user login
curl -X POST http://localhost:3001/api/events/user-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "sessionId": "sess_abc123",
    "domain": "dsa"
  }'

# Test module quiz
curl -X POST http://localhost:3001/api/events/module-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "domain": "dsa",
    "module": "dsa-arrays",
    "moduleIndex": 0,
    "score": 85,
    "timeTakenSeconds": 420,
    "attempts": 1,
    "conceptsTested": ["Array Access"],
    "passed": true
  }'
```

### Using Kafka Console Producer
```bash
# Produce raw event to topic
docker exec -it kafka kafka-console-producer.sh \
  --broker-list localhost:9092 \
  --topic module_quiz_events

# Paste JSON event and press Enter
```

### Using Kafka Console Consumer
```bash
# Consume events from a topic
docker exec -it kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic module_quiz_events \
  --from-beginning
```

---

## Monitoring & Troubleshooting

### Check Kafka Topics
```bash
docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

### Check Topic Messages
```bash
docker exec kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic module_quiz_events \
  --max-messages 5
```

### View Consumer Groups
```bash
docker exec kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --list
```

### Check Consumer Lag
```bash
docker exec kafka kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group analytics-consumer-group \
  --describe
```

### PostgreSQL Query Examples
```sql
-- Recent quiz attempts
SELECT user_id, module, average_score, last_attempted_at
FROM quiz_analytics
ORDER BY last_attempted_at DESC
LIMIT 10;

-- Users needing revision
SELECT user_id, COUNT(*) as revisions_due
FROM memory_scores
WHERE revision_urgency = 'high'
GROUP BY user_id
ORDER BY revisions_due DESC;

-- Module difficulty (pass rate)
SELECT domain, module, 
  ROUND(AVG(CASE WHEN passed THEN 100 ELSE 0 END), 2) as pass_rate
FROM quiz_analytics
WHERE quiz_type = 'module'
GROUP BY domain, module
ORDER BY pass_rate ASC;

-- Daily engagement
SELECT DATE(last_activity_at) as date, COUNT(DISTINCT user_id) as users
FROM user_engagement
GROUP BY DATE(last_activity_at)
ORDER BY date DESC;
```

---

## Deployment Considerations

### Production Checklist
- [ ] Enable Kafka authentication (SASL)
- [ ] Enable SSL/TLS for Kafka
- [ ] Set up Prometheus for metrics
- [ ] Configure persistent volumes for Kafka & PostgreSQL
- [ ] Enable Grafana authentication
- [ ] Set up alerting thresholds
- [ ] Configure log aggregation (ELK, Loki)
- [ ] Set up automated backups
- [ ] Configure multi-broker Kafka cluster
- [ ] Enable Kafka topic compaction for state stores

### Scaling
- **More consumers**: Deploy multiple instances for parallel processing
- **More Kafka partitions**: Increase parallelism (set topics to 3+ partitions)
- **PostgreSQL replication**: Set up read replicas for analytics queries
- **Grafana**: Deploy behind load balancer

---

## API Reference

### Endpoint: POST /api/events/module-quiz
Publish module quiz completion

**Request Body**:
```json
{
  "userId": "string (required)",
  "domain": "string (required) - dsa|webdev|ai-ml",
  "module": "string (required) - module identifier",
  "moduleIndex": "number (optional, default: 0)",
  "score": "number (required) - 0-100",
  "timeTakenSeconds": "number (optional, default: 0)",
  "attempts": "number (optional, default: 1)",
  "conceptsTested": "string[] (optional)",
  "passed": "boolean (optional, calculated from score >= 60)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Module quiz event published"
}
```

### Endpoint: GET /api/events/health
Health check for event producer

**Response**:
```json
{
  "status": "healthy",
  "producer_connected": true,
  "timestamp": "2025-01-26T10:30:00Z"
}
```

---

## Hackathon Demo Script (10 minutes)

1. **Show Architecture** (1 min)
   - Display docs/analytics-architecture.md diagram
   - Explain event-driven decoupling

2. **Show Infrastructure** (2 min)
   - Open Kafka UI (localhost:8080)
   - Show topics and message flow
   - Open PgAdmin → show analytics schema

3. **Publish Test Events** (2 min)
   ```bash
   # Run test script
   npm run test:events
   ```
   - Show events flowing through Kafka UI
   - Explain consumer processing

4. **Show Analytics** (3 min)
   - Open Grafana (localhost:3000)
   - Navigate through dashboards
   - Show real-time updates
   - Query PostgreSQL for specific metrics

5. **Explain Spaced Repetition** (2 min)
   - Show memory_scores table
   - Explain forgetting curve algorithm
   - Show revision urgency calculation

---

## Common Issues & Solutions

### Kafka Connection Failed
```bash
# Check if Kafka is running
docker logs kafka

# Verify broker is reachable
docker exec kafka nc -zv localhost 9092
```

### PostgreSQL Connection Failed
```bash
# Check if PostgreSQL is running
docker logs postgres

# Verify credentials
psql postgresql://analytics:analytics123@localhost:5432/learning_platform
```

### Events Not Appearing in Grafana
1. Check consumer is running: `docker logs consumer`
2. Verify events are in Kafka: Use Kafka UI
3. Check PostgreSQL data: Run SQL queries
4. Refresh Grafana (Ctrl+Shift+R for hard refresh)

### Memory Score Not Updating
1. Verify memoryScoreConsumer is running
2. Check it's subscribed to correct topics
3. Look at consumer logs for errors
4. Manually run `SELECT calculate_memory_decay();`

---

## Next Steps

### For Hackathon
1. ✅ Basic event streaming working
2. ✅ Analytics aggregation in place
3. ✅ Dashboards showing real-time data
4. **Show impact**: Live demo with user interactions

### For Production
1. Add Prometheus metrics
2. Implement auto-scaling consumers
3. Add data retention policies
4. Set up alerting on key metrics
5. Implement event schema validation
6. Add distributed tracing
7. Set up backup/recovery procedures
