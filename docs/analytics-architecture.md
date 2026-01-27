# Event-Driven Analytics Architecture
## Learning Platform - Real-Time Monitoring & Analytics

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend / API Layer                      │
│            (User Interactions, Quiz Submissions, etc)            │
└────────────────────────┬────────────────────────────────────────┘
                         │ Events Published
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Apache Kafka (Message Bus)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Topics:                                                  │   │
│  │ • user_login_events                                     │   │
│  │ • learning_domain_selection_events                      │   │
│  │ • diagnostic_quiz_events                                │   │
│  │ • module_quiz_events                                    │   │
│  │ • module_completion_events                              │   │
│  │ • revision_recommendation_events                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                          │                    │
         │ Consumed by             │ Consumed by       │ Consumed by
         ▼                          ▼                   ▼
    ┌─────────────┐         ┌─────────────┐     ┌──────────────┐
    │ Analytics   │         │   Memory    │     │  Real-time   │
    │ Consumer    │         │   Score     │     │  Metrics     │
    │             │         │  Consumer   │     │  Aggregator  │
    └──────┬──────┘         └──────┬──────┘     └───────┬──────┘
           │                       │                    │
           └───────────────────────┼────────────────────┘
                                   ▼
                    ┌──────────────────────────┐
                    │   PostgreSQL Analytics DB │
                    │  ┌──────────────────────┐ │
                    │  │ quiz_analytics       │ │
                    │  │ memory_scores        │ │
                    │  │ revision_signals     │ │
                    │  │ user_engagement      │ │
                    │  └──────────────────────┘ │
                    └──────────────────────────┘
                                   │
                    ┌──────────────┴────────────┐
                    │                           │
                    ▼                           ▼
            ┌──────────────────┐       ┌──────────────────┐
            │ Grafana Dashboard│       │  Prometheus      │
            │ (Visualization)  │       │ (Metrics)        │
            └──────────────────┘       └──────────────────┘
```

---

## Kafka Configuration

### Single Broker Setup
- **Broker**: localhost:9092
- **Zookeeper**: localhost:2181
- **Partitions per topic**: 1 (hackathon scale)
- **Replication factor**: 1
- **Retention**: 7 days (events logged for analytics)

### Topics Definition

| Topic | Partitions | Retention | Purpose |
|-------|-----------|-----------|---------|
| `user_login_events` | 1 | 7d | User session tracking |
| `learning_domain_selection_events` | 1 | 7d | Domain choice analytics |
| `diagnostic_quiz_events` | 1 | 7d | Initial assessment data |
| `module_quiz_events` | 1 | 7d | Module performance data |
| `module_completion_events` | 1 | 7d | Progress tracking |
| `revision_recommendation_events` | 1 | 7d | Spaced repetition signals |

---

## Event Flow Diagram

```
User Logs In
    │
    ├─► user_login_events
    │       ▼
    │   [Analytics: Track DAU, Session Duration]
    │
    ▼
Select Domain
    │
    ├─► learning_domain_selection_events
    │       ▼
    │   [Analytics: Domain popularity]
    │
    ▼
Take Diagnostic Quiz
    │
    ├─► diagnostic_quiz_events
    │       ├─► [Analytics: Score distribution]
    │       └─► [Memory: Initialize baseline]
    │
    ▼
Complete Modules
    │
    ├─► module_quiz_events
    │       ├─► [Analytics: Module performance, time spent]
    │       └─► [Memory: Calculate forgetting score]
    │
    ├─► module_completion_events
    │       ├─► [Analytics: Progress tracking]
    │       └─► [Recommendations: Queue next module]
    │
    ▼
Memory Decay Interval
    │
    └─► revision_recommendation_events
            ├─► [Memory: Update urgency]
            └─► [Analytics: Revision signals]
```

---

## Event Lifecycle & Actors

### 1. **Event Publishers** (Frontend/API)
- Publish raw events to Kafka
- Minimal processing - just structured logging
- Use producer with retry logic (3 retries, exponential backoff)

### 2. **Kafka Brokers** (Message Bus)
- Store events temporarily
- Route to multiple consumers
- Decouple producers from consumers

### 3. **Analytics Consumer** (Batch Processor)
- Aggregates events every 10 seconds
- Updates quiz performance metrics
- Updates user engagement stats
- Writes to `quiz_analytics` table

### 4. **Memory Score Consumer** (Spaced Repetition Engine)
- Processes `module_quiz_events` and `module_completion_events`
- Calculates forgetting curve scores (Ebbinghaus-inspired)
- Generates revision urgency signals
- Writes to `memory_scores` table

### 5. **Grafana Dashboard** (Visualization)
- Real-time panels querying PostgreSQL
- Auto-refresh every 10 seconds
- Shows 4 key dashboards (see Grafana section)

---

## Database Schema

### quiz_analytics
```
Tracks per-module quiz performance
- user_id
- domain
- course
- module
- quiz_type (diagnostic|module)
- attempt_count
- average_score
- average_time_taken
- last_attempted_at
```

### memory_scores
```
Spaced repetition tracking per module
- user_id
- domain
- module
- current_score (0-100)
- forgetting_score (0-100)
- revision_urgency (high|medium|low)
- last_reviewed_at
- next_review_at
- decay_factor
```

### user_engagement
```
Aggregate engagement metrics
- user_id
- domain
- modules_started
- modules_completed
- total_quiz_attempts
- total_time_seconds
- last_activity_at
```

### revision_signals
```
Queue of scheduled revisions
- user_id
- module_id
- urgency_level (high|medium|low)
- scheduled_at
- reviewed_at (null until completed)
- created_at
```

---

## Data Flow Example: Quiz Submission

```
User completes module quiz with score 85%
    │
    ▼
