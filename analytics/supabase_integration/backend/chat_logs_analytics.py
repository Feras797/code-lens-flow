#!/usr/bin/env python3
"""
Claude Chat Logs Analytics System
Analyzes structured chat logs for CodeLens team coordination
Works with the claude_chat_logs JSON schema
"""

import json
import re
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict, Counter
import statistics
from uuid import UUID

@dataclass
class ChatInteraction:
    """Single chat interaction from the database"""
    id: str
    user_query: str
    claude_response: str
    user_id: str
    project_id: str
    interaction_timestamp: datetime
    created_at: datetime
    updated_at: datetime

@dataclass
class ConversationSession:
    """Group of related interactions forming a conversation"""
    session_id: str
    user_id: str
    project_id: str
    interactions: List[ChatInteraction]
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    files_mentioned: List[str]
    features_discussed: List[str]
    problems_encountered: List[str]
    solutions_found: List[str]
    success_indicators: int
    stuck_indicators: int

@dataclass
class DeveloperActivity:
    """Current developer activity status"""
    user_id: str
    project_id: str
    current_task: str
    status: str  # "flow", "slow", "stuck", "idle"
    last_activity: datetime
    duration_minutes: int
    files_working_on: List[str]
    recent_problems: List[str]
    iteration_count: int
    success_rate: float

