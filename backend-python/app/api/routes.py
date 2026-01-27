"""
Quiz and Learning Routes
Main API endpoints for quiz submission and learning content
"""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any

from app.models.quiz_models import (
    QuizSubmissionRequest,
    RoadmapResponse,
    ModuleQuizResponse,
    LearningContentRequest,
    LearningContentResponse,
    ErrorResponse,
    QuizFormType
)
from app.services.quiz_service import QuizService
from app.services.learning_service import LearningService

# Initialize routers
quiz_router = APIRouter()
learning_router = APIRouter()

# Initialize services
quiz_service = QuizService()
learning_service = LearningService()


@quiz_router.post(
    "/quiz/submit",
    response_model=RoadmapResponse | ModuleQuizResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def submit_quiz(request: QuizSubmissionRequest) -> Dict[str, Any]:
    """
    Submit quiz for processing
    
    Handles three quiz types:
    - prerequisite-quiz: Returns personalized roadmap
    - module-quiz: Returns performance analysis and revision needs
    - module-learn: Redirects to learning content generation
    """
    try:
        if request.quiz_form == QuizFormType.PREREQUISITE:
            # Process prerequisite quiz and generate roadmap
            response = await quiz_service.process_prerequisite_quiz(request)
            return response
            
        elif request.quiz_form == QuizFormType.MODULE_QUIZ:
            # Process module quiz and determine revision needs
            response = await quiz_service.process_module_quiz(request)
            return response
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid quiz_form type: {request.quiz_form}"
            )
            
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred processing the quiz: {str(e)}"
        )


@learning_router.post(
    "/learning/generate",
    response_model=LearningContentResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def generate_learning_content(request: LearningContentRequest) -> Dict[str, Any]:
    """
    Generate personalized learning content
    
    Uses ADK agents to create tailored learning materials based on:
    - Domain and topic
    - User skill level
    - Weak concepts (if any)
    - Content format preference
    """
    try:
        response = await learning_service.generate_learning_content(request)
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred generating content: {str(e)}"
        )


@quiz_router.get("/quiz/health")
async def quiz_health():
    """Quiz service health check"""
    return {
        "status": "healthy",
        "service": "quiz",
        "adk_status": "active" if quiz_service.adk_enabled else "disabled"
    }


@learning_router.get("/learning/health")
async def learning_health():
    """Learning service health check"""
    return {
        "status": "healthy",
        "service": "learning",
        "adk_status": "active" if learning_service.adk_enabled else "disabled"
    }


@quiz_router.post("/quiz/analyze-behavior")
async def analyze_quiz_behavior(request: QuizSubmissionRequest):
    """
    Analyze quiz-taking behavior
    
    Provides insights into:
    - Time management
    - Decision confidence
    - Option switching patterns
    - Answer intuition quality
    """
    try:
        analysis = await quiz_service.analyze_behavior(request)
        return {
            "status": "success",
            "user_id": request.user_id,
            "behavioral_analysis": analysis
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
