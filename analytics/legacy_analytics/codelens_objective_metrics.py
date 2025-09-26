#!/usr/bin/env python3
"""
CodeLens Objective Analytics System
Evidence-based metrics without subjective scoring
Integrated into the CodeLens team coordination platform
"""

import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict, Counter
import statistics

@dataclass
class DeveloperStatus:
    """Real-time developer status for CodeLens team board"""
    name: str
    current_task: str
    status: str  # "flow", "slow", "stuck"
    duration_minutes: int
    files_mentioned: List[str]
    last_activity: datetime
    iteration_count: int
    success_signals: int
    error_signals: int

@dataclass
class TeamCollision:
    """Detected collision between team members"""
    developers: List[str]
    collision_type: str  # "file", "feature", "dependency"
    resource: str  # filename or feature name
    confidence: float
    detected_at: datetime

@dataclass
class ConversationContext:
    """Context extracted from a single conversation"""
    developer_id: str
    session_id: str
    start_time: datetime
    end_time: Optional[datetime]
    messages: List[Dict]
    files_mentioned: List[str]
    features_discussed: List[str]
    problems_encountered: List[str]
    solutions_found: List[str]
    iteration_count: int
    success_indicators: int
    stuck_indicators: int

class ObjectiveMetricsEngine:
    """
    Objective, measurable metrics without subjective scoring
    Focus on observable patterns and team coordination
    """
    
    def __init__(self):
        self.flow_indicators = [
            "works", "perfect", "done", "completed", "success", "fixed",
            "great", "exactly", "solved", "working now"
        ]
        
        self.stuck_indicators = [
            "still not working", "same error", "tried everything",
            "doesn't work", "keep getting", "still failing"
        ]
        
        self.file_patterns = [
            r'(\w+\.\w+)',  # filename.ext
            r'(/[\w/]+\.\w+)',  # path/to/file.ext
            r'(\w+/\w+)',  # folder/file
        ]
        
        self.feature_patterns = [
            r'(auth|authentication|login|signup)',
            r'(payment|stripe|billing)',
            r'(user|profile|account)',
            r'(api|endpoint|route)',
            r'(database|db|sql)',
            r'(dashboard|admin)',
        ]
    
    def extract_conversation_context(self, messages: List[Dict], developer_id: str) -> ConversationContext:
        """Extract objective context from conversation messages"""
        
        if not messages:
            return ConversationContext(
                developer_id=developer_id,
                session_id="",
                start_time=datetime.now(),
                end_time=None,
                messages=[],
                files_mentioned=[],
                features_discussed=[],
                problems_encountered=[],
                solutions_found=[],
                iteration_count=0,
                success_indicators=0,
                stuck_indicators=0
            )
        
        # Extract files mentioned
        files_mentioned = self._extract_files(messages)
        
        # Extract features discussed
        features_discussed = self._extract_features(messages)
        
        # Count iterations (user messages)
        user_messages = [msg for msg in messages if msg.get('role') == 'user']
        iteration_count = len(user_messages)
        
        # Count success/stuck indicators
        all_text = ' '.join([msg.get('content', '') for msg in messages]).lower()
        success_count = sum(1 for indicator in self.flow_indicators if indicator in all_text)
        stuck_count = sum(1 for indicator in self.stuck_indicators if indicator in all_text)
        
        # Extract problems and solutions
        problems = self._extract_problems(messages)
        solutions = self._extract_solutions(messages)
        
        return ConversationContext(
            developer_id=developer_id,
            session_id=messages[0].get('session_id', 'unknown'),
            start_time=datetime.now(),  # Would use actual timestamp from data
            end_time=None,
            messages=messages,
            files_mentioned=files_mentioned,
            features_discussed=features_discussed,
            problems_encountered=problems,
            solutions_found=solutions,
            iteration_count=iteration_count,
            success_indicators=success_count,
            stuck_indicators=stuck_count
        )
    
    def calculate_developer_status(self, recent_conversations: List[ConversationContext]) -> DeveloperStatus:
        """Calculate current developer status using objective metrics"""
        
        if not recent_conversations:
            return DeveloperStatus("Unknown", "No recent activity", "idle", 0, [], datetime.now(), 0, 0, 0)
        
        latest = recent_conversations[0]
        
        # Determine current task from most recent conversation
        current_task = self._infer_current_task(latest)
        
        # Calculate status based on objective indicators
        status = self._calculate_status(latest)
        
        # Estimate duration (would be actual time in real implementation)
        duration = self._estimate_duration(latest)
        
        # Aggregate metrics
        total_iterations = sum(conv.iteration_count for conv in recent_conversations)
        total_success = sum(conv.success_indicators for conv in recent_conversations)
        total_stuck = sum(conv.stuck_indicators for conv in recent_conversations)
        
        all_files = []
        for conv in recent_conversations:
            all_files.extend(conv.files_mentioned)
        
        return DeveloperStatus(
            name=latest.developer_id,
            current_task=current_task,
            status=status,
            duration_minutes=duration,
            files_mentioned=list(set(all_files)),
            last_activity=latest.start_time,
            iteration_count=total_iterations,
            success_signals=total_success,
            error_signals=total_stuck
        )
    
    def detect_team_collisions(self, team_contexts: List[ConversationContext]) -> List[TeamCollision]:
        """Detect collisions between team members"""
        collisions = []
        
        # Group by developer
        dev_contexts = defaultdict(list)
        for context in team_contexts:
            dev_contexts[context.developer_id].append(context)
        
        developers = list(dev_contexts.keys())
        
        # Check for file collisions
        for i, dev1 in enumerate(developers):
            for dev2 in developers[i+1:]:
                collision = self._check_file_collision(
                    dev_contexts[dev1], dev_contexts[dev2], dev1, dev2
                )
                if collision:
                    collisions.append(collision)
                
                # Check for feature collisions
                feature_collision = self._check_feature_collision(
                    dev_contexts[dev1], dev_contexts[dev2], dev1, dev2
                )
                if feature_collision:
                    collisions.append(feature_collision)
        
        return collisions
    
    def generate_team_status_board(self, team_contexts: List[ConversationContext]) -> Dict:
        """Generate the live team status board data"""
        
        # Group contexts by developer
        dev_contexts = defaultdict(list)
        for context in team_contexts:
            dev_contexts[context.developer_id].append(context)
        
        # Calculate status for each developer
        team_status = []
        for dev_id, contexts in dev_contexts.items():
            # Sort by recency (most recent first)
            recent_contexts = sorted(contexts, key=lambda x: x.start_time, reverse=True)[:3]
            status = self.calculate_developer_status(recent_contexts)
            team_status.append(status)
        
        # Detect collisions
        collisions = self.detect_team_collisions(team_contexts)
        
        return {
            'team_status': [self._status_to_dict(status) for status in team_status],
            'collisions': [self._collision_to_dict(collision) for collision in collisions],
            'last_updated': datetime.now().isoformat()
        }
    
    def _extract_files(self, messages: List[Dict]) -> List[str]:
        """Extract file mentions from messages"""
        files = set()
        
        for message in messages:
            content = message.get('content', '')
            for pattern in self.file_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                files.update(matches)
        
        return list(files)
    
    def _extract_features(self, messages: List[Dict]) -> List[str]:
        """Extract feature mentions from messages"""
        features = set()
        
        for message in messages:
            content = message.get('content', '').lower()
            for pattern in self.feature_patterns:
                matches = re.findall(pattern, content)
                features.update(matches)
        
        return list(features)
    
    def _extract_problems(self, messages: List[Dict]) -> List[str]:
        """Extract problem descriptions"""
        problems = []
        
        problem_indicators = ['error', 'bug', 'issue', 'problem', 'not working', 'failed']
        
        for message in messages:
            if message.get('role') == 'user':
                content = message.get('content', '').lower()
                if any(indicator in content for indicator in problem_indicators):
                    problems.append(content[:100])  # First 100 chars
        
        return problems
    
    def _extract_solutions(self, messages: List[Dict]) -> List[str]:
        """Extract solution descriptions"""
        solutions = []
        
        for message in messages:
            if message.get('role') == 'assistant':
                content = message.get('content', '')
                if any(indicator in content.lower() for indicator in self.flow_indicators):
                    solutions.append(content[:100])  # First 100 chars
        
        return solutions
    
    def _infer_current_task(self, context: ConversationContext) -> str:
        """Infer current task from conversation context"""
        if context.files_mentioned:
            return f"Working on {context.files_mentioned[0]}"
        elif context.features_discussed:
            return f"{context.features_discussed[0].title()} development"
        elif context.problems_encountered:
            return f"Debugging: {context.problems_encountered[-1][:50]}..."
        else:
            return "General development"
    
    def _calculate_status(self, context: ConversationContext) -> str:
        """Calculate developer status based on objective indicators"""
        
        # Flow: Recent success indicators, low iteration count
        if context.success_indicators > 0 and context.iteration_count <= 3:
            return "flow"
        
        # Stuck: Multiple stuck indicators or high iteration count with no success
        elif context.stuck_indicators > 1 or (context.iteration_count > 5 and context.success_indicators == 0):
            return "stuck"
        
        # Slow: High iteration count but some progress
        elif context.iteration_count > 3:
            return "slow"
        
        else:
            return "flow"
    
    def _estimate_duration(self, context: ConversationContext) -> int:
        """Estimate work duration in minutes"""
        # Simplified estimation based on iteration count
        # In real implementation, would use actual timestamps
        return context.iteration_count * 15  # Assume 15 min per iteration
    
    def _check_file_collision(self, contexts1: List[ConversationContext], 
                             contexts2: List[ConversationContext], 
                             dev1: str, dev2: str) -> Optional[TeamCollision]:
        """Check for file-level collisions between developers"""
        
        files1 = set()
        files2 = set()
        
        for context in contexts1:
            files1.update(context.files_mentioned)
        
        for context in contexts2:
            files2.update(context.files_mentioned)
        
        common_files = files1.intersection(files2)
        
        if common_files:
            return TeamCollision(
                developers=[dev1, dev2],
                collision_type="file",
                resource=list(common_files)[0],
                confidence=0.9,  # High confidence for file collisions
                detected_at=datetime.now()
            )
        
        return None
    
    def _check_feature_collision(self, contexts1: List[ConversationContext], 
                                contexts2: List[ConversationContext], 
                                dev1: str, dev2: str) -> Optional[TeamCollision]:
        """Check for feature-level collisions between developers"""
        
        features1 = set()
        features2 = set()
        
        for context in contexts1:
            features1.update(context.features_discussed)
        
        for context in contexts2:
            features2.update(context.features_discussed)
        
        common_features = features1.intersection(features2)
        
        if common_features:
            return TeamCollision(
                developers=[dev1, dev2],
                collision_type="feature",
                resource=list(common_features)[0],
                confidence=0.7,  # Medium confidence for feature collisions
                detected_at=datetime.now()
            )
        
        return None
    
    def _status_to_dict(self, status: DeveloperStatus) -> Dict:
        """Convert DeveloperStatus to dictionary"""
        return {
            'name': status.name,
            'current_task': status.current_task,
            'status': status.status,
            'duration_minutes': status.duration_minutes,
            'files_mentioned': status.files_mentioned,
            'last_activity': status.last_activity.isoformat(),
            'iteration_count': status.iteration_count,
            'success_signals': status.success_signals,
            'error_signals': status.error_signals
        }
    
    def _collision_to_dict(self, collision: TeamCollision) -> Dict:
        """Convert TeamCollision to dictionary"""
        return {
            'developers': collision.developers,
            'collision_type': collision.collision_type,
            'resource': collision.resource,
            'confidence': collision.confidence,
            'detected_at': collision.detected_at.isoformat()
        }