class ChatLogsAnalyzer:
    """Analyzes structured chat logs for objective metrics"""
    
    def __init__(self):
        # Objective indicators (no subjective scoring)
        self.success_indicators = [
            "works", "perfect", "done", "completed", "success", "fixed",
            "great", "exactly", "solved", "working now", "that's it",
            "perfect!", "excellent", "thank you", "brilliant"
        ]
        
        self.stuck_indicators = [
            "still not working", "same error", "tried everything",
            "doesn't work", "keep getting", "still failing", "won't work",
            "same issue", "no luck", "still broken"
        ]
        
        self.problem_indicators = [
            "error", "bug", "issue", "problem", "fail", "broken",
            "not working", "doesn't work", "exception", "crash"
        ]
        
        # File extraction patterns
        self.file_patterns = [
            r'(\w+\.\w+)',  # filename.ext
            r'(/[\w/\-\.]+\.\w+)',  # path/to/file.ext
            r'(\w+/\w+)',  # folder/file
            r'`([^`]+\.\w+)`',  # `filename.ext`
        ]
        
        # Feature extraction patterns
        self.feature_patterns = [
            r'\b(auth|authentication|login|signup|logout)\b',
            r'\b(payment|stripe|billing|checkout)\b',
            r'\b(user|profile|account|registration)\b',
            r'\b(api|endpoint|route|controller)\b',
            r'\b(database|db|sql|query|migration)\b',
            r'\b(dashboard|admin|panel)\b',
            r'\b(email|notification|alert)\b',
            r'\b(search|filter|sort)\b',
        ]
    
    def parse_chat_logs(self, chat_logs: List[Dict]) -> List[ChatInteraction]:
        """Parse chat logs from JSON schema format"""
        interactions = []
        
        for log in chat_logs:
            interaction = ChatInteraction(
                id=log['id'],
                user_query=log['user_query'],
                claude_response=log['claude_response'],
                user_id=log['user_id'],
                project_id=log['project_id'],
                interaction_timestamp=datetime.fromisoformat(log['interaction_timestamp'].replace('Z', '+00:00')),
                created_at=datetime.fromisoformat(log['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(log['updated_at'].replace('Z', '+00:00'))
            )
            interactions.append(interaction)
        
        return interactions
    
    def group_into_sessions(self, interactions: List[ChatInteraction], 
                           session_gap_minutes: int = 30) -> List[ConversationSession]:
        """Group interactions into conversation sessions"""
        
        # Group by user and project
        user_project_interactions = defaultdict(list)
        for interaction in interactions:
            key = (interaction.user_id, interaction.project_id)
            user_project_interactions[key].append(interaction)
        
        sessions = []
        
        for (user_id, project_id), user_interactions in user_project_interactions.items():
            # Sort by timestamp
            user_interactions.sort(key=lambda x: x.interaction_timestamp)
            
            # Group into sessions based on time gaps
            current_session = []
            session_counter = 1
            
            for interaction in user_interactions:
                if (current_session and 
                    (interaction.interaction_timestamp - current_session[-1].interaction_timestamp).total_seconds() > session_gap_minutes * 60):
                    
                    # Save current session
                    if current_session:
                        session = self._create_session(current_session, user_id, project_id, session_counter)
                        sessions.append(session)
                        session_counter += 1
                    
                    # Start new session
                    current_session = [interaction]
                else:
                    current_session.append(interaction)
            
            # Don't forget the last session
            if current_session:
                session = self._create_session(current_session, user_id, project_id, session_counter)
                sessions.append(session)
        
        return sessions
    
    def _create_session(self, interactions: List[ChatInteraction], 
                       user_id: str, project_id: str, session_num: int) -> ConversationSession:
        """Create a conversation session from interactions"""
        
        start_time = interactions[0].interaction_timestamp
        end_time = interactions[-1].interaction_timestamp
        duration = int((end_time - start_time).total_seconds() / 60)
        
        # Extract files mentioned
        all_text = ' '.join([i.user_query + ' ' + i.claude_response for i in interactions])
        files_mentioned = self._extract_files(all_text)
        features_discussed = self._extract_features(all_text)
        
        # Extract problems and solutions
        problems = self._extract_problems([i.user_query for i in interactions])
        solutions = self._extract_solutions([i.claude_response for i in interactions])
        
        # Count success/stuck indicators
        success_count = self._count_indicators(all_text.lower(), self.success_indicators)
        stuck_count = self._count_indicators(all_text.lower(), self.stuck_indicators)
        
        session_id = f"{user_id}_{project_id}_{start_time.strftime('%Y%m%d_%H%M%S')}_{session_num}"
        
        return ConversationSession(
            session_id=session_id,
            user_id=user_id,
            project_id=project_id,
            interactions=interactions,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=max(duration, 1),  # At least 1 minute
            files_mentioned=files_mentioned,
            features_discussed=features_discussed,
            problems_encountered=problems,
            solutions_found=solutions,
            success_indicators=success_count,
            stuck_indicators=stuck_count
        )
    
    def calculate_developer_status(self, sessions: List[ConversationSession], 
                                 user_id: str, project_id: str,
                                 lookback_hours: int = 2) -> DeveloperActivity:
        """Calculate current developer status from recent sessions"""
        
        # Filter recent sessions for this user/project
        from datetime import timezone
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=lookback_hours)
        recent_sessions = [
            s for s in sessions 
            if s.user_id == user_id and s.project_id == project_id 
            and s.end_time > cutoff_time
        ]
        
        if not recent_sessions:
            return DeveloperActivity(
                user_id=user_id,
                project_id=project_id,
                current_task="No recent activity",
                status="idle",
                last_activity=datetime.min.replace(tzinfo=timezone.utc),
                duration_minutes=0,
                files_working_on=[],
                recent_problems=[],
                iteration_count=0,
                success_rate=0.0
            )
        
        # Sort by recency
        recent_sessions.sort(key=lambda x: x.end_time, reverse=True)
        latest_session = recent_sessions[0]
        
        # Determine current task
        current_task = self._infer_current_task(latest_session)
        
        # Calculate objective status
        status = self._calculate_objective_status(recent_sessions)
        
        # Aggregate metrics
        total_interactions = sum(len(s.interactions) for s in recent_sessions)
        total_success = sum(s.success_indicators for s in recent_sessions)
        total_duration = sum(s.duration_minutes for s in recent_sessions)
        
        # Success rate calculation
        success_rate = total_success / max(total_interactions, 1)
        
        # Collect files and problems
        all_files = set()
        all_problems = []
        for session in recent_sessions:
            all_files.update(session.files_mentioned)
            all_problems.extend(session.problems_encountered)
        
        return DeveloperActivity(
            user_id=user_id,
            project_id=project_id,
            current_task=current_task,
            status=status,
            last_activity=latest_session.end_time,
            duration_minutes=total_duration,
            files_working_on=list(all_files)[:5],  # Top 5 files
            recent_problems=all_problems[-3:],  # Last 3 problems
            iteration_count=total_interactions,
            success_rate=success_rate
        )
    
    def detect_team_collisions(self, sessions: List[ConversationSession], 
                              project_id: str, 
                              lookback_hours: int = 2) -> List[Dict]:
        """Detect file/feature collisions between team members"""
        
        from datetime import timezone
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=lookback_hours)
        
        # Get recent sessions for this project
        recent_sessions = [
            s for s in sessions 
            if s.project_id == project_id and s.end_time > cutoff_time
        ]
        
        # Group by user
        user_activities = defaultdict(list)
        for session in recent_sessions:
            user_activities[session.user_id].append(session)
        
        collisions = []
        users = list(user_activities.keys())
        
        # Check for collisions between each pair of users
        for i, user1 in enumerate(users):
            for user2 in users[i+1:]:
                collision = self._check_collision(
                    user_activities[user1], 
                    user_activities[user2], 
                    user1, 
                    user2
                )
                if collision:
                    collisions.append(collision)
        
        return collisions
    
    def generate_team_dashboard_data(self, sessions: List[ConversationSession], 
                                   project_id: str) -> Dict:
        """Generate data for the live team dashboard"""
        
        # Get all users in this project
        project_sessions = [s for s in sessions if s.project_id == project_id]
        users = list(set(s.user_id for s in project_sessions))
        
        # Calculate status for each user
        team_status = []
        for user_id in users:
            activity = self.calculate_developer_status(sessions, user_id, project_id)
            team_status.append(activity)
        
        # Detect collisions
        collisions = self.detect_team_collisions(sessions, project_id)
        
        # Calculate project metrics
        from datetime import timezone
        cutoff_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        recent_sessions = [
            s for s in project_sessions 
            if s.end_time > cutoff_24h
        ]
        
        project_metrics = {
            'total_interactions_24h': sum(len(s.interactions) for s in recent_sessions),
            'active_developers': len([a for a in team_status if a.status != 'idle']),
            'files_being_worked_on': len(set().union(*[a.files_working_on for a in team_status])),
            'average_success_rate': statistics.mean([a.success_rate for a in team_status]) if team_status else 0
        }
        
        return {
            'project_id': project_id,
            'team_status': [self._activity_to_dict(a) for a in team_status],
            'collisions': collisions,
            'project_metrics': project_metrics,
            'last_updated': datetime.now(timezone.utc).isoformat()
        }
    
    def _extract_files(self, text: str) -> List[str]:
        """Extract file mentions from text"""
        files = set()
        for pattern in self.file_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            files.update(matches)
        
        # Filter out common false positives
        filtered_files = []
        for file in files:
            if ('.' in file and 
                len(file) > 2 and 
                not file.startswith('.') and
                file.lower() not in ['www.', 'http.', 'https.']):
                filtered_files.append(file)
        
        return list(set(filtered_files))[:10]  # Top 10 files
    
    def _extract_features(self, text: str) -> List[str]:
        """Extract feature mentions from text"""
        features = set()
        text_lower = text.lower()
        
        for pattern in self.feature_patterns:
            matches = re.findall(pattern, text_lower)
            features.update(matches)
        
        return list(features)
    
    def _extract_problems(self, user_queries: List[str]) -> List[str]:
        """Extract problem descriptions from user queries"""
        problems = []
        
        for query in user_queries:
            query_lower = query.lower()
            if any(indicator in query_lower for indicator in self.problem_indicators):
                problems.append(query[:100] + "..." if len(query) > 100 else query)
        
        return problems
    
    def _extract_solutions(self, claude_responses: List[str]) -> List[str]:
        """Extract solution descriptions from Claude responses"""
        solutions = []
        
        for response in claude_responses:
            response_lower = response.lower()
            if any(indicator in response_lower for indicator in self.success_indicators):
                solutions.append(response[:100] + "..." if len(response) > 100 else response)
        
        return solutions
    
    def _count_indicators(self, text: str, indicators: List[str]) -> int:
        """Count occurrences of indicators in text"""
        count = 0
        for indicator in indicators:
            count += text.count(indicator)
        return count
    
    def _infer_current_task(self, session: ConversationSession) -> str:
        """Infer current task from latest session"""
        if session.files_mentioned:
            return f"Working on {session.files_mentioned[0]}"
        elif session.features_discussed:
            return f"{session.features_discussed[0].title()} development"
        elif session.problems_encountered:
            problem = session.problems_encountered[-1]
            return f"Debugging: {problem[:50]}..."
        else:
            return "General development"
    
    def _calculate_objective_status(self, sessions: List[ConversationSession]) -> str:
        """Calculate objective status based on recent activity"""
        if not sessions:
            return "idle"
        
        latest_session = sessions[0]
        total_interactions = sum(len(s.interactions) for s in sessions)
        total_success = sum(s.success_indicators for s in sessions)
        total_stuck = sum(s.stuck_indicators for s in sessions)
        
        # Flow: Recent success, reasonable interaction count
        if total_success > 0 and total_interactions <= 6:
            return "flow"
        
        # Stuck: Multiple stuck indicators or many interactions with no success
        elif total_stuck > 1 or (total_interactions > 10 and total_success == 0):
            return "stuck"
        
        # Slow: High interaction count but some progress
        elif total_interactions > 6:
            return "slow"
        
        else:
            return "flow"
    
    def _check_collision(self, sessions1: List[ConversationSession], 
                        sessions2: List[ConversationSession],
                        user1: str, user2: str) -> Optional[Dict]:
        """Check for collision between two users' activities"""
        
        # Collect files and features from both users
        files1 = set()
        files2 = set()
        features1 = set()
        features2 = set()
        
        for session in sessions1:
            files1.update(session.files_mentioned)
            features1.update(session.features_discussed)
        
        for session in sessions2:
            files2.update(session.files_mentioned)
            features2.update(session.features_discussed)
        
        # Check for file collisions
        file_overlap = files1.intersection(files2)
        if file_overlap:
            return {
                'type': 'file_collision',
                'users': [user1, user2],
                'resource': list(file_overlap)[0],
                'confidence': 0.9,
                'detected_at': datetime.now(timezone.utc).isoformat(),
                'suggestion': f'Coordinate work on {list(file_overlap)[0]}'
            }
        
        # Check for feature collisions
        feature_overlap = features1.intersection(features2)
        if feature_overlap:
            return {
                'type': 'feature_collision',
                'users': [user1, user2],
                'resource': list(feature_overlap)[0],
                'confidence': 0.7,
                'detected_at': datetime.now(timezone.utc).isoformat(),
                'suggestion': f'Coordinate {list(feature_overlap)[0]} development'
            }
        
        return None
    
    def _activity_to_dict(self, activity: DeveloperActivity) -> Dict:
        """Convert DeveloperActivity to dictionary"""
        return {
            'user_id': activity.user_id,
            'project_id': activity.project_id,
            'current_task': activity.current_task,
            'status': activity.status,
            'last_activity': activity.last_activity.isoformat(),
            'duration_minutes': activity.duration_minutes,
            'files_working_on': activity.files_working_on,
            'recent_problems': activity.recent_problems,
            'iteration_count': activity.iteration_count,
            'success_rate': round(activity.success_rate, 2)
        }