Frontend publishes event:
{
  "user_id": "user123",
  "domain": "dsa",
  "module": "dsa-arrays",
  "event_type": "module_quiz_completed",
  "score": 85,
  "time_taken": 420,
  "timestamp": "2025-01-26T10:30:00Z"
}
    │
    ├─► kafka-producer sends to: module_quiz_events
    │       │
    │       ├─► [Analytics Consumer]
    │       │   - Aggregates all quiz attempts
    │       │   - Updates quiz_analytics.average_score
    │       │   - Updates quiz_analytics.attempt_count
    │       │
    │       └─► [Memory Score Consumer]
    │           - Score: 85 → confidence = 1.2 (85% / 70%)
    │           - Forgetting curve: next_review = now + (2 × confidence × interval)
    │           - Revision urgency: Calculate based on decay
    │           - Write to memory_scores table
    │
    ▼
Grafana pulls from PostgreSQL every 10s
    - Updates "Module Performance" panel
    - Updates "Forgetting Risk Trends" panel
```

---

## Hackathon Demo Talking Points

1. **Decoupling**: Kafka separates user interaction from analytics processing
   - Frontend doesn't wait for analytics to complete
   - Analytics can be processed in batches or real-time without blocking users

2. **Scalability**: Event-driven architecture scales horizontally
   - More consumer instances = faster analytics
   - Kafka persistence allows replay for debugging/recomputation

3. **Real-Time Insights**: Grafana dashboards update in real-time
   - Track engagement as it happens
   - Identify struggling students immediately (low revision urgency)
   - Monitor system health with event flow metrics

4. **Spaced Repetition**: Memory score consumer implements learning science
   - Ebbinghaus forgetting curve algorithms
   - Personalized review intervals
   - Prevents cognitive overload

5. **Observability**: Full audit trail of learning journey
   - Every action tracked and queryable
   - Enable A/B testing, cohort analysis, predictive modeling

---

## Deployment (Docker Compose)

```yaml
Services:
- zookeeper:2181 (Kafka coordination)
- kafka:9092 (Message broker)
- postgres:5432 (Analytics database)
- pgadmin:5050 (Database admin UI)
- grafana:3000 (Dashboards)
- node-producer:3001 (Event publisher service)
- node-consumers:3002-3003 (Analytics/Memory consumers)
```

All services startup with single command: `docker-compose up -d`

---

## Monitoring & Alerting

### Grafana Alerts (Future Enhancement)
- High forgetting risk > 50% of cohort → Recommend review materials
- Event lag > 5s → Consumer is slow, add more instances
- Quiz failure rate > 40% → Content difficulty too high

### Prometheus Metrics (Optional)
- `kafka_events_consumed_total{topic}` - Events processed per topic
- `consumer_lag{topic,consumer_group}` - Processing delay
- `analytics_db_write_duration_ms` - Database write performance

---

## Local Development Quick Start

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Create topics
docker exec kafka kafka-topics.sh --create --topic user_login_events --bootstrap-server localhost:9092

# 3. Start producer service
npm run start:producer

# 4. Start consumer services
npm run start:consumers

# 5. Access dashboards
# Grafana: http://localhost:3000 (admin/admin)
# PgAdmin: http://localhost:5050 (admin@example.com/admin)

# 6. Publish test event
curl -X POST http://localhost:3001/api/events/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "domain": "dsa",
    "module": "dsa-arrays",
    "score": 85,
    "time_taken": 300
  }'

# 7. Check Grafana dashboards (auto-refreshes)
# Should see event counts and analytics updated in real-time
```

---

## Files Generated

```
backend/
├── kafka/
│   ├── config.ts           # Kafka broker configuration
│   └── topics.json         # Topic definitions
├── events/
│   ├── schemas.json        # Event JSON schemas
│   ├── types.ts            # TypeScript event interfaces
│   └── index.ts            # Event factory functions
├── producers/
│   └── eventProducer.ts    # Kafka producer service
├── consumers/
│   ├── analyticsConsumer.ts    # Analytics processor
│   └── memoryScoreConsumer.ts  # Memory scoring engine
├── db/
│   ├── analyticsSchema.sql     # PostgreSQL schema
│   └── queries.ts              # SQL query builders
└── api/
    └── eventsRouter.ts         # REST API for publishing events

grafana/
├── dashboards/
│   └── learning-analytics.json  # Main dashboard definition
└── provisioning/
    ├── dashboards.yml           # Dashboard provisioning
    └── datasources.yml          # PostgreSQL data source

docker-compose.yml             # Local infrastructure setup
.env.example                   # Environment variables
```

---

## Success Metrics for Demo

✅ Kafka topics receive events in real-time  
✅ Analytics consumer aggregates and stores metrics  
✅ Memory score consumer updates revision urgency  
✅ Grafana dashboards show live data with <10s latency  
✅ Show event JSON in Kafka → data in PostgreSQL → visualization in Grafana  
✅ Demonstrate scalability by adding more consumer instances  

---

## Next Steps Beyond Hackathon

- Prometheus metrics export from consumers
- Kafka Schema Registry for event versioning
- Stream processing with Kafka Streams or Flink
- Machine learning for predictive urgency scoring
- Multi-region deployment with Kafka mirroring
- Real-time alerts to students about review deadlines