class CodeLensAnalyticsAPI:
    """API endpoints for CodeLens frontend integration"""
    
    def __init__(self, metrics_engine: ObjectiveMetricsEngine):
        self.metrics_engine = metrics_engine
    
    def get_team_status(self, project_id: str) -> Dict:
        """Get current team status for the live board"""
        # In real implementation, would fetch from database
        team_contexts = self._load_team_contexts(project_id)
        return self.metrics_engine.generate_team_status_board(team_contexts)
    
    def get_developer_insights(self, developer_id: str, days: int = 7) -> Dict:
        """Get personal development insights"""
        contexts = self._load_developer_contexts(developer_id, days)
        
        # Calculate objective metrics
        total_conversations = len(contexts)
        total_iterations = sum(c.iteration_count for c in contexts)
        success_rate = sum(c.success_indicators for c in contexts) / max(total_iterations, 1)
        
        # Extract patterns
        common_files = Counter()
        common_features = Counter()
        
        for context in contexts:
            common_files.update(context.files_mentioned)
            common_features.update(context.features_discussed)
        
        return {
            'developer_id': developer_id,
            'period_days': days,
            'total_conversations': total_conversations,
            'total_iterations': total_iterations,
            'success_rate': success_rate,
            'most_worked_files': dict(common_files.most_common(5)),
            'focus_areas': dict(common_features.most_common(5)),
            'recent_problems': [c.problems_encountered for c in contexts[-3:]],
            'recent_solutions': [c.solutions_found for c in contexts[-3:]]
        }
    
    def _load_team_contexts(self, project_id: str) -> List[ConversationContext]:
        """Load team conversation contexts (placeholder)"""
        # In real implementation, would load from database/file system
        return []
    
    def _load_developer_contexts(self, developer_id: str, days: int) -> List[ConversationContext]:
        """Load developer conversation contexts (placeholder)"""
        # In real implementation, would load from database/file system
        return []