# API Integration for CodeLens Frontend
class ChatLogsAPI:
    """API endpoints for CodeLens frontend"""
    
    def __init__(self, analyzer: ChatLogsAnalyzer):
        self.analyzer = analyzer
    
    def get_team_dashboard(self, project_id: str, chat_logs: List[Dict]) -> Dict:
        """Get team dashboard data"""
        interactions = self.analyzer.parse_chat_logs(chat_logs)
        sessions = self.analyzer.group_into_sessions(interactions)
        return self.analyzer.generate_team_dashboard_data(sessions, project_id)
    
    def get_developer_insights(self, user_id: str, project_id: str, 
                             chat_logs: List[Dict], days: int = 7) -> Dict:
        """Get individual developer insights"""
        # Filter logs by date range
        from datetime import timezone
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        recent_logs = [
            log for log in chat_logs 
            if datetime.fromisoformat(log['interaction_timestamp'].replace('Z', '+00:00')) > cutoff_date
            and log['user_id'] == user_id and log['project_id'] == project_id
        ]
        
        interactions = self.analyzer.parse_chat_logs(recent_logs)
        sessions = self.analyzer.group_into_sessions(interactions)
        
        # Calculate insights
        total_sessions = len(sessions)
        total_interactions = sum(len(s.interactions) for s in sessions)
        avg_session_length = statistics.mean([len(s.interactions) for s in sessions]) if sessions else 0
        
        # Common files and features
        all_files = []
        all_features = []
        for session in sessions:
            all_files.extend(session.files_mentioned)
            all_features.extend(session.features_discussed)
        
        return {
            'user_id': user_id,
            'project_id': project_id,
            'period_days': days,
            'total_sessions': total_sessions,
            'total_interactions': total_interactions,
            'avg_session_length': round(avg_session_length, 1),
            'most_worked_files': dict(Counter(all_files).most_common(5)),
            'focus_areas': dict(Counter(all_features).most_common(5)),
            'recent_activity': self.analyzer.calculate_developer_status(sessions, user_id, project_id)
        }


