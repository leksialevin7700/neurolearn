"""
Test Suite for Quiz Service
"""
import pytest
from app.services.quiz_service import QuizService
from app.models.quiz_models import (
    QuizSubmissionRequest,
    QuizFormType,
    DomainType,
    SkillLevel
)


@pytest.fixture
def quiz_service():
    return QuizService()


@pytest.fixture
def sample_prerequisite_request():
    return QuizSubmissionRequest(
        quiz_form=QuizFormType.PREREQUISITE,
        quiz_type="diagnostic",
        domain=DomainType.DSA,
        skill_level=SkillLevel.INTERMEDIATE,
        user_id="test_user_123",
        total_time=300.0,
        question_time=[45.0, 60.0, 55.0, 70.0, 70.0],
        num_option_changes=[1, 0, 2, 3, 1],
        answers=[
            {"question_id": "q1", "selected": "A", "correct": True},
            {"question_id": "q2", "selected": "B", "correct": True},
            {"question_id": "q3", "selected": "C", "correct": False},
            {"question_id": "q4", "selected": "A", "correct": True},
            {"question_id": "q5", "selected": "D", "correct": True}
        ],
        correct_answers=[True, True, False, True, True],
        concepts=["arrays", "loops", "complexity", "arrays", "loops"]
    )


@pytest.fixture
def sample_module_request():
    return QuizSubmissionRequest(
        quiz_form=QuizFormType.MODULE_QUIZ,
        domain=DomainType.DSA,
        user_id="test_user_123",
        module_id="module_1",
        total_time=200.0,
        question_time=[30.0, 40.0, 35.0, 45.0, 50.0],
        num_option_changes=[0, 1, 2, 0, 3],
        answers=[
            {"question_id": "q1", "selected": "A", "correct": True},
            {"question_id": "q2", "selected": "B", "correct": False},
            {"question_id": "q3", "selected": "C", "correct": True},
            {"question_id": "q4", "selected": "D", "correct": False},
            {"question_id": "q5", "selected": "A", "correct": True}
        ],
        correct_answers=[True, False, True, False, True],
        concepts=["arrays", "sorting", "searching", "complexity", "recursion"]
    )


class TestQuizService:
    """Test quiz service functionality"""
    
    @pytest.mark.asyncio
    async def test_process_prerequisite_quiz(self, quiz_service, sample_prerequisite_request):
        """Test prerequisite quiz processing"""
        response = await quiz_service.process_prerequisite_quiz(sample_prerequisite_request)
        
        assert response.status == "success"
        assert response.user_id == "test_user_123"
        assert response.domain == DomainType.DSA
        assert 0 <= response.proficiency_score <= 1
        assert isinstance(response.roadmap, list)
        assert len(response.roadmap) > 0
        assert isinstance(response.behavioral_analysis, dict)
    
    @pytest.mark.asyncio
    async def test_process_module_quiz_pass(self, quiz_service, sample_module_request):
        """Test module quiz with passing score"""
        response = await quiz_service.process_module_quiz(sample_module_request)
        
        assert response.status == "success"
        assert response.user_id == "test_user_123"
        assert 0 <= response.score <= 1
        assert isinstance(response.passed, bool)
        assert isinstance(response.revision_need, bool)
        assert response.revision_urgency in ["immediate", "soon", "optional"]
    
    @pytest.mark.asyncio
    async def test_analyze_behavior(self, quiz_service, sample_prerequisite_request):
        """Test behavioral analysis"""
        analysis = await quiz_service.analyze_behavior(sample_prerequisite_request)
        
        assert "confidence_score" in analysis
        assert "average_option_changes" in analysis
        assert "decision_pattern" in analysis
        assert "time_management" in analysis
        assert 0 <= analysis["confidence_score"] <= 1
    
    def test_calculate_accuracy(self, quiz_service, sample_prerequisite_request):
        """Test accuracy calculation"""
        accuracy = quiz_service._calculate_accuracy(sample_prerequisite_request)
        
        assert 0 <= accuracy <= 1
        assert accuracy == 0.8  # 4 out of 5 correct
    
    def test_analyze_concepts(self, quiz_service, sample_module_request):
        """Test concept analysis"""
        analysis = quiz_service._analyze_concepts(sample_module_request)
        
        assert "strong_concepts" in analysis
        assert "weak_concepts" in analysis
        assert isinstance(analysis["strong_concepts"], list)
        assert isinstance(analysis["weak_concepts"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
