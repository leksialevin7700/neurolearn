"""
Learning Content Service
Handles learning material generation and personalization
"""
from typing import Dict, Any, List

from app.models.quiz_models import (
    LearningContentRequest,
    LearningContentResponse,
    LearningModule,
    DomainType,
    SkillLevel
)
from app.services.adk_agent_service import ADKAgentService
from app.core.config import settings


class LearningService:
    """Service for learning content generation"""
    
    def __init__(self):
        self.adk_service = ADKAgentService()
        self.adk_enabled = settings.ADK_ENABLED
    
    async def generate_learning_content(
        self,
        request: LearningContentRequest
    ) -> LearningContentResponse:
        """
        Generate personalized learning content
        
        Uses ADK agents to create tailored learning materials
        """
        # Generate learning module using ADK
        module = await self.adk_service.generate_learning_module(
            domain=request.domain,
            topic=request.topic,
            skill_level=request.skill_level,
            format_preference=request.format_preference or "mixed",
            weak_concepts=request.weak_concepts,
            user_id=request.user_id,
            module_id=request.module_id
        )
        
        # Estimate learning time
        estimated_time = self._estimate_learning_time(
            module,
            request.skill_level,
            request.weak_concepts
        )
        
        # Generate personalization notes
        personalization_notes = self._generate_personalization_notes(
            request,
            module
        )
        
        return LearningContentResponse(
            status="success",
            message="Learning content generated successfully",
            user_id=request.user_id,
            domain=request.domain,
            topic=request.topic,
            module=module,
            personalization_notes=personalization_notes,
            estimated_time=estimated_time
        )
    
    def _estimate_learning_time(
        self,
        module: LearningModule,
        skill_level: SkillLevel,
        weak_concepts: List[str] = None
    ) -> str:
        """Estimate time needed to complete module"""
        base_time = 30  # minutes
        
        # Adjust for skill level
        if skill_level == SkillLevel.BEGINNER:
            base_time += 15
        elif skill_level == SkillLevel.ADVANCED:
            base_time -= 10
        
        # Adjust for video content
        if module.video_links:
            base_time += len(module.video_links) * 10
        
        # Adjust for weak concepts
        if weak_concepts:
            base_time += len(weak_concepts) * 5
        
        if base_time < 30:
            return "20-30 minutes"
        elif base_time < 60:
            return "30-45 minutes"
        elif base_time < 90:
            return "45-60 minutes"
        else:
            return "1-2 hours"
    
    def _generate_personalization_notes(
        self,
        request: LearningContentRequest,
        module: LearningModule
    ) -> str:
        """Generate notes explaining why this content was chosen"""
        notes = []
        
        if request.skill_level == SkillLevel.BEGINNER:
            notes.append("Content simplified for beginners with foundational concepts")
        elif request.skill_level == SkillLevel.ADVANCED:
            notes.append("Advanced content with deeper technical insights")
        
        if request.weak_concepts:
            notes.append(f"Focusing on concepts: {', '.join(request.weak_concepts[:3])}")
        
        if request.format_preference == "video":
            notes.append("Prioritized video-based learning materials")
        elif request.format_preference == "text":
            notes.append("Prioritized text-based learning materials")
        
        return ". ".join(notes) if notes else "Standard content for your level"
