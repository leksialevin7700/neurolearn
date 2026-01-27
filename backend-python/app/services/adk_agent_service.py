"""
ADK Agent Service
Integration with Agent Development Kit for AI-powered content generation
"""
from typing import Dict, Any, List
import json
import os

from app.models.quiz_models import (
    RoadmapTopic,
    RevisionData,
    LearningModule,
    DomainType,
    SkillLevel
)
from app.core.config import settings


class ADKAgentService:
    """Service for ADK agent interactions"""
    
    def __init__(self):
        self.adk_enabled = settings.ADK_ENABLED
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.DEFAULT_MODEL
        self.temperature = settings.TEMPERATURE
        self.max_tokens = settings.MAX_TOKENS
        
        # Initialize ADK client if enabled
        if self.adk_enabled and self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model)
            except ImportError:
                print("⚠️  Google Generative AI package not installed. ADK features limited.")
                self.client = None
        else:
            self.client = None
    
    async def generate_roadmap(
        self,
        domain: DomainType,
        skill_level: SkillLevel,
        proficiency_score: float,
        strengths: List[str],
        weaknesses: List[str],
        behavioral_profile: Dict[str, Any],
        user_id: str
    ) -> List[RoadmapTopic]:
        """
        Generate personalized learning roadmap using ADK agent
        """
        if not self.client:
            # Return mock roadmap for testing
            return self._generate_mock_roadmap(domain, skill_level, weaknesses)
        
        # Create prompt for ADK agent
        prompt = self._create_roadmap_prompt(
            domain,
            skill_level,
            proficiency_score,
            strengths,
            weaknesses,
            behavioral_profile
        )
        
        try:
            # Call ADK agent with Gemini
            system_prompt = "You are an expert educational content designer specializing in personalized learning paths. Generate structured, detailed roadmaps in JSON format."
            full_prompt = f"{system_prompt}\n\n{prompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting."
            
            response = await self.client.generate_content_async(
                full_prompt,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens,
                }
            )
            
            # Parse response
            content = response.text.strip()
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            roadmap_data = json.loads(content)
            
            # Convert to RoadmapTopic objects
            roadmap = []
            for idx, topic in enumerate(roadmap_data.get("topics", [])):
                roadmap.append(RoadmapTopic(
                    topic_id=f"{domain}_{idx+1}",
                    topic_name=topic.get("name", ""),
                    description=topic.get("description", ""),
                    estimated_time=topic.get("estimated_time", "1-2 weeks"),
                    difficulty=topic.get("difficulty", "medium"),
                    priority=topic.get("priority", idx + 1),
                    concepts=topic.get("concepts", []),
                    prerequisites=topic.get("prerequisites", [])
                ))
            
            return roadmap
            
        except Exception as e:
            print(f"Error calling ADK agent: {e}")
            # Fallback to mock roadmap
            return self._generate_mock_roadmap(domain, skill_level, weaknesses)
    
    async def generate_revision_content(
        self,
        domain: DomainType,
        weak_concepts: List[str],
        module_id: str,
        user_id: str
    ) -> List[RevisionData]:
        """
        Generate targeted revision content for weak concepts
        """
        if not self.client:
            return self._generate_mock_revision(weak_concepts)
        
        prompt = self._create_revision_prompt(domain, weak_concepts, module_id)
        
        try:
            system_prompt = "You are an expert tutor creating targeted revision materials. Provide clear explanations, examples, and practice problems in JSON format."
            full_prompt = f"{system_prompt}\n\n{prompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting."
            
            response = await self.client.generate_content_async(
                full_prompt,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens,
                }
            )
            
            content = response.text.strip()
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            revision_data = json.loads(content)
            
            # Convert to RevisionData objects
            revisions = []
            for concept_data in revision_data.get("revisions", []):
                revisions.append(RevisionData(
                    concept=concept_data.get("concept", ""),
                    explanation=concept_data.get("explanation", ""),
                    examples=concept_data.get("examples", []),
                    practice_problems=concept_data.get("practice_problems", []),
                    resources=concept_data.get("resources", [])
                ))
            
            return revisions
            
        except Exception as e:
            print(f"Error generating revision content: {e}")
            return self._generate_mock_revision(weak_concepts)
    
    async def generate_learning_module(
        self,
        domain: DomainType,
        topic: str,
        skill_level: SkillLevel,
        format_preference: str,
        weak_concepts: List[str],
        user_id: str,
        module_id: str = None
    ) -> LearningModule:
        """
        Generate personalized learning module content
        """
        if not self.client:
            return self._generate_mock_module(topic, format_preference)
        
        prompt = self._create_module_prompt(
            domain,
            topic,
            skill_level,
            format_preference,
            weak_concepts
        )
        
        try:
            system_prompt = "You are an expert content creator for educational platforms. Create comprehensive, engaging learning modules in JSON format."
            full_prompt = f"{system_prompt}\n\n{prompt}\n\nIMPORTANT: Return ONLY valid JSON, no markdown formatting."
            
            response = await self.client.generate_content_async(
                full_prompt,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens,
                }
            )
            
            content = response.text.strip()
            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            module_data = json.loads(content)
            
            return LearningModule(
                module_id=module_id or f"{domain}_{topic.replace(' ', '_')}",
                title=module_data.get("title", topic),
                tldr=module_data.get("tldr", ""),
                content_type=format_preference,
                video_links=module_data.get("video_links", []),
                text_content=module_data.get("text_content"),
                key_concepts=module_data.get("key_concepts", []),
                examples=module_data.get("examples", []),
                practice_exercises=module_data.get("practice_exercises", []),
                additional_resources=module_data.get("additional_resources", [])
            )
            
        except Exception as e:
            print(f"Error generating learning module: {e}")
            return self._generate_mock_module(topic, format_preference)
    
    def _create_roadmap_prompt(
        self,
        domain: DomainType,
        skill_level: SkillLevel,
        proficiency_score: float,
        strengths: List[str],
        weaknesses: List[str],
        behavioral_profile: Dict[str, Any]
    ) -> str:
        """Create prompt for roadmap generation"""
        return f"""Generate a personalized learning roadmap for a {skill_level.value} learner in {domain.value}.

User Profile:
- Proficiency Score: {proficiency_score:.2f}/1.0
- Strengths: {', '.join(strengths) if strengths else 'None identified'}
- Weaknesses: {', '.join(weaknesses) if weaknesses else 'None identified'}
- Learning Style: {behavioral_profile.get('overall_behavior_profile', 'Balanced')}
- Decision Pattern: {behavioral_profile.get('decision_pattern', 'N/A')}

Requirements:
1. Create 5-8 topics tailored to their level and gaps
2. Prioritize weak areas while building on strengths
3. Include clear learning objectives and prerequisites
4. Estimate realistic time commitments
5. Structure for progressive difficulty

Return JSON with this structure:
{{
    "topics": [
        {{
            "name": "Topic Name",
            "description": "Detailed description",
            "estimated_time": "1-2 weeks",
            "difficulty": "beginner/intermediate/advanced",
            "priority": 1,
            "concepts": ["concept1", "concept2"],
            "prerequisites": ["prerequisite1"]
        }}
    ]
}}"""
    
    def _create_revision_prompt(
        self,
        domain: DomainType,
        weak_concepts: List[str],
        module_id: str
    ) -> str:
        """Create prompt for revision content generation"""
        return f"""Create targeted revision materials for {domain.value} concepts where the learner needs improvement.

Weak Concepts: {', '.join(weak_concepts)}
Module: {module_id}

For each concept, provide:
1. Clear, simplified explanation
2. 2-3 practical examples
3. 2-3 practice problems with hints
4. Recommended resources (videos, articles)

Return JSON:
{{
    "revisions": [
        {{
            "concept": "Concept Name",
            "explanation": "Clear explanation",
            "examples": ["example1", "example2"],
            "practice_problems": ["problem1", "problem2"],
            "resources": [
                {{"type": "video", "title": "...", "url": "..."}},
                {{"type": "article", "title": "...", "url": "..."}}
            ]
        }}
    ]
}}"""
    
    def _create_module_prompt(
        self,
        domain: DomainType,
        topic: str,
        skill_level: SkillLevel,
        format_preference: str,
        weak_concepts: List[str]
    ) -> str:
        """Create prompt for learning module generation"""
        focus = f"\nFocus areas: {', '.join(weak_concepts)}" if weak_concepts else ""
        
        return f"""Create a comprehensive learning module for {topic} in {domain.value}.

Learner Level: {skill_level.value}
Format Preference: {format_preference}{focus}

Include:
1. Engaging title and TL;DR summary
2. Core content (text explanation)
3. Key concepts list
4. 3-5 practical examples
5. Practice exercises
6. Video recommendations (if applicable)
7. Additional resources

Return JSON:
{{
    "title": "Module Title",
    "tldr": "Brief summary (2-3 sentences)",
    "text_content": "Comprehensive explanation",
    "key_concepts": ["concept1", "concept2"],
    "examples": ["example1", "example2"],
    "practice_exercises": ["exercise1", "exercise2"],
    "video_links": [
        {{"title": "Video Title", "url": "YouTube URL", "duration": "10 min"}}
    ],
    "additional_resources": [
        {{"type": "article", "title": "...", "url": "..."}}
    ]
}}"""
    
    def _generate_mock_roadmap(
        self,
        domain: DomainType,
        skill_level: SkillLevel,
        weaknesses: List[str]
    ) -> List[RoadmapTopic]:
        """Generate mock roadmap for testing"""
        roadmaps = {
            DomainType.DSA: [
                RoadmapTopic(
                    topic_id="dsa_1",
                    topic_name="Arrays and Strings",
                    description="Master array manipulation, string operations, and two-pointer techniques",
                    estimated_time="1-2 weeks",
                    difficulty="beginner",
                    priority=1,
                    concepts=["array traversal", "string manipulation", "two pointers"],
                    prerequisites=[]
                ),
                RoadmapTopic(
                    topic_id="dsa_2",
                    topic_name="Linked Lists",
                    description="Understand node-based data structures and pointer manipulation",
                    estimated_time="1 week",
                    difficulty="intermediate",
                    priority=2,
                    concepts=["singly linked list", "doubly linked list", "circular list"],
                    prerequisites=["dsa_1"]
                ),
                RoadmapTopic(
                    topic_id="dsa_3",
                    topic_name="Stacks and Queues",
                    description="Learn LIFO and FIFO data structures with real-world applications",
                    estimated_time="1 week",
                    difficulty="intermediate",
                    priority=3,
                    concepts=["stack operations", "queue operations", "deque"],
                    prerequisites=["dsa_1"]
                )
            ],
            DomainType.WEB_DEV: [
                RoadmapTopic(
                    topic_id="web_1",
                    topic_name="HTML & CSS Fundamentals",
                    description="Build responsive layouts with modern HTML5 and CSS3",
                    estimated_time="2 weeks",
                    difficulty="beginner",
                    priority=1,
                    concepts=["semantic HTML", "flexbox", "grid", "responsive design"],
                    prerequisites=[]
                ),
                RoadmapTopic(
                    topic_id="web_2",
                    topic_name="JavaScript Basics",
                    description="Master JavaScript fundamentals and DOM manipulation",
                    estimated_time="2-3 weeks",
                    difficulty="intermediate",
                    priority=2,
                    concepts=["variables", "functions", "DOM", "events"],
                    prerequisites=["web_1"]
                )
            ],
            DomainType.AI_ML: [
                RoadmapTopic(
                    topic_id="ai_1",
                    topic_name="Python for ML",
                    description="Learn Python essentials and ML libraries",
                    estimated_time="2 weeks",
                    difficulty="beginner",
                    priority=1,
                    concepts=["numpy", "pandas", "matplotlib"],
                    prerequisites=[]
                ),
                RoadmapTopic(
                    topic_id="ai_2",
                    topic_name="Linear Regression",
                    description="Understand supervised learning with regression",
                    estimated_time="1 week",
                    difficulty="intermediate",
                    priority=2,
                    concepts=["gradient descent", "cost function", "predictions"],
                    prerequisites=["ai_1"]
                )
            ]
        }
        
        return roadmaps.get(domain, roadmaps[DomainType.DSA])[:5]
    
    def _generate_mock_revision(self, weak_concepts: List[str]) -> List[RevisionData]:
        """Generate mock revision content"""
        revisions = []
        for concept in weak_concepts[:3]:
            revisions.append(RevisionData(
                concept=concept,
                explanation=f"Detailed explanation of {concept} with simplified approach",
                examples=[
                    f"Example 1: Basic {concept} application",
                    f"Example 2: Advanced {concept} use case"
                ],
                practice_problems=[
                    f"Practice problem 1 for {concept}",
                    f"Practice problem 2 for {concept}"
                ],
                resources=[
                    {"type": "video", "title": f"{concept} Tutorial", "url": "#"},
                    {"type": "article", "title": f"Understanding {concept}", "url": "#"}
                ]
            ))
        return revisions
    
    def _generate_mock_module(self, topic: str, format_preference: str) -> LearningModule:
        """Generate mock learning module"""
        return LearningModule(
            module_id=f"module_{topic.replace(' ', '_').lower()}",
            title=f"Mastering {topic}",
            tldr=f"A comprehensive guide to understanding {topic} with practical examples",
            content_type=format_preference,
            video_links=[
                {"title": f"{topic} Introduction", "url": "https://youtube.com/watch?v=example", "duration": "15 min"}
            ] if format_preference in ["video", "mixed"] else [],
            text_content=f"""
# Introduction to {topic}

{topic} is a fundamental concept that every developer should master.

## Key Points
- Understanding the basics
- Practical applications
- Best practices

## Deep Dive
[Detailed explanation would go here]
            """,
            key_concepts=[f"{topic} fundamentals", f"{topic} applications", f"{topic} best practices"],
            examples=[
                f"Example 1: Basic {topic} implementation",
                f"Example 2: Real-world {topic} use case",
                f"Example 3: Advanced {topic} pattern"
            ],
            practice_exercises=[
                f"Exercise 1: Implement {topic}",
                f"Exercise 2: Optimize {topic}"
            ],
            additional_resources=[
                {"type": "documentation", "title": f"Official {topic} Docs", "url": "#"}
            ]
        )
