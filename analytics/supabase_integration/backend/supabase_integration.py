#!/usr/bin/env python3
"""
Supabase Integration for CodeLens Analytics
Connects to Supabase database and provides APIs for the frontend
"""

import os
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from supabase import create_client, Client
from chat_logs_analytics import ChatLogsAnalyzer, ChatLogsAPI


@dataclass
class SupabaseConfig:
    """Supabase configuration"""

    url: str
    key: str
    table_name: str = "claude_chat_logs"


class SupabaseAnalyticsService:
    """Service to connect Supabase with CodeLens analytics"""

    def __init__(self, config: SupabaseConfig):
        self.config = config
        self.supabase: Client = create_client(config.url, config.key)
        self.analyzer = ChatLogsAnalyzer()
        self.api = ChatLogsAPI(self.analyzer)

    def fetch_chat_logs(self, project_id: str, hours_back: int = 24) -> List[Dict]:
        """Fetch chat logs from Supabase"""

        # Calculate cutoff time
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours_back)

        try:
            response = (
                self.supabase.table(self.config.table_name)
                .select("*")
                .eq("project_id", project_id)
                .gte("interaction_timestamp", cutoff_time.isoformat())
                .order("interaction_timestamp", desc=False)
                .execute()
            )

            return response.data

        except Exception as e:
            print(f"Error fetching chat logs: {e}")
            return []

    def get_team_dashboard_data(self, project_id: str) -> Dict:
        """Get team dashboard data for frontend"""

        # Fetch recent chat logs
        chat_logs = self.fetch_chat_logs(project_id, hours_back=24)

        if not chat_logs:
            return self._empty_dashboard_response(project_id)

        # Generate dashboard using analytics API
        dashboard = self.api.get_team_dashboard(project_id, chat_logs)

        # Transform to frontend format
        return self._transform_to_frontend_format(dashboard)

    def get_developer_insights(
        self, user_id: str, project_id: str, days: int = 7
    ) -> Dict:
        """Get individual developer insights"""

        # Fetch logs for specific user
        chat_logs = self.fetch_chat_logs(project_id, hours_back=days * 24)
        user_logs = [log for log in chat_logs if log["user_id"] == user_id]

        if not user_logs:
            return self._empty_insights_response(user_id, project_id)

        # Generate insights
        insights = self.api.get_developer_insights(user_id, project_id, user_logs, days)

        return insights

    def get_project_list(self) -> List[Dict]:
        """Get list of all projects with recent activity"""

        try:
            # Get unique projects from last 7 days
            cutoff_time = datetime.now(timezone.utc) - timedelta(days=7)

            response = (
                self.supabase.table(self.config.table_name)
                .select("project_id")
                .gte("interaction_timestamp", cutoff_time.isoformat())
                .execute()
            )

            # Get unique project IDs
            project_ids = list(set([row["project_id"] for row in response.data]))

            # Get dashboard data for each project
            projects = []
            for project_id in project_ids:
                dashboard = self.get_team_dashboard_data(project_id)
                if dashboard["team_status"]:  # Only include projects with activity
                    projects.append(
                        {
                            "id": project_id,
                            "name": self._format_project_name(project_id),
                            "activeDevelopers": len(
                                [
                                    dev
                                    for dev in dashboard["team_status"]
                                    if dev["status"] != "idle"
                                ]
                            ),
                            "statusDistribution": self._calculate_status_distribution(
                                dashboard["team_status"]
                            ),
                            "lastRefresh": dashboard["last_updated"],
                            "hasCollisions": len(dashboard["collisions"]) > 0,
                            "developers": dashboard["team_status"],
                        }
                    )

            return projects

        except Exception as e:
            print(f"Error fetching projects: {e}")
            return []

    def _transform_to_frontend_format(self, dashboard: Dict) -> Dict:
        """Transform analytics data to match frontend types"""

        # Transform team status to match Developer interface
        transformed_developers = []
        for dev in dashboard["team_status"]:
            transformed_dev = {
                "id": dev["user_id"],
                "name": self._format_user_name(dev["user_id"]),
                "avatar": self._generate_avatar(dev["user_id"]),
                "currentTask": dev["current_task"],
                "status": self._map_status(dev["status"]),
                "duration": self._format_duration(dev["duration_minutes"]),
                "fileName": dev["files_working_on"][0]
                if dev["files_working_on"]
                else None,
            }
            transformed_developers.append(transformed_dev)

        # Transform collisions to match Collision interface
        transformed_collisions = []
        for collision in dashboard["collisions"]:
            transformed_collision = {
                "id": f"collision_{len(transformed_collisions)}",
                "developers": collision["users"],
                "file": collision["resource"],
                "type": collision["type"].replace("_collision", ""),
            }
            transformed_collisions.append(transformed_collision)

        # Calculate status distribution
        status_dist = self._calculate_status_distribution(dashboard["team_status"])

        return {
            "id": dashboard["project_id"],
            "name": self._format_project_name(dashboard["project_id"]),
            "activeDevelopers": len(
                [dev for dev in dashboard["team_status"] if dev["status"] != "idle"]
            ),
            "statusDistribution": status_dist,
            "lastRefresh": self._format_last_refresh(dashboard["last_updated"]),
            "hasCollisions": len(dashboard["collisions"]) > 0,
            "developers": transformed_developers,
            "collisions": transformed_collisions,
            "metrics": dashboard.get("project_metrics", {}),
        }

    def _calculate_status_distribution(self, team_status: List[Dict]) -> Dict[str, int]:
        """Calculate status distribution for frontend"""

        status_counts = {"active": 0, "slow": 0, "blocked": 0}

        for dev in team_status:
            status = dev.get("status", "idle")
            if status == "flow":
                status_counts["active"] += 1
            elif status == "slow":
                status_counts["slow"] += 1
            elif status == "stuck":
                status_counts["blocked"] += 1

        return status_counts

    def _map_status(self, analytics_status: str) -> str:
        """Map analytics status to frontend status"""
        mapping = {
            "flow": "flow",
            "slow": "slow",
            "stuck": "blocked",
            "idle": "flow",  # Default to flow for idle
        }
        return mapping.get(analytics_status, "flow")

    def _format_user_name(self, user_id: str) -> str:
        """Format user ID to display name"""
        # Simple formatting - in real app, would lookup from user table
        return user_id.replace("_", " ").title()

    def _generate_avatar(self, user_id: str) -> str:
        """Generate avatar initials from user ID"""
        parts = user_id.replace("_", " ").split()
        if len(parts) >= 2:
            return f"{parts[0][0]}{parts[1][0]}".upper()
        else:
            return user_id[:2].upper()

    def _format_project_name(self, project_id: str) -> str:
        """Format project ID to display name"""
        return project_id.replace("_", " ").title()

    def _format_duration(self, minutes: int) -> str:
        """Format duration in minutes to human readable"""
        if minutes < 60:
            return f"{minutes} min"
        else:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            if remaining_minutes == 0:
                return f"{hours} hr"
            else:
                return f"{hours}.{remaining_minutes // 6} hrs"

    def _format_last_refresh(self, iso_timestamp: str) -> str:
        """Format timestamp to 'X min ago' format"""
        try:
            timestamp = datetime.fromisoformat(iso_timestamp.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            diff = now - timestamp

            if diff.total_seconds() < 60:
                return "Just now"
            elif diff.total_seconds() < 3600:
                minutes = int(diff.total_seconds() // 60)
                return f"{minutes} min ago"
            else:
                hours = int(diff.total_seconds() // 3600)
                return f"{hours} hr ago"
        except:
            return "Unknown"

    def _empty_dashboard_response(self, project_id: str) -> Dict:
        """Return empty dashboard when no data available"""
        return {
            "id": project_id,
            "name": self._format_project_name(project_id),
            "activeDevelopers": 0,
            "statusDistribution": {"active": 0, "slow": 0, "blocked": 0},
            "lastRefresh": "No recent activity",
            "hasCollisions": False,
            "developers": [],
            "collisions": [],
            "metrics": {},
        }

    def _empty_insights_response(self, user_id: str, project_id: str) -> Dict:
        """Return empty insights when no data available"""
        return {
            "user_id": user_id,
            "project_id": project_id,
            "total_sessions": 0,
            "total_interactions": 0,
            "avg_session_length": 0,
            "most_worked_files": {},
            "focus_areas": {},
            "recent_activity": {
                "status": "idle",
                "current_task": "No recent activity",
                "success_rate": 0.0,
            },
        }


# FastAPI endpoints for frontend integration
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import re
import random

app = FastAPI(title="CodeLens Analytics API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
    ],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global service instance (would be configured via environment variables)
analytics_service: Optional[SupabaseAnalyticsService] = None


def get_analytics_service() -> SupabaseAnalyticsService:
    """Get or create analytics service instance"""
    global analytics_service

    if analytics_service is None:
        # These would come from environment variables
        config = SupabaseConfig(
            url=os.getenv("SUPABASE_URL", "your-supabase-url"),
            key=os.getenv("SUPABASE_KEY", "your-supabase-key"),
        )
        analytics_service = SupabaseAnalyticsService(config)

    return analytics_service


@app.get("/api/projects")
async def get_projects():
    """Get all projects with recent activity"""
    try:
        service = get_analytics_service()
        projects = service.get_project_list()
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}/dashboard")
async def get_project_dashboard(project_id: str):
    """Get team dashboard for specific project"""
    try:
        service = get_analytics_service()
        dashboard = service.get_team_dashboard_data(project_id)
        return dashboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}/developers/{user_id}/insights")
async def get_developer_insights(
    project_id: str,
    user_id: str,
    days: int = Query(7, description="Number of days to look back"),
):
    """Get insights for specific developer"""
    try:
        service = get_analytics_service()
        insights = service.get_developer_insights(user_id, project_id, days)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# Pydantic models for request/response validation
class ChatLogCreate(BaseModel):
    user_query: str
    claude_response: str
    user_id: str
    project_id: str
    interaction_timestamp: datetime


@app.post("/api/chat-logs")
async def create_chat_log(chat_log: ChatLogCreate):
    """Create new chat log entry"""
    try:
        service = get_analytics_service()

        # Insert into Supabase
        response = (
            service.supabase.table(service.config.table_name)
            .insert(
                {
                    "user_query": chat_log.user_query,
                    "claude_response": chat_log.claude_response,
                    "user_id": chat_log.user_id,
                    "project_id": chat_log.project_id,
                    "interaction_timestamp": chat_log.interaction_timestamp.isoformat(),
                }
            )
            .execute()
        )

        return {
            "message": "Chat log created successfully",
            "id": response.data[0]["id"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Anti-pattern detection (from local .claude.json)
# ---------------------------

ANTI_PATTERNS = [
    {
        "patternId": "vague_frustration",
        "patternName": "Vague Frustration Pattern",
        "phrases": ["not working", "doesn't work", "doesnt work", "broken", "fix this"],
    },
    {
        "patternId": "context_amnesia",
        "patternName": "Context Amnesia Pattern",
        "phrases": ["start a new", "from scratch", "now implement", "how do I add"],
    },
    {
        "patternId": "hail_mary",
        "patternName": "Hail Mary Pattern",
        "phrases": ["rewrite the whole", "start over", "replace everything"],
    },
    {
        "patternId": "solution_fixation",
        "patternName": "Solution Fixation Pattern",
        "phrases": [
            "just use ",
            "must use ",
            "force using ",
            "use redux",
            "use graphql",
        ],
    },
    {
        "patternId": "information_overload",
        "patternName": "Information Overload Pattern",
        "phrases": ["entire codebase", "dumping all files"],
    },
]


def _read_local_claude_history(path: str) -> Dict:
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed reading {path}: {e}")
        return {}


def _score_match(text: str, phrases: List[str]) -> float:
    tl = text.lower()
    score = 0
    for p in phrases:
        if p in tl:
            score += 1
    return float(score)


@app.get("/api/antipatterns/detect-from-claude")
async def detect_antipatterns_from_claude():
    """Scan local Claude Desktop history and detect anti-pattern occurrences."""
    try:
        data_path = "/Users/neink/TUMai/GoonerSquad/data_for_analytics/.claude.json"
        data = _read_local_claude_history(data_path)

        detections: List[Dict] = []
        projects = data.get("projects", {}) if isinstance(data, dict) else {}

        for ap in ANTI_PATTERNS:
            matches = []
            for project_path, info in projects.items():
                for h in info.get("history", []) or []:
                    disp = (h.get("display") or "").strip()
                    if not disp or disp.startswith("/"):
                        continue
                    score = _score_match(disp, ap["phrases"])
                    if score > 0:
                        matches.append(
                            {
                                "projectPath": project_path,
                                "text": disp[:500],
                                "score": score,
                            }
                        )
            if matches:
                detections.append(
                    {
                        "patternId": ap["patternId"],
                        "patternName": ap["patternName"],
                        "matches": sorted(
                            matches, key=lambda m: m["score"], reverse=True
                        )[:25],
                    }
                )

        return {"detections": detections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# On-demand prompt suggestion (for MCP-style slash command)
# ---------------------------


class SuggestRequest(BaseModel):
    text: str
    files_open: Optional[list[str]] = []
    recent_errors: Optional[list[str]] = []
    conversation_history: Optional[list[dict]] = []
    team_activity: Optional[dict] = {}


class Suggestion(BaseModel):
    type: str
    priority: str
    message: str
    suggestion: str


def _suggest_from_text(req: SuggestRequest) -> list[Suggestion]:
    suggestions: list[Suggestion] = []
    prompt = (req.text or "").lower()

    # Vague Frustration Pattern
    if any(p in prompt for p in ["not working", "doesn't work", "broken"]) and not any(
        kw in prompt for kw in ["error", "line", "function", "file"]
    ):
        suggestions.append(
            Suggestion(
                type="warning",
                priority="high",
                message="Vague problem description detected",
                suggestion="Include specific error message, file name, and expected vs actual behavior",
            )
        )

    # Solution Fixation Pattern
    if any(p in prompt for p in ["just use", "make it work with", "simply"]):
        suggestions.append(
            Suggestion(
                type="improvement",
                priority="medium",
                message="Predetermined solution detected",
                suggestion="Describe constraints and ask for best approach with trade-offs",
            )
        )

    # Context suggestions
    if req.files_open and any(w in prompt for w in ["debug", "fix", "error", "issue"]):
        suggestions.append(
            Suggestion(
                type="context",
                priority="medium",
                message="Include relevant file context",
                suggestion=f"Attach snippets from: {', '.join(req.files_open[:3])}",
            )
        )
    if req.recent_errors and ("error" in prompt or "issue" in prompt):
        suggestions.append(
            Suggestion(
                type="context",
                priority="high",
                message="Include recent error details",
                suggestion=f"Share the error: {req.recent_errors[-1][:100]}...",
            )
        )

    return suggestions[:4]


@app.post("/api/suggest")
async def suggest_prompt(req: SuggestRequest):
    try:
        return {"suggestions": [s.dict() for s in _suggest_from_text(req)]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# GEPA-based prompt optimizer (with graceful fallback)
# ---------------------------


class EvolveRequest(BaseModel):
    intent: str
    candidates: Optional[int] = 24
    rounds: Optional[int] = 1


_EVOLVED_PROMPTS_CACHE: Dict[str, Dict] = {}


def _sample_training_prompts_from_history(intent: str, limit: int = 20) -> list[dict]:
    path = "/Users/neink/TUMai/GoonerSquad/data_for_analytics/.claude.json"
    data = _read_local_claude_history(path)
    projects = data.get("projects", {}) if isinstance(data, dict) else {}
    samples: list[dict] = []
    keywords = {
        "debug": ["debug", "error", "fix", "broken"],
        "refactor": ["refactor", "optimize", "clean"],
        "feature": ["implement", "create", "build", "add"],
        "security": ["auth", "jwt", "oauth", "encrypt", "validate"],
    }.get(intent, [])
    for proj, info in projects.items():
        for h in info.get("history", []) or []:
            disp = (h.get("display") or "").strip()
            if not disp or disp.startswith("/"):
                continue
            lower = disp.lower()
            if not keywords or any(k in lower for k in keywords):
                samples.append({"project": proj, "text": disp})
    random.shuffle(samples)
    return samples[:limit]


def _baseline_prompt_template(intent: str) -> str:
    templates = {
        "debug": (
            "Debug this issue. Provide: context (files/lines), error message, steps to reproduce,"
            " expected vs actual, and propose minimal fix."
        ),
        "refactor": (
            "Refactor with constraints. Preserve public API, add tests, and explain risk."
        ),
        "feature": (
            "Implement the feature with clear acceptance criteria, edge cases, tests, and performance notes."
        ),
        "security": (
            "Implement securely: input validation, authz/authn, safe error handling, and audit logging."
        ),
    }
    return templates.get(
        intent, "Make the request specific, add context, constraints, and tests."
    )


def _heuristic_evolve(intent: str, trainset: list[dict]) -> Dict:
    base = _baseline_prompt_template(intent)
    improvements = [
        "Add explicit constraints and acceptance criteria.",
        "Reference relevant files and prior decisions.",
        "Ask for tests first, then implementation.",
        "Request step-by-step plan before code.",
    ]
    evolved = f"{base} Also: {improvements[0]} {improvements[1]}"
    return {
        "intent": intent,
        "prompt": evolved,
        "metrics": {
            "anti_patterns": "reduced (heuristic)",
            "iterations": "reduced (heuristic)",
        },
    }


@app.post("/api/prompt-optimizer/evolve")
async def evolve_prompts(req: EvolveRequest):
    try:
        # Try GEPA, fall back to heuristic
        trainset = _sample_training_prompts_from_history(req.intent)
        try:
            from gepa import optimize, GEPAAdapter  # type: ignore

            class CoachAdapter(GEPAAdapter):  # type: ignore
                def evaluate(self, candidate, minibatch):
                    scores = []
                    traces = []
                    for ex in minibatch:
                        filled = f"{candidate['prompt']}\nTask: {ex['text']}"
                        quality = 1.0 if len(filled) > 60 else 0.5
                        anti = (
                            0.0
                            if all(
                                p not in filled.lower()
                                for p in ["not working", "broken"]
                            )
                            else 0.5
                        )
                        iters = 0.3 if "acceptance criteria" in filled.lower() else 0.6
                        risk = 0.3 if "tests" in filled.lower() else 0.7
                        scores.append((quality, -anti, -iters, -risk))
                        traces.append(
                            {"ex": ex["text"], "explanation": "scored by heuristics"}
                        )
                    return scores, {"traces": traces}

                def extract_traces_for_reflection(self, exec_traces, component_name):
                    return "\n".join(t["explanation"] for t in exec_traces["traces"])

            initial = [{"prompt": _baseline_prompt_template(req.intent)}]
            result = optimize(
                adapter=CoachAdapter(),
                initial_candidates=initial,
                metric_names=["success", "anti", "iterations", "risk"],
                num_candidates=req.candidates,
                num_rounds=req.rounds,
            )
            best = (
                result["pareto_front"][0]
                if isinstance(result, dict) and result.get("pareto_front")
                else {"prompt": initial[0]["prompt"]}
            )
            payload = {
                "intent": req.intent,
                "prompt": best["prompt"],
                "metrics": {"source": "gepa"},
            }
        except Exception:
            payload = _heuristic_evolve(req.intent, trainset)
        _EVOLVED_PROMPTS_CACHE[req.intent] = payload
        return payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/prompt-optimizer/best")
async def get_best_prompt(intent: str):
    try:
        payload = _EVOLVED_PROMPTS_CACHE.get(intent)
        if not payload:
            payload = _heuristic_evolve(
                intent, _sample_training_prompts_from_history(intent)
            )
            _EVOLVED_PROMPTS_CACHE[intent] = payload
        return payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Performance Metrics (from .claude.json)
# ---------------------------


@app.get("/api/metrics/performance")
async def performance_metrics():
    try:
        data = _read_local_claude_history(
            "/Users/neink/TUMai/GoonerSquad/data_for_analytics/.claude.json"
        )
        projects = data.get("projects", {}) if isinstance(data, dict) else {}

        total_prompts = 0
        context_used = 0
        total_len = 0
        vague_count = 0
        rewrite_count = 0
        pattern_counts: Dict[str, int] = {}

        def is_vague(txt: str) -> bool:
            t = txt.lower()
            if any(p in t for p in ["not working", "doesn't work", "broken"]):
                return not any(
                    k in t for k in ["error", "line", "function", "file", "stack"]
                )
            return False

        for ap in ANTI_PATTERNS:
            pattern_counts[ap["patternId"]] = 0

        for _, info in projects.items():
            for h in info.get("history", []) or []:
                disp = (h.get("display") or "").strip()
                if not disp or disp.startswith("/"):
                    continue
                total_prompts += 1
                total_len += len(disp)
                pasted = h.get("pastedContents")
                if isinstance(pasted, dict) and len(pasted) > 0:
                    context_used += 1
                if is_vague(disp):
                    vague_count += 1
                if any(
                    p in disp.lower()
                    for p in ["rewrite the whole", "start over", "replace everything"]
                ):
                    rewrite_count += 1
                for ap in ANTI_PATTERNS:
                    if _score_match(disp, ap["phrases"]) > 0:
                        pattern_counts[ap["patternId"]] += 1

        if total_prompts == 0:
            return {
                "total_prompts": 0,
                "anti_pattern_rate": 0.0,
                "context_usage_rate": 0.0,
                "avg_prompt_length": 0.0,
                "estimated_iteration_efficiency": 0.0,
                "revert_risk_proxy": 0.0,
                "pattern_counts": pattern_counts,
            }

        anti_hits = sum(pattern_counts.values())
        anti_pattern_rate = anti_hits / total_prompts
        context_usage_rate = context_used / total_prompts
        avg_prompt_length = total_len / total_prompts
        # Proxies (0..1): higher is better for efficiency, lower is better for risk
        estimated_iteration_efficiency = max(
            0.0, 1.0 - min(1.0, vague_count / total_prompts)
        )
        revert_risk_proxy = min(
            1.0, (rewrite_count + vague_count * 0.5) / total_prompts
        )

        return {
            "total_prompts": total_prompts,
            "anti_pattern_rate": round(anti_pattern_rate, 3),
            "context_usage_rate": round(context_usage_rate, 3),
            "avg_prompt_length": round(avg_prompt_length, 1),
            "estimated_iteration_efficiency": round(estimated_iteration_efficiency, 3),
            "revert_risk_proxy": round(revert_risk_proxy, 3),
            "pattern_counts": pattern_counts,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
