# NeuroLearn Backend

🚀 **Python FastAPI backend for NeuroLearn** - AI-powered adaptive learning platform

## 🏗️ Architecture

```
backend-python/
├── main.py                 # FastAPI application entry point
├── app/
│   ├── api/               # API routes
│   │   └── routes.py      # Quiz & learning endpoints
│   ├── models/            # Pydantic models
│   │   └── quiz_models.py # Request/response schemas
│   ├── services/          # Business logic
│   │   ├── quiz_service.py         # Quiz analysis
│   │   ├── learning_service.py     # Content generation
│   │   └── adk_agent_service.py   # ADK integration
│   └── core/              # Configuration
│       └── config.py      # Settings management
├── requirements.txt       # Dependencies
└── .env                   # Environment variables
```

## 🎯 Features

### Quiz Processing
- **Prerequisite Quiz**: Generates personalized roadmaps based on proficiency
- **Module Quiz**: Analyzes performance and recommends targeted revision
- **Behavioral Analysis**: Tracks decision patterns, time management, confidence

### AI Integration
- **ADK Agent Service**: Integrates with Agent Development Kit
- **Google Gemini**: Powers intelligent content generation
- **Mock Fallbacks**: Works without API keys for testing

### Smart Features
- Proficiency scoring with behavioral weighting
- Concept-level performance tracking
- Adaptive revision recommendations
- Personalized learning content generation

## 🚀 Quick Start

### 1. Setup Virtual Environment

```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `GEMINI_API_KEY`: Your Google Gemini API key (optional for testing)
- `PORT`: Server port (default: 8000)
- `ENVIRONMENT`: development/production

### 4. Run the Server

```bash
# Development mode (with auto-reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python main.py
```

Server will start at: **http://localhost:8000**

## 📡 API Endpoints

### Health Checks

```bash
GET /                     # Basic health check
GET /health              # Detailed health status
GET /api/v1/quiz/health  # Quiz service status
GET /api/v1/learning/health  # Learning service status
```

### Quiz Submission

```bash
POST /api/v1/quiz/submit
```

**Request Body:**
```json
{
  "quiz_form": "prerequisite-quiz",
  "quiz_type": "diagnostic",
  "domain": "dsa",
  "skill_level": "intermediate",
  "user_id": "user_123",
  "total_time": 450.5,
  "question_time": [45.2, 60.1, 55.8, 70.3, 89.1],
  "num_option_changes": [2, 0, 3, 1, 4],
  "answers": [
    {"question_id": "q1", "selected": "A", "correct": true}
  ],
  "correct_answers": [true, false, true, true, false],
  "concepts": ["arrays", "loops", "complexity"]
}
```

**Response (Prerequisite Quiz):**
```json
{
  "status": "success",
  "user_id": "user_123",
  "domain": "dsa",
  "proficiency_score": 0.75,
  "strengths": ["arrays", "loops"],
  "weaknesses": ["complexity"],
  "roadmap": [
    {
      "topic_id": "dsa_1",
      "topic_name": "Arrays and Strings",
      "description": "...",
      "estimated_time": "1-2 weeks",
      "difficulty": "intermediate",
      "priority": 1,
      "concepts": ["array traversal", "two pointers"]
    }
  ],
  "behavioral_analysis": {
    "confidence_score": 0.78,
    "decision_pattern": "balanced_decision_maker"
  },
  "recommended_start": "intermediate_topics"
}
```

**Response (Module Quiz):**
```json
{
  "status": "success",
  "user_id": "user_123",
  "module_id": "module_1",
  "score": 0.65,
  "passed": false,
  "revision_need": true,
  "revision_urgency": "soon",
  "weak_concepts": ["complexity", "recursion"],
  "data": [
    {
      "concept": "complexity",
      "explanation": "...",
      "examples": ["...", "..."],
      "practice_problems": ["..."]
    }
  ],
  "next_action": "complete_revision_before_proceeding",
  "unlock_next_module": false
}
```

### Learning Content Generation

```bash
POST /api/v1/learning/generate
```

**Request Body:**
```json
{
  "user_id": "user_123",
  "domain": "dsa",
  "topic": "Binary Search",
  "skill_level": "intermediate",
  "format_preference": "mixed",
  "weak_concepts": ["complexity analysis"]
}
```

**Response:**
```json
{
  "status": "success",
  "user_id": "user_123",
  "domain": "dsa",
  "topic": "Binary Search",
  "module": {
    "module_id": "dsa_binary_search",
    "title": "Mastering Binary Search",
    "tldr": "Learn efficient searching with O(log n) complexity",
    "content_type": "mixed",
    "video_links": [
      {
        "title": "Binary Search Explained",
        "url": "https://youtube.com/...",
        "duration": "15 min"
      }
    ],
    "text_content": "...",
    "key_concepts": ["binary search", "divide and conquer"],
    "examples": ["..."],
    "practice_exercises": ["..."]
  },
  "estimated_time": "30-45 minutes"
}
```

### Behavioral Analysis

```bash
POST /api/v1/quiz/analyze-behavior
```

Analyzes quiz-taking patterns including confidence, time management, and decision-making.

## 🧠 Behavioral Analytics

The system tracks and analyzes:

1. **Confidence Score**: Based on option changes and time spent
2. **Decision Patterns**:
   - `confident_and_decisive`
   - `quick_decider`
   - `uncertain_and_hesitant`
   - `analytical_overthinker`
   - `balanced_decision_maker`

3. **Time Management**:
   - `fast_and_consistent`
   - `rushed`
   - `slow_and_careful`
   - `inconsistent`
   - `well_paced`

4. **Concept Mastery**: Per-concept accuracy tracking

## 🎓 Proficiency Calculation

Weighted scoring algorithm:
- **Accuracy**: 50%
- **Confidence**: 20%
- **Time Efficiency**: 15%
- **Concept Mastery**: 15%

## 🔧 Configuration

Edit `app/core/config.py` or `.env`:

```python
# Quiz thresholds
PASS_THRESHOLD = 0.7      # 70% to pass module
REVISION_THRESHOLD = 0.5  # Below 50% needs revision

