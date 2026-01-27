"""
Quiz Request and Response Models
Pydantic schemas for data validation
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class QuizFormType(str, Enum):
    """Quiz form types"""
    PREREQUISITE = "prerequisite-quiz"
    MODULE_QUIZ = "module-quiz"
    MODULE_LEARN = "module-learn"


class DomainType(str, Enum):
    """Learning domains"""
    DSA = "dsa"
    WEB_DEV = "web-development"
    AI_ML = "ai-ml"


class SkillLevel(str, Enum):
    """Skill level classification"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class QuizSubmissionRequest(BaseModel):
    """Request model for quiz submission"""
    quiz_form: QuizFormType = Field(..., description="Type of quiz")
    quiz_type: Optional[str] = Field(None, description="Specific quiz identifier")
    domain: DomainType = Field(..., description="Learning domain")
    skill_level: Optional[SkillLevel] = Field(None, description="User skill level")
    user_id: str = Field(..., description="Unique user identifier")
    
    # Quiz data
    total_time: float = Field(..., description="Total time spent on quiz (seconds)")
    question_time: List[float] = Field(..., description="Time per question (seconds)")
    num_option_changes: List[int] = Field(..., description="Option changes per question")
    
    # Answers and scores
    answers: List[Dict[str, Any]] = Field(..., description="User answers")
    correct_answers: Optional[List[bool]] = Field(None, description="Correctness of each answer")
    
    # Additional behavioral data
    option_switching_pattern: Optional[List[List[str]]] = Field(
        None, 
        description="Pattern of option changes per question"
    )
    intuition_texts: Optional[List[str]] = Field(
        None,
        description="User explanations for their answers"
    )
    
    # Context
    module_id: Optional[str] = Field(None, description="Module identifier for module quizzes")
    course_id: Optional[str] = Field(None, description="Course identifier")
    concepts: Optional[List[str]] = Field(None, description="Concepts covered in quiz")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quiz_form": "prerequisite-quiz",
                "quiz_type": "diagnostic",
                "domain": "dsa",
                "skill_level": "intermediate",
                "user_id": "user_123",
                "total_time": 450.5,
                "question_time": [45.2, 60.1, 55.8, 70.3, 89.1],
                "num_option_changes": [2, 0, 3, 1, 4],
                "answers": [
                    {"question_id": "q1", "selected": "A", "correct": True},
                    {"question_id": "q2", "selected": "C", "correct": False}
                ],
                "concepts": ["arrays", "loops", "complexity"]
            }
        }


class RoadmapTopic(BaseModel):
    """Individual topic in roadmap"""
    topic_id: str
    topic_name: str
    description: str
    estimated_time: str
    difficulty: str
    priority: int
    concepts: List[str]
    prerequisites: Optional[List[str]] = []


class RoadmapResponse(BaseModel):
    """Response for prerequisite quiz - personalized roadmap"""
    status: str = "success"
    message: str
    user_id: str
    domain: DomainType
    skill_level: SkillLevel
    
    # Proficiency analysis
    proficiency_score: float = Field(..., description="Overall proficiency (0-1)")
    strengths: List[str] = Field(..., description="Strong concepts")
    weaknesses: List[str] = Field(..., description="Weak concepts")
    
    # Personalized roadmap
    roadmap: List[RoadmapTopic] = Field(..., description="Customized learning path")
    
    # Behavioral insights
    behavioral_analysis: Dict[str, Any] = Field(
        ...,
        description="Analysis of learning behavior"
    )
    
    recommended_start: str = Field(..., description="Recommended starting point")


class RevisionData(BaseModel):
    """Revision content for weak concepts"""
    concept: str
    explanation: str
    examples: List[str]
    practice_problems: Optional[List[str]] = []
    resources: Optional[List[Dict[str, str]]] = []


class ModuleQuizResponse(BaseModel):
    """Response for module quiz"""
    status: str = "success"
    message: str
    user_id: str
    module_id: str
    
    # Performance metrics
    score: float = Field(..., description="Quiz score (0-1)")
    passed: bool = Field(..., description="Whether user passed")
    time_performance: str = Field(..., description="Time performance rating")
    
    # Concept analysis
    strong_concepts: List[str]
    weak_concepts: List[str]
    
    # Revision recommendation
    revision_need: bool = Field(..., description="Whether revision is needed")
    revision_urgency: str = Field(..., description="Urgency level: immediate/soon/optional")
    
    # Revision data (if needed)
    data: Optional[List[RevisionData]] = Field(
        None,
        description="Targeted revision materials"
    )
    
    # Next steps
    next_action: str = Field(..., description="What user should do next")
    unlock_next_module: bool = Field(..., description="Whether to unlock next module")


class LearningContentRequest(BaseModel):
    """Request for learning content"""
    user_id: str
    domain: DomainType
    topic: str
    skill_level: SkillLevel
    module_id: Optional[str] = None
    format_preference: Optional[str] = Field("mixed", description="video/text/mixed")
    weak_concepts: Optional[List[str]] = Field(None, description="Concepts to focus on")


class LearningModule(BaseModel):
    """Learning module content"""
    module_id: str
    title: str
    tldr: str
    content_type: str  # video, text, mixed
    
    # Content
    video_links: Optional[List[Dict[str, str]]] = []
    text_content: Optional[str] = None
    key_concepts: List[str]
    
    # Learning aids
    examples: List[str]
    practice_exercises: Optional[List[str]] = []
    additional_resources: Optional[List[Dict[str, str]]] = []


class LearningContentResponse(BaseModel):
    """Response for learning content"""
    status: str = "success"
    message: str
    user_id: str
    domain: DomainType
    topic: str
    
    # Generated content
    module: LearningModule
    
    # Personalization
    personalization_notes: str = Field(
        ...,
        description="Why this content was chosen for the user"
    )
    estimated_time: str


class ErrorResponse(BaseModel):
    """Error response model"""
    status: str = "error"
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
