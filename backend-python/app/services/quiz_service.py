"""
Quiz Processing Service
Handles quiz analysis, scoring, and decision-making logic
"""
from typing import Dict, Any, List, Tuple
import statistics
from datetime import datetime

from app.models.quiz_models import (
    QuizSubmissionRequest,
    RoadmapResponse,
    ModuleQuizResponse,
    RoadmapTopic,
    RevisionData,
    SkillLevel
)
from app.services.adk_agent_service import ADKAgentService
from app.core.config import settings


class QuizService:
    """Service for quiz processing and analysis"""
    
    def __init__(self):
        self.adk_service = ADKAgentService()
        self.adk_enabled = settings.ADK_ENABLED
        self.pass_threshold = settings.PASS_THRESHOLD
        self.revision_threshold = settings.REVISION_THRESHOLD
    
    async def process_prerequisite_quiz(
        self, 
        request: QuizSubmissionRequest
    ) -> RoadmapResponse:
        """
        Process prerequisite/diagnostic quiz and generate personalized roadmap
        
        Steps:
        1. Analyze quiz performance
        2. Calculate proficiency score
        3. Identify strengths and weaknesses
        4. Analyze behavioral patterns
        5. Generate personalized roadmap using ADK
        """
        # Calculate performance metrics
        accuracy = self._calculate_accuracy(request)
        time_analysis = self._analyze_time_patterns(request)
        behavioral_insights = await self.analyze_behavior(request)
        concept_analysis = self._analyze_concepts(request)
        
        # Calculate proficiency score (weighted)
        proficiency_score = self._calculate_proficiency(
            accuracy,
            time_analysis,
            behavioral_insights,
            concept_analysis
        )
        
        # Generate personalized roadmap using ADK
        roadmap = await self.adk_service.generate_roadmap(
            domain=request.domain,
            skill_level=request.skill_level or SkillLevel.INTERMEDIATE,
            proficiency_score=proficiency_score,
            strengths=concept_analysis["strong_concepts"],
            weaknesses=concept_analysis["weak_concepts"],
            behavioral_profile=behavioral_insights,
            user_id=request.user_id
        )
        
        # Determine recommended starting point
        recommended_start = self._determine_start_point(
            proficiency_score,
            concept_analysis["weak_concepts"]
        )
        
        return RoadmapResponse(
            status="success",
            message="Personalized roadmap generated successfully",
            user_id=request.user_id,
            domain=request.domain,
            skill_level=request.skill_level or SkillLevel.INTERMEDIATE,
            proficiency_score=proficiency_score,
            strengths=concept_analysis["strong_concepts"],
            weaknesses=concept_analysis["weak_concepts"],
            roadmap=roadmap,
            behavioral_analysis=behavioral_insights,
            recommended_start=recommended_start
        )
    
    async def process_module_quiz(
        self,
        request: QuizSubmissionRequest
    ) -> ModuleQuizResponse:
        """
        Process module quiz and determine if revision is needed
        
        Steps:
        1. Calculate quiz score
        2. Analyze concept mastery
        3. Determine if user passes
        4. Generate revision content if needed
        """
        # Calculate score
        accuracy = self._calculate_accuracy(request)
        time_performance = self._evaluate_time_performance(request)
        behavioral_insights = await self.analyze_behavior(request)
        concept_analysis = self._analyze_concepts(request)
        
        # Determine pass/fail
        passed = accuracy >= self.pass_threshold
        
        # Check if revision is needed
        revision_need = accuracy < self.revision_threshold or \
                       len(concept_analysis["weak_concepts"]) > len(request.concepts) * 0.3
        
        # Determine revision urgency
        if accuracy < 0.4:
            revision_urgency = "immediate"
        elif accuracy < self.revision_threshold:
            revision_urgency = "soon"
        else:
            revision_urgency = "optional"
        
        # Generate revision content if needed
        revision_data = None
        if revision_need and concept_analysis["weak_concepts"]:
            revision_data = await self.adk_service.generate_revision_content(
                domain=request.domain,
                weak_concepts=concept_analysis["weak_concepts"],
                module_id=request.module_id,
                user_id=request.user_id
            )
        
        # Determine next action
        if passed and not revision_need:
            next_action = "proceed_to_next_module"
        elif passed but revision_need:
            next_action = "optional_revision_then_proceed"
        else:
            next_action = "complete_revision_before_proceeding"
        
        return ModuleQuizResponse(
            status="success",
            message="Module quiz analyzed successfully",
            user_id=request.user_id,
            module_id=request.module_id or "unknown",
            score=accuracy,
            passed=passed,
            time_performance=time_performance,
            strong_concepts=concept_analysis["strong_concepts"],
            weak_concepts=concept_analysis["weak_concepts"],
            revision_need=revision_need,
            revision_urgency=revision_urgency,
            data=revision_data,
            next_action=next_action,
            unlock_next_module=passed
        )
    
    async def analyze_behavior(self, request: QuizSubmissionRequest) -> Dict[str, Any]:
        """
        Analyze quiz-taking behavioral patterns
        
        Analyzes:
        - Decision confidence (option changes)
        - Time management
        - Answer patterns
        - Intuition quality
        """
        # Option switching analysis
        total_changes = sum(request.num_option_changes)
        avg_changes = statistics.mean(request.num_option_changes) if request.num_option_changes else 0
        high_uncertainty_questions = sum(1 for x in request.num_option_changes if x > 2)
        
        # Time analysis
        avg_time = statistics.mean(request.question_time) if request.question_time else 0
        time_variance = statistics.stdev(request.question_time) if len(request.question_time) > 1 else 0
        rushed_questions = sum(1 for t in request.question_time if t < avg_time * 0.5)
        
        # Confidence scoring
        confidence_score = self._calculate_confidence_score(
            request.num_option_changes,
            request.question_time
        )
        
        return {
            "confidence_score": confidence_score,
            "average_option_changes": round(avg_changes, 2),
            "total_option_changes": total_changes,
            "high_uncertainty_count": high_uncertainty_questions,
            "average_time_per_question": round(avg_time, 2),
            "time_variance": round(time_variance, 2),
            "rushed_questions": rushed_questions,
            "decision_pattern": self._classify_decision_pattern(avg_changes, confidence_score),
            "time_management": self._classify_time_management(avg_time, time_variance),
            "overall_behavior_profile": self._generate_behavior_profile(
                confidence_score,
                avg_changes,
                avg_time
            )
        }
    
    def _calculate_accuracy(self, request: QuizSubmissionRequest) -> float:
        """Calculate quiz accuracy"""
        if not request.correct_answers:
            # If correctness not provided, estimate from answers
            return 0.0
        
        correct_count = sum(1 for is_correct in request.correct_answers if is_correct)
        total = len(request.correct_answers)
        return correct_count / total if total > 0 else 0.0
    
    def _analyze_time_patterns(self, request: QuizSubmissionRequest) -> Dict[str, float]:
        """Analyze time-related patterns"""
        if not request.question_time:
            return {"average": 0.0, "variance": 0.0, "efficiency": 0.5}
        
        avg_time = statistics.mean(request.question_time)
        variance = statistics.stdev(request.question_time) if len(request.question_time) > 1 else 0
        
        # Efficiency score (lower time with consistency is better)
        efficiency = 1.0 / (1.0 + (avg_time / 60.0))  # Normalize around 60 seconds
        
        return {
            "average": avg_time,
            "variance": variance,
            "efficiency": efficiency
        }
    
    def _analyze_concepts(self, request: QuizSubmissionRequest) -> Dict[str, List[str]]:
        """Analyze concept-level performance"""
        if not request.concepts or not request.correct_answers:
            return {"strong_concepts": [], "weak_concepts": []}
        
        # Map concepts to performance
        concept_performance: Dict[str, List[bool]] = {}
        
        for i, answer in enumerate(request.answers):
            if i < len(request.concepts):
                concept = request.concepts[i]
                is_correct = request.correct_answers[i] if i < len(request.correct_answers) else False
                
                if concept not in concept_performance:
                    concept_performance[concept] = []
                concept_performance[concept].append(is_correct)
        
        # Classify concepts
        strong_concepts = []
        weak_concepts = []
        
        for concept, results in concept_performance.items():
            accuracy = sum(results) / len(results)
            if accuracy >= 0.7:
                strong_concepts.append(concept)
            elif accuracy < 0.5:
                weak_concepts.append(concept)
        
        return {
            "strong_concepts": strong_concepts,
            "weak_concepts": weak_concepts
        }
    
    def _calculate_proficiency(
        self,
        accuracy: float,
        time_analysis: Dict[str, float],
        behavioral_insights: Dict[str, Any],
        concept_analysis: Dict[str, List[str]]
    ) -> float:
        """Calculate overall proficiency score (weighted)"""
        # Weights
        accuracy_weight = 0.5
        confidence_weight = 0.2
        time_weight = 0.15
        concept_weight = 0.15
        
        # Normalize scores
        confidence_score = behavioral_insights.get("confidence_score", 0.5)
        time_score = time_analysis.get("efficiency", 0.5)
        
        # Concept mastery score
        total_concepts = len(concept_analysis["strong_concepts"]) + len(concept_analysis["weak_concepts"])
        concept_score = len(concept_analysis["strong_concepts"]) / total_concepts if total_concepts > 0 else 0.5
        
        proficiency = (
            accuracy * accuracy_weight +
            confidence_score * confidence_weight +
            time_score * time_weight +
            concept_score * concept_weight
        )
        
        return round(proficiency, 3)
    
    def _calculate_confidence_score(
        self,
        option_changes: List[int],
        question_times: List[float]
    ) -> float:
        """Calculate decision confidence score"""
        if not option_changes:
            return 0.5
        
        # Lower changes = higher confidence
        avg_changes = statistics.mean(option_changes)
        confidence_from_changes = 1.0 / (1.0 + avg_changes)
        
        # Moderate time suggests thoughtful confidence
        avg_time = statistics.mean(question_times) if question_times else 30
        time_confidence = 1.0 - abs(avg_time - 45) / 100  # Optimal around 45 seconds
        time_confidence = max(0, min(1, time_confidence))
        
        return round((confidence_from_changes * 0.7 + time_confidence * 0.3), 3)
    
    def _classify_decision_pattern(self, avg_changes: float, confidence: float) -> str:
        """Classify decision-making pattern"""
        if avg_changes < 1 and confidence > 0.7:
            return "confident_and_decisive"
        elif avg_changes < 1:
            return "quick_decider"
        elif avg_changes > 2 and confidence < 0.5:
            return "uncertain_and_hesitant"
        elif avg_changes > 2:
            return "analytical_overthinker"
        else:
            return "balanced_decision_maker"
    
    def _classify_time_management(self, avg_time: float, variance: float) -> str:
        """Classify time management style"""
        if avg_time < 30 and variance < 10:
            return "fast_and_consistent"
        elif avg_time < 30:
            return "rushed"
        elif avg_time > 90:
            return "slow_and_careful"
        elif variance > 30:
            return "inconsistent"
        else:
            return "well_paced"
    
    def _generate_behavior_profile(
        self,
        confidence: float,
        avg_changes: float,
        avg_time: float
    ) -> str:
        """Generate overall behavioral profile description"""
        if confidence > 0.7 and avg_changes < 1.5:
            return "Strong learner with high confidence and decisive thinking"
        elif confidence < 0.4 and avg_changes > 3:
            return "Needs confidence building; shows significant uncertainty"
        elif avg_time > 90:
            return "Careful and methodical; takes time to analyze"
        elif avg_time < 30:
            return "Quick thinker; may benefit from slowing down"
        else:
            return "Balanced learner with moderate confidence"
    
    def _determine_start_point(
        self,
        proficiency: float,
        weak_concepts: List[str]
    ) -> str:
        """Determine recommended starting point in roadmap"""
        if proficiency > 0.8:
            return "advanced_topics"
        elif proficiency > 0.6:
            return "intermediate_topics"
        elif weak_concepts:
            return f"fundamentals_focusing_on_{weak_concepts[0]}"
        else:
            return "basics"
    
    def _evaluate_time_performance(self, request: QuizSubmissionRequest) -> str:
        """Evaluate time performance"""
        if not request.question_time:
            return "unknown"
        
        avg_time = statistics.mean(request.question_time)
        
        if avg_time < 30:
            return "very_fast"
        elif avg_time < 60:
            return "optimal"
        elif avg_time < 90:
            return "moderate"
        else:
            return "slow"