# Example usage
def main():
    """Example usage with structured chat logs"""
    
    # Example chat logs in the JSON schema format
    sample_chat_logs = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "user_query": "I'm getting a JWT authentication error in auth.js",
            "claude_response": "Let me help you debug the JWT authentication issue...",
            "user_id": "developer_1",
            "project_id": "ecommerce_app",
            "interaction_timestamp": "2024-01-15T10:30:00Z",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "user_query": "Still getting the same error after trying your suggestion",
            "claude_response": "Let's try a different approach. Can you check if...",
            "user_id": "developer_1",
            "project_id": "ecommerce_app",
            "interaction_timestamp": "2024-01-15T10:35:00Z",
            "created_at": "2024-01-15T10:35:00Z",
            "updated_at": "2024-01-15T10:35:00Z"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "user_query": "Perfect! That fixed it. The JWT is working now.",
            "claude_response": "Great! I'm glad we got the JWT authentication working.",
            "user_id": "developer_1",
            "project_id": "ecommerce_app",
            "interaction_timestamp": "2024-01-15T10:40:00Z",
            "created_at": "2024-01-15T10:40:00Z",
            "updated_at": "2024-01-15T10:40:00Z"
        }
    ]
    
    # Initialize analyzer
    analyzer = ChatLogsAnalyzer()
    api = ChatLogsAPI(analyzer)
    
    # Get team dashboard
    dashboard = api.get_team_dashboard("ecommerce_app", sample_chat_logs)
    
    print("🚀 Team Dashboard Data:")
    print(json.dumps(dashboard, indent=2, default=str))
    
    # Get developer insights
    insights = api.get_developer_insights("developer_1", "ecommerce_app", sample_chat_logs)
    
    print("\n👤 Developer Insights:")
    print(json.dumps(insights, indent=2, default=str))


if __name__ == "__main__":
    main()
