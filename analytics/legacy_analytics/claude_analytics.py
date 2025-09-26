#!/usr/bin/env python3
"""
Claude Desktop Analytics System
Analyzes .claude.json data to provide insights and recommendations
Based on the Claude Analytics Framework
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from collections import Counter, defaultdict
import statistics

@dataclass
class PastedContent:
    """Represents content pasted into Claude prompts"""
    id: str
    type: str  # 'image', 'file', 'text'
    content: Any
    metadata: Dict[str, Any] = None

@dataclass
class HistoryEntry:
    """Represents a single history entry from Claude Desktop"""
    display: str  # The user's prompt/command
    pasted_contents: List[PastedContent]
    timestamp: Optional[datetime] = None
    is_command: bool = False
    command_type: Optional[str] = None
    is_security_related: bool = False
    prompt_quality_score: float = 0.0
    coding_related: bool = False
    task_complexity: str = "unknown"  # simple, medium, complex

@dataclass
class ProjectData:
    """Represents data for a single project"""
    path: str
    history: List[HistoryEntry]
    mcp_servers: Dict[str, Any]
    usage_metrics: Dict[str, Any]
    security_patterns: List[str]
    prompt_effectiveness: Dict[str, float]
    anti_patterns: List[str]
    coding_patterns: List[str]

class ClaudeDesktopParser:
    """Parses Claude Desktop's .claude.json file for analytics"""
    
    def __init__(self, claude_json_path: str):
        self.claude_json_path = Path(claude_json_path)
        self.security_keywords = [
            'security', 'auth', 'login', 'password', 'token', 'encrypt',
            'validate', 'sanitize', 'permission', 'role', 'access',
            'csrf', 'xss', 'injection', 'vulnerability', 'secure',
            'authentication', 'authorization', 'oauth', 'jwt', 'ssl',
            'tls', 'https', 'hash', 'salt', 'session', 'cookie'
        ]
        
        self.coding_keywords = [
            'code', 'function', 'class', 'method', 'variable', 'bug',
            'debug', 'implement', 'create', 'build', 'develop', 'fix',
            'refactor', 'optimize', 'test', 'api', 'database', 'sql',
            'python', 'javascript', 'typescript', 'react', 'node',
            'git', 'commit', 'branch', 'merge', 'deploy', 'ci/cd'
        ]
        
        self.command_patterns = {
            'mcp': r'^/mcp\s*',
            'agents': r'^/agents\s*',
            'clear': r'^/clear\s*',
            'model': r'^/model\s*',
            'config': r'^/config\s*',
            'doctor': r'^/doctor\s*',
            'security-review': r'^/security-review\s*',
            'cost': r'^/cost\s*',
            'memory': r'^/memory\s*',
            'todo': r'^/todo\s*',
            'theme': r'^/theme\s*'
        }
        
        self.anti_patterns = {
            'vague_prompts': [r'^hi$', r'^hello$', r'^help$', r'^ok$', r'^yes$', r'^no$'],
            'repetitive_asks': [],  # Will be populated during analysis
            'context_neglect': [],  # Prompts without context when needed
            'over_complexity': [r'.*everything.*', r'.*all.*features.*', r'.*complete.*system.*']
        }
    
    def parse_claude_data(self) -> Dict[str, ProjectData]:
        """Parse the complete Claude Desktop data file"""
        with open(self.claude_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        projects = {}
        for project_path, project_info in data.get('projects', {}).items():
            projects[project_path] = self.parse_project_data(project_path, project_info)
        
        return projects
    
    def parse_project_data(self, project_path: str, project_info: Dict) -> ProjectData:
        """Parse data for a single project"""
        history_entries = []
        
        for entry in project_info.get('history', []):
            parsed_entry = self.parse_history_entry(entry)
            history_entries.append(parsed_entry)
        
        # Extract usage metrics
        usage_metrics = {
            'last_cost': project_info.get('lastCost', 0),
            'last_input_tokens': project_info.get('lastTotalInputTokens', 0),
            'last_output_tokens': project_info.get('lastTotalOutputTokens', 0),
            'last_duration': project_info.get('lastDuration', 0),
            'last_session_id': project_info.get('lastSessionId', ''),
            'lines_added': project_info.get('lastLinesAdded', 0),
            'lines_removed': project_info.get('lastLinesRemoved', 0),
            'allowed_tools': project_info.get('allowedTools', [])
        }
        
        # Analyze patterns
        security_patterns = self.extract_security_patterns(history_entries)
        coding_patterns = self.extract_coding_patterns(history_entries)
        anti_patterns = self.detect_anti_patterns(history_entries)
        prompt_effectiveness = self.analyze_prompt_effectiveness(history_entries, usage_metrics)
        
        return ProjectData(
            path=project_path,
            history=history_entries,
            mcp_servers=project_info.get('mcpServers', {}),
            usage_metrics=usage_metrics,
            security_patterns=security_patterns,
            prompt_effectiveness=prompt_effectiveness,
            anti_patterns=anti_patterns,
            coding_patterns=coding_patterns
        )
    
    def parse_history_entry(self, entry: Dict) -> HistoryEntry:
        """Parse a single history entry"""
        display_text = entry.get('display', '')
        pasted_contents = self.parse_pasted_contents(entry.get('pastedContents', {}))
        
        # Determine if it's a command
        is_command = display_text.startswith('/')
        command_type = self.identify_command_type(display_text) if is_command else None
        
        # Check if security-related
        is_security_related = self.is_security_related(display_text)
        
        # Check if coding-related
        coding_related = self.is_coding_related(display_text)
        
        # Determine task complexity
        task_complexity = self.assess_task_complexity(display_text, pasted_contents)
        
        # Calculate prompt quality score
        prompt_quality_score = self.calculate_prompt_quality(display_text, pasted_contents)
        
        return HistoryEntry(
            display=display_text,
            pasted_contents=pasted_contents,
            is_command=is_command,
            command_type=command_type,
            is_security_related=is_security_related,
            prompt_quality_score=prompt_quality_score,
            coding_related=coding_related,
            task_complexity=task_complexity
        )
    
    def parse_pasted_contents(self, pasted_contents: Dict) -> List[PastedContent]:
        """Parse pasted content attachments"""
        contents = []
        
        for content_id, content_data in pasted_contents.items():
            if isinstance(content_data, dict):
                contents.append(PastedContent(
                    id=content_id,
                    type=content_data.get('type', 'unknown'),
                    content=content_data.get('content', ''),
                    metadata=content_data
                ))
        
        return contents
    
    def identify_command_type(self, display_text: str) -> Optional[str]:
        """Identify the type of Claude command"""
        for command_type, pattern in self.command_patterns.items():
            if re.match(pattern, display_text):
                return command_type
        return 'unknown_command'
    
    def is_security_related(self, text: str) -> bool:
        """Check if the prompt is security-related"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.security_keywords)
    
    def is_coding_related(self, text: str) -> bool:
        """Check if the prompt is coding-related"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.coding_keywords)
    
    def assess_task_complexity(self, display_text: str, pasted_contents: List[PastedContent]) -> str:
        """Assess the complexity of the task based on prompt characteristics"""
        text_lower = display_text.lower()
        
        # Simple indicators
        simple_indicators = ['hi', 'hello', 'help', 'what', 'how', 'fix this']
        if any(indicator in text_lower for indicator in simple_indicators):
            return "simple"
        
        # Complex indicators
        complex_indicators = [
            'implement', 'create system', 'build application', 'architecture',
            'multiple', 'integrate', 'design', 'optimize performance',
            'refactor entire', 'migration', 'deployment'
        ]
        if any(indicator in text_lower for indicator in complex_indicators):
            return "complex"
        
        # Medium complexity (default for substantial requests)
        if len(display_text) > 50 or pasted_contents:
            return "medium"
        
        return "simple"
    
    def calculate_prompt_quality(self, display_text: str, pasted_contents: List[PastedContent]) -> float:
        """Calculate a quality score for the prompt"""
        score = 0.0
        text_lower = display_text.lower()
        
        # Base score for length and specificity
        if len(display_text) > 10:
            score += 0.1
        if len(display_text) > 50:
            score += 0.2
        if len(display_text) > 100:
            score += 0.1
        
        # Bonus for specific action words
        action_words = ['create', 'implement', 'fix', 'add', 'update', 'optimize', 'refactor', 'debug']
        if any(word in text_lower for word in action_words):
            score += 0.2
        
        # Bonus for context (pasted content)
        if pasted_contents:
            score += 0.3
        
        # Bonus for technical specificity
        technical_terms = ['function', 'class', 'method', 'api', 'database', 'algorithm']
        if any(term in text_lower for term in technical_terms):
            score += 0.1
        
        # Bonus for clear requirements
        requirement_indicators = ['should', 'need', 'must', 'require', 'want to']
        if any(indicator in text_lower for indicator in requirement_indicators):
            score += 0.1
        
        # Penalty for vague prompts
        vague_patterns = [r'^hi$', r'^hello$', r'^help$', r'^/\w+\s*$', r'^ok$', r'^yes$']
        if any(re.match(pattern, text_lower) for pattern in vague_patterns):
            score -= 0.4
        
        return min(1.0, max(0.0, score))
    
    def extract_security_patterns(self, history: List[HistoryEntry]) -> List[str]:
        """Extract security-related patterns from history"""
        patterns = []
        
        security_entries = [entry for entry in history if entry.is_security_related]
        
        for entry in security_entries:
            text = entry.display.lower()
            
            if any(word in text for word in ['auth', 'login', 'authenticate']):
                patterns.append('authentication_requests')
            
            if any(word in text for word in ['encrypt', 'hash', 'secure']):
                patterns.append('encryption_requests')
            
            if any(word in text for word in ['validate', 'sanitize', 'input']):
                patterns.append('validation_requests')
            
            if 'security-review' in text or '/security-review' in text:
                patterns.append('security_review_usage')
            
            if any(word in text for word in ['permission', 'role', 'access']):
                patterns.append('authorization_requests')
        
        return list(set(patterns))  # Remove duplicates
    
    def extract_coding_patterns(self, history: List[HistoryEntry]) -> List[str]:
        """Extract coding-related patterns from history"""
        patterns = []
        
        coding_entries = [entry for entry in history if entry.coding_related]
        
        for entry in coding_entries:
            text = entry.display.lower()
            
            if any(word in text for word in ['debug', 'fix', 'error', 'bug']):
                patterns.append('debugging_requests')
            
            if any(word in text for word in ['create', 'implement', 'build']):
                patterns.append('creation_requests')
            
            if any(word in text for word in ['refactor', 'optimize', 'improve']):
                patterns.append('improvement_requests')
            
            if any(word in text for word in ['test', 'testing', 'unit test']):
                patterns.append('testing_requests')
            
            if any(word in text for word in ['api', 'endpoint', 'route']):
                patterns.append('api_development')
            
            if any(word in text for word in ['database', 'sql', 'query']):
                patterns.append('database_work')
        
        return list(set(patterns))
    
    def detect_anti_patterns(self, history: List[HistoryEntry]) -> List[str]:
        """Detect anti-patterns in user behavior"""
        anti_patterns = []
        
        # Check for vague prompts
        vague_count = 0
        for entry in history:
            if not entry.is_command and entry.prompt_quality_score < 0.3:
                vague_count += 1
        
        if vague_count > len(history) * 0.3:  # More than 30% vague prompts
            anti_patterns.append('excessive_vague_prompts')
        
        # Check for repetitive patterns
        prompts = [entry.display.lower() for entry in history if not entry.is_command]
        prompt_counts = Counter(prompts)
        repetitive_prompts = [prompt for prompt, count in prompt_counts.items() if count > 3]
        
        if repetitive_prompts:
            anti_patterns.append('repetitive_prompting')
        
        # Check for context neglect (complex tasks without context)
        complex_without_context = [
            entry for entry in history 
            if entry.task_complexity == "complex" and not entry.pasted_contents and not entry.is_command
        ]
        
        if len(complex_without_context) > 3:
            anti_patterns.append('context_neglect')
        
        # Check for command underutilization
        command_count = len([entry for entry in history if entry.is_command])
        if len(history) > 20 and command_count < 3:
            anti_patterns.append('command_underutilization')
        
        return anti_patterns
    
    def analyze_prompt_effectiveness(self, history: List[HistoryEntry], usage_metrics: Dict) -> Dict[str, float]:
        """Analyze prompt effectiveness patterns"""
        if not history:
            return {}
        
        non_command_history = [h for h in history if not h.is_command]
        total_prompts = len(non_command_history)
        command_usage = len([h for h in history if h.is_command])
        security_prompts = len([h for h in history if h.is_security_related])
        coding_prompts = len([h for h in history if h.coding_related])
        
        if total_prompts == 0:
            return {}
        
        avg_quality = sum(h.prompt_quality_score for h in non_command_history) / total_prompts
        
        # Calculate effectiveness metrics
        effectiveness = {
            'avg_prompt_quality': avg_quality,
            'command_to_prompt_ratio': command_usage / max(total_prompts, 1),
            'security_focus_ratio': security_prompts / max(total_prompts, 1),
            'coding_focus_ratio': coding_prompts / max(total_prompts, 1),
            'context_usage_rate': len([h for h in non_command_history if h.pasted_contents]) / max(total_prompts, 1),
            'cost_per_prompt': usage_metrics.get('last_cost', 0) / max(total_prompts, 1),
            'high_quality_prompt_rate': len([h for h in non_command_history if h.prompt_quality_score > 0.7]) / max(total_prompts, 1),
            'complex_task_rate': len([h for h in non_command_history if h.task_complexity == "complex"]) / max(total_prompts, 1)
        }
        
        return effectiveness


class ClaudeDesktopAnalytics:
    """Provides analytics insights from Claude Desktop data"""
    
    def __init__(self, parser: ClaudeDesktopParser):
        self.parser = parser
        self.projects_data = None
    
    def load_data(self):
        """Load and parse Claude Desktop data"""
        self.projects_data = self.parser.parse_claude_data()
    
    def analyze_user_patterns(self) -> Dict[str, Any]:
        """Analyze patterns across all projects"""
        if not self.projects_data:
            self.load_data()
        
        all_history = []
        total_cost = 0
        total_input_tokens = 0
        total_output_tokens = 0
        security_projects = 0
        coding_projects = 0
        all_anti_patterns = []
        all_security_patterns = []
        all_coding_patterns = []
        
        for project_path, project_data in self.projects_data.items():
            all_history.extend(project_data.history)
            total_cost += project_data.usage_metrics.get('last_cost', 0)
            total_input_tokens += project_data.usage_metrics.get('last_input_tokens', 0)
            total_output_tokens += project_data.usage_metrics.get('last_output_tokens', 0)
            
            if project_data.security_patterns:
                security_projects += 1
                all_security_patterns.extend(project_data.security_patterns)
            
            if project_data.coding_patterns:
                coding_projects += 1
                all_coding_patterns.extend(project_data.coding_patterns)
            
            all_anti_patterns.extend(project_data.anti_patterns)
        
        # Analyze prompt patterns
        prompt_analysis = self.analyze_prompt_patterns(all_history)
        security_analysis = self.analyze_security_patterns(all_security_patterns, all_history)
        coding_analysis = self.analyze_coding_patterns(all_coding_patterns, all_history)
        effectiveness_analysis = self.analyze_overall_effectiveness()
        anti_pattern_analysis = self.analyze_anti_patterns(all_anti_patterns)
        
        return {
            'overview': {
                'total_projects': len(self.projects_data),
                'total_prompts': len([h for h in all_history if not h.is_command]),
                'total_commands': len([h for h in all_history if h.is_command]),
                'total_cost': total_cost,
                'total_input_tokens': total_input_tokens,
                'total_output_tokens': total_output_tokens,
                'security_projects': security_projects,
                'coding_projects': coding_projects
            },
            'prompt_patterns': prompt_analysis,
            'security_patterns': security_analysis,
            'coding_patterns': coding_analysis,
            'effectiveness': effectiveness_analysis,
            'anti_patterns': anti_pattern_analysis
        }
    
    def analyze_prompt_patterns(self, history: List[HistoryEntry]) -> Dict[str, Any]:
        """Analyze prompt quality and patterns"""
        non_command_history = [h for h in history if not h.is_command]
        
        if not non_command_history:
            return {}
        
        quality_scores = [h.prompt_quality_score for h in non_command_history]
        complexity_distribution = Counter([h.task_complexity for h in non_command_history])
        
        return {
            'total_prompts': len(non_command_history),
            'avg_quality': statistics.mean(quality_scores),
            'quality_std': statistics.stdev(quality_scores) if len(quality_scores) > 1 else 0,
            'high_quality_rate': len([s for s in quality_scores if s > 0.7]) / len(quality_scores),
            'medium_quality_rate': len([s for s in quality_scores if 0.3 <= s <= 0.7]) / len(quality_scores),
            'low_quality_rate': len([s for s in quality_scores if s < 0.3]) / len(quality_scores),
            'context_usage_rate': len([h for h in non_command_history if h.pasted_contents]) / len(non_command_history),
            'avg_prompt_length': statistics.mean([len(h.display) for h in non_command_history]),
            'complexity_distribution': dict(complexity_distribution)
        }
    
    def analyze_security_patterns(self, security_patterns: List[str], all_history: List[HistoryEntry]) -> Dict[str, Any]:
        """Analyze security-related usage patterns"""
        security_pattern_counts = Counter(security_patterns)
        total_security_prompts = len([h for h in all_history if h.is_security_related])
        total_prompts = len([h for h in all_history if not h.is_command])
        
        return {
            'total_security_prompts': total_security_prompts,
            'security_focus_percentage': (total_security_prompts / max(total_prompts, 1)) * 100,
            'security_pattern_frequency': dict(security_pattern_counts),
            'most_common_security_pattern': security_pattern_counts.most_common(1)[0] if security_pattern_counts else None,
            'security_command_usage': security_pattern_counts.get('security_review_usage', 0)
        }
    
    def analyze_coding_patterns(self, coding_patterns: List[str], all_history: List[HistoryEntry]) -> Dict[str, Any]:
        """Analyze coding-related usage patterns"""
        coding_pattern_counts = Counter(coding_patterns)
        total_coding_prompts = len([h for h in all_history if h.coding_related])
        total_prompts = len([h for h in all_history if not h.is_command])
        
        return {
            'total_coding_prompts': total_coding_prompts,
            'coding_focus_percentage': (total_coding_prompts / max(total_prompts, 1)) * 100,
            'coding_pattern_frequency': dict(coding_pattern_counts),
            'most_common_coding_pattern': coding_pattern_counts.most_common(1)[0] if coding_pattern_counts else None
        }
    
    def analyze_anti_patterns(self, anti_patterns: List[str]) -> Dict[str, Any]:
        """Analyze anti-patterns across all projects"""
        anti_pattern_counts = Counter(anti_patterns)
        
        return {
            'total_anti_patterns': len(anti_patterns),
            'anti_pattern_frequency': dict(anti_pattern_counts),
            'most_common_anti_pattern': anti_pattern_counts.most_common(1)[0] if anti_pattern_counts else None,
            'projects_with_anti_patterns': len([p for p in self.projects_data.values() if p.anti_patterns])
        }
    
    def analyze_overall_effectiveness(self) -> Dict[str, float]:
        """Analyze overall Claude usage effectiveness"""
        all_effectiveness = []
        
        for project_data in self.projects_data.values():
            if project_data.prompt_effectiveness:
                all_effectiveness.append(project_data.prompt_effectiveness)
        
        if not all_effectiveness:
            return {}
        
        # Average across all projects
        avg_effectiveness = {}
        for key in all_effectiveness[0].keys():
            values = [e.get(key, 0) for e in all_effectiveness if e.get(key) is not None]
            if values:
                avg_effectiveness[key] = statistics.mean(values)
        
        return avg_effectiveness
    
    def generate_personalized_recommendations(self) -> List[Dict[str, str]]:
        """Generate personalized recommendations based on usage patterns"""
        if not self.projects_data:
            self.load_data()
        
        recommendations = []
        analysis = self.analyze_user_patterns()
        
        # Prompt quality recommendations
        avg_quality = analysis['prompt_patterns'].get('avg_quality', 0)
        if avg_quality < 0.4:
            recommendations.append({
                'type': 'prompt_quality',
                'category': 'Critical',
                'message': f'Your average prompt quality is {avg_quality:.2f}/1.0. Focus on being more specific and providing clear context.',
                'action': 'Include specific requirements, expected outcomes, and relevant context in your prompts.',
                'priority': 'high'
            })
        elif avg_quality < 0.6:
            recommendations.append({
                'type': 'prompt_quality',
                'category': 'Improvement',
                'message': f'Your prompt quality ({avg_quality:.2f}/1.0) has room for improvement.',
                'action': 'Try to be more specific about what you want Claude to do and provide examples when possible.',
                'priority': 'medium'
            })
        
        # Context usage recommendations
        context_rate = analysis['prompt_patterns'].get('context_usage_rate', 0)
        if context_rate < 0.2:
            recommendations.append({
                'type': 'context_usage',
                'category': 'Enhancement',
                'message': f'You provide context (files, images) in only {context_rate*100:.1f}% of prompts.',
                'action': 'Share relevant files, code snippets, or screenshots to help Claude understand your needs better.',
                'priority': 'medium'
            })
        
        # Anti-pattern warnings
        anti_patterns = analysis['anti_patterns']['anti_pattern_frequency']
        if 'excessive_vague_prompts' in anti_patterns:
            recommendations.append({
                'type': 'anti_pattern',
                'category': 'Warning',
                'message': 'You frequently use vague prompts like "hi", "help", or single words.',
                'action': 'Be more specific about what you need. Instead of "help", try "help me debug this Python function".',
                'priority': 'high'
            })
        
        if 'context_neglect' in anti_patterns:
            recommendations.append({
                'type': 'anti_pattern',
                'category': 'Warning',
                'message': 'You often request complex tasks without providing necessary context.',
                'action': 'For complex requests, always include relevant code, error messages, or project details.',
                'priority': 'high'
            })
        
        if 'command_underutilization' in anti_patterns:
            recommendations.append({
                'type': 'feature_usage',
                'category': 'Enhancement',
                'message': 'You rarely use Claude Desktop commands that could improve your workflow.',
                'action': 'Try commands like /mcp for tools, /agents for specialized help, or /memory for context retention.',
                'priority': 'low'
            })
        
        # Security recommendations
        security_focus = analysis['security_patterns'].get('security_focus_percentage', 0)
        if security_focus > 10:  # If user works with security
            security_review_usage = analysis['security_patterns'].get('security_command_usage', 0)
            if security_review_usage == 0:
                recommendations.append({
                    'type': 'security_tooling',
                    'category': 'Enhancement',
                    'message': f'You work with security topics ({security_focus:.1f}% of prompts) but don\'t use security tools.',
                    'action': 'Try /security-review command for automated security analysis of your code.',
                    'priority': 'medium'
                })
        
        # Cost optimization
        cost_per_prompt = analysis['effectiveness'].get('cost_per_prompt', 0)
        if cost_per_prompt > 0.02:
            recommendations.append({
                'type': 'cost_optimization',
                'category': 'Efficiency',
                'message': f'Your cost per prompt (${cost_per_prompt:.4f}) is higher than average.',
                'action': 'Be more specific in initial prompts to reduce back-and-forth iterations.',
                'priority': 'low'
            })
        
        # Complexity distribution insights
        complexity_dist = analysis['prompt_patterns'].get('complexity_distribution', {})
        if complexity_dist.get('simple', 0) > complexity_dist.get('complex', 0) * 3:
            recommendations.append({
                'type': 'usage_pattern',
                'category': 'Insight',
                'message': 'Most of your tasks are simple. You might benefit from more advanced Claude features.',
                'action': 'Try tackling more complex problems or use Claude for architecture planning and code review.',
                'priority': 'low'
            })
        
        return recommendations
    
    def generate_dashboard_data(self) -> Dict[str, Any]:
        """Generate comprehensive dashboard data"""
        analysis = self.analyze_user_patterns()
        recommendations = self.generate_personalized_recommendations()
        
        # Calculate efficiency score (composite metric)
        prompt_quality = analysis['prompt_patterns'].get('avg_quality', 0)
        context_usage = analysis['prompt_patterns'].get('context_usage_rate', 0)
        high_quality_rate = analysis['prompt_patterns'].get('high_quality_rate', 0)
        anti_pattern_penalty = len(analysis['anti_patterns']['anti_pattern_frequency']) * 0.1
        
        efficiency_score = max(0, min(1, 
            (prompt_quality * 0.4 + context_usage * 0.3 + high_quality_rate * 0.3) - anti_pattern_penalty
        ))
        
        return {
            'summary': {
                'efficiency_score': efficiency_score,
                'total_projects': analysis['overview']['total_projects'],
                'total_prompts': analysis['overview']['total_prompts'],
                'total_cost': analysis['overview']['total_cost'],
                'avg_prompt_quality': analysis['prompt_patterns'].get('avg_quality', 0)
            },
            'detailed_analysis': analysis,
            'recommendations': recommendations,
            'trends': {
                'security_focus': analysis['security_patterns'].get('security_focus_percentage', 0),
                'coding_focus': analysis['coding_patterns'].get('coding_focus_percentage', 0),
                'context_usage_trend': analysis['prompt_patterns'].get('context_usage_rate', 0) * 100
            }
        }


def main():
    """Main analysis function"""
    claude_json_path = "/Users/neink/TUMai/GoonerSquad/data_for_analytics/.claude.json"
    
    print("🔍 Claude Desktop Analytics System")
    print("=" * 50)
    
    try:
        # Initialize parser and analytics
        parser = ClaudeDesktopParser(claude_json_path)
        analytics = ClaudeDesktopAnalytics(parser)
        
        # Generate comprehensive dashboard
        dashboard_data = analytics.generate_dashboard_data()
        
        # Display summary
        summary = dashboard_data['summary']
        print(f"\n📊 USAGE SUMMARY")
        print(f"Efficiency Score: {summary['efficiency_score']:.2f}/1.0")
        print(f"Total Projects: {summary['total_projects']}")
        print(f"Total Prompts: {summary['total_prompts']}")
        print(f"Total Cost: ${summary['total_cost']:.4f}")
        print(f"Average Prompt Quality: {summary['avg_prompt_quality']:.2f}/1.0")
        
        # Display detailed patterns
        analysis = dashboard_data['detailed_analysis']
        print(f"\n🎯 PROMPT PATTERNS")
        prompt_patterns = analysis['prompt_patterns']
        print(f"High Quality Prompts: {prompt_patterns.get('high_quality_rate', 0)*100:.1f}%")
        print(f"Context Usage Rate: {prompt_patterns.get('context_usage_rate', 0)*100:.1f}%")
        print(f"Average Prompt Length: {prompt_patterns.get('avg_prompt_length', 0):.0f} characters")
        
        complexity_dist = prompt_patterns.get('complexity_distribution', {})
        print(f"Task Complexity: Simple={complexity_dist.get('simple', 0)}, Medium={complexity_dist.get('medium', 0)}, Complex={complexity_dist.get('complex', 0)}")
        
        # Display security and coding focus
        print(f"\n🔒 SECURITY & CODING FOCUS")
        print(f"Security Focus: {analysis['security_patterns'].get('security_focus_percentage', 0):.1f}% of prompts")
        print(f"Coding Focus: {analysis['coding_patterns'].get('coding_focus_percentage', 0):.1f}% of prompts")
        
        # Display anti-patterns
        anti_patterns = analysis['anti_patterns']['anti_pattern_frequency']
        if anti_patterns:
            print(f"\n⚠️  ANTI-PATTERNS DETECTED")
            for pattern, count in anti_patterns.items():
                print(f"- {pattern.replace('_', ' ').title()}: {count} occurrences")
        
        # Display recommendations
        recommendations = dashboard_data['recommendations']
        if recommendations:
            print(f"\n💡 PERSONALIZED RECOMMENDATIONS")
            for i, rec in enumerate(recommendations[:5], 1):  # Show top 5
                priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}
                emoji = priority_emoji.get(rec['priority'], "⚪")
                print(f"{i}. {emoji} [{rec['category']}] {rec['message']}")
                print(f"   Action: {rec['action']}")
                print()
        
        # Save detailed analysis to file
        output_file = "/Users/neink/TUMai/GoonerSquad/claude_analytics_report.json"
        with open(output_file, 'w') as f:
            json.dump(dashboard_data, f, indent=2, default=str)
        
        print(f"📁 Detailed report saved to: {output_file}")
        
        return dashboard_data
        
    except FileNotFoundError:
        print(f"❌ Error: Could not find .claude.json file at {claude_json_path}")
        return None
    except Exception as e:
        print(f"❌ Error analyzing data: {str(e)}")
        return None


if __name__ == "__main__":
    result = main()