# AI settings
DEFAULT_MODEL = "gpt-4o-mini"
TEMPERATURE = 0.7
MAX_TOKENS = 2000
```

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_quiz_service.py
```

## 📦 Deployment

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./backend-python
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    env_file:
      - .env
```

## 🔍 Monitoring

The backend includes comprehensive logging:

```python
# Check logs for:
- API request/response times
- ADK agent calls
- Error tracking
- Performance metrics
```

## 🛠️ Development

### Code Style

```bash
# Format code
black app/

# Lint
flake8 app/

# Type checking
mypy app/
```

### Adding New Endpoints

1. Define models in `app/models/`
2. Create service logic in `app/services/`
3. Add routes in `app/api/routes.py`
4. Update this README

## 📚 Dependencies

Key packages:
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **Google Generative AI**: Gemini integration
- **Supabase**: Database client (optional)

## 🤝 Integration with Frontend

Frontend should send requests to:
- `POST /api/v1/quiz/submit` for quiz processing
- `POST /api/v1/learning/generate` for content generation

Enable CORS by adding frontend URL to `CORS_ORIGINS` in `.env`

## 🐛 Troubleshooting

**"Module not found" errors:**
```bash
pip install -r requirements.txt
```

**CORS issues:**
- Add frontend URL to `CORS_ORIGINS` in config

**ADK not working:**
- Set `ADK_ENABLED=True` in `.env`
- Add valid `GEMINI_API_KEY`
- System works with mock data if ADK unavailable

## 📝 License

Part of the NeuroLearn project

## 👥 Support

For issues or questions, check the main project repository.

---

Built with ❤️ for adaptive learning