# Example usage and integration
def main():
    """Example of how the system works"""
    
    # Initialize the metrics engine
    metrics_engine = ObjectiveMetricsEngine()
    
    # Example conversation data (would come from Claude chat parsing)
    example_messages = [
        {"role": "user", "content": "I'm working on auth.js and getting a JWT error"},
        {"role": "assistant", "content": "Let me help you debug the JWT issue..."},
        {"role": "user", "content": "Still not working, same error"},
        {"role": "assistant", "content": "Try this solution..."},
        {"role": "user", "content": "Perfect! That works now. Thanks!"}
    ]
    
    # Extract context
    context = metrics_engine.extract_conversation_context(example_messages, "developer_1")
    
    print("Extracted Context:")
    print(f"Files mentioned: {context.files_mentioned}")
    print(f"Features discussed: {context.features_discussed}")
    print(f"Iteration count: {context.iteration_count}")
    print(f"Success indicators: {context.success_indicators}")
    print(f"Stuck indicators: {context.stuck_indicators}")
    
    # Calculate developer status
    status = metrics_engine.calculate_developer_status([context])
    
    print(f"\nDeveloper Status:")
    print(f"Current task: {status.current_task}")
    print(f"Status: {status.status}")
    print(f"Duration: {status.duration_minutes} minutes")


if __name__ == "__main__":
    main()
