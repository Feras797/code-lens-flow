#!/usr/bin/env python3
"""
Demo of Chat Logs Analytics System
Shows realistic team coordination scenarios with current timestamps
"""

import json
from datetime import datetime, timezone, timedelta
from chat_logs_analytics import ChatLogsAnalyzer, ChatLogsAPI

def create_realistic_demo_data():
    """Create realistic demo data with current timestamps"""
    
    now = datetime.now(timezone.utc)
    
    # Scenario: Team working on e-commerce app
    # - Sarah: Working on JWT authentication (in flow)
    # - John: Stuck on Stripe webhook (struggling) 
    # - Mike: Refactoring user table (slow progress)
    
    demo_logs = []
    
    # Sarah's JWT authentication work (successful flow)
    sarah_start = now - timedelta(minutes=45)
    demo_logs.extend([
        {
            "id": "sarah_001",
            "user_query": "I need to implement JWT authentication in auth.js",
            "claude_response": "I'll help you implement JWT authentication. Let's start with the token generation...",
            "user_id": "sarah",
            "project_id": "ecommerce_app", 
            "interaction_timestamp": sarah_start.isoformat(),
            "created_at": sarah_start.isoformat(),
            "updated_at": sarah_start.isoformat()
        },
        {
            "id": "sarah_002", 
            "user_query": "How do I handle token refresh in the middleware?",
            "claude_response": "For token refresh, you'll want to check expiration and generate new tokens...",
            "user_id": "sarah",
            "project_id": "ecommerce_app",
            "interaction_timestamp": (sarah_start + timedelta(minutes=15)).isoformat(),
            "created_at": (sarah_start + timedelta(minutes=15)).isoformat(),
            "updated_at": (sarah_start + timedelta(minutes=15)).isoformat()
        },
        {
            "id": "sarah_003",
            "user_query": "Perfect! The JWT authentication is working now. Thanks!",
            "claude_response": "Excellent! I'm glad the JWT implementation is working correctly.",
            "user_id": "sarah",
            "project_id": "ecommerce_app",
            "interaction_timestamp": (sarah_start + timedelta(minutes=30)).isoformat(),
            "created_at": (sarah_start + timedelta(minutes=30)).isoformat(),
            "updated_at": (sarah_start + timedelta(minutes=30)).isoformat()
        }
    ])
    
    # John's Stripe webhook struggles (stuck pattern)
    john_start = now - timedelta(hours=2, minutes=30)
    demo_logs.extend([
        {
            "id": "john_001",
            "user_query": "My Stripe webhook in webhook.js is not working",
            "claude_response": "Let me help you debug the Stripe webhook issue...",
            "user_id": "john",
            "project_id": "ecommerce_app",
            "interaction_timestamp": john_start.isoformat(),
            "created_at": john_start.isoformat(),
            "updated_at": john_start.isoformat()
        },
        {
            "id": "john_002",
            "user_query": "Still getting the same error after trying your suggestion",
            "claude_response": "Let's try a different approach. Can you check the webhook endpoint configuration...",
            "user_id": "john", 
            "project_id": "ecommerce_app",
            "interaction_timestamp": (john_start + timedelta(minutes=20)).isoformat(),
            "created_at": (john_start + timedelta(minutes=20)).isoformat(),
            "updated_at": (john_start + timedelta(minutes=20)).isoformat()
        },
        {
            "id": "john_003",
            "user_query": "Tried everything but the webhook still fails with the same error",
            "claude_response": "Let's debug this step by step. Can you share the exact error message...",
            "user_id": "john",
            "project_id": "ecommerce_app", 
            "interaction_timestamp": (john_start + timedelta(minutes=45)).isoformat(),
            "created_at": (john_start + timedelta(minutes=45)).isoformat(),
            "updated_at": (john_start + timedelta(minutes=45)).isoformat()
        },
        {
            "id": "john_004",
            "user_query": "Same issue persists. I've been stuck on this for hours.",
            "claude_response": "I understand your frustration. Let's try a completely different approach...",
            "user_id": "john",
            "project_id": "ecommerce_app",
            "interaction_timestamp": (john_start + timedelta(hours=1, minutes=30)).isoformat(),
            "created_at": (john_start + timedelta(hours=1, minutes=30)).isoformat(),
            "updated_at": (john_start + timedelta(hours=1, minutes=30)).isoformat()
        }
    ])
    
    # Mike's database refactoring (slow but steady)
    mike_start = now - timedelta(hours=1, minutes=15)
    demo_logs.extend([
        {
            "id": "mike_001",
            "user_query": "I need to refactor the user table schema in user.sql",
            "claude_response": "I'll help you refactor the user table schema safely...",
            "user_id": "mike",
            "project_id": "ecommerce_app",
            "interaction_timestamp": mike_start.isoformat(),
            "created_at": mike_start.isoformat(),
            "updated_at": mike_start.isoformat()
        },
        {
            "id": "mike_002",
            "user_query": "How do I handle the migration without losing data?",
            "claude_response": "For safe data migration, you'll want to create a backup first...",
            "user_id": "mike",
            "project_id": "ecommerce_app",
            "interaction_timestamp": (mike_start + timedelta(minutes=20)).isoformat(),
            "created_at": (mike_start + timedelta(minutes=20)).isoformat(),
            "updated_at": (mike_start + timedelta(minutes=20)).isoformat()
        },
        {
            "id": "mike_003",
            "user_query": "The migration is taking longer than expected",
            "claude_response": "Database migrations can take time. Let's optimize the process...",
            "user_id": "mike",
            "project_id": "ecommerce_app",
            "interaction_timestamp": (mike_start + timedelta(minutes=45)).isoformat(),
            "created_at": (mike_start + timedelta(minutes=45)).isoformat(),
            "updated_at": (mike_start + timedelta(minutes=45)).isoformat()
        }
    ])
    
    # Add collision scenario - Sarah and John both working on auth
    demo_logs.append({
        "id": "john_005",
        "user_query": "Now I need to integrate the webhook with the auth system in auth.js",
        "claude_response": "To integrate the webhook with authentication, you'll need to...",
        "user_id": "john",
        "project_id": "ecommerce_app",
        "interaction_timestamp": (now - timedelta(minutes=10)).isoformat(),
        "created_at": (now - timedelta(minutes=10)).isoformat(),
        "updated_at": (now - timedelta(minutes=10)).isoformat()
    })
    
    return demo_logs

def run_demo():
    """Run comprehensive demo of the analytics system"""
    
    print("🚀 CodeLens Chat Logs Analytics Demo")
    print("=" * 60)
    
    # Create demo data
    demo_logs = create_realistic_demo_data()
    print(f"📊 Created {len(demo_logs)} demo interactions")
    
    # Initialize system
    analyzer = ChatLogsAnalyzer()
    api = ChatLogsAPI(analyzer)
    
    # Get team dashboard
    print("\n🏢 TEAM DASHBOARD")
    print("-" * 30)
    dashboard = api.get_team_dashboard("ecommerce_app", demo_logs)
    
    # Display team status
    for member in dashboard['team_status']:
        status_emoji = {"flow": "🟢", "slow": "🟡", "stuck": "🔴", "idle": "⚪"}
        emoji = status_emoji.get(member['status'], "⚪")
        
        print(f"{emoji} {member['user_id']:<10} | {member['current_task']:<25} | {member['status']:<6} | {member['iteration_count']} msgs")
    
    # Display collisions
    if dashboard['collisions']:
        print(f"\n⚠️  COLLISIONS DETECTED:")
        for collision in dashboard['collisions']:
            users = ' & '.join(collision['users'])
            print(f"   {users}: Both working on {collision['resource']} ({collision['confidence']*100:.0f}% confidence)")
    else:
        print(f"\n✅ No collisions detected")
    
    # Display project metrics
    metrics = dashboard['project_metrics']
    print(f"\n📈 PROJECT METRICS (24h)")
    print(f"   Total Interactions: {metrics['total_interactions_24h']}")
    print(f"   Active Developers: {metrics['active_developers']}")
    print(f"   Files Being Worked On: {metrics['files_being_worked_on']}")
    print(f"   Average Success Rate: {metrics['average_success_rate']:.1%}")
    
    # Individual developer insights
    print(f"\n👤 INDIVIDUAL INSIGHTS")
    print("-" * 30)
    
    for user_id in ["sarah", "john", "mike"]:
        insights = api.get_developer_insights(user_id, "ecommerce_app", demo_logs, days=1)
        
        print(f"\n{user_id.upper()}:")
        print(f"   Sessions: {insights['total_sessions']}")
        print(f"   Interactions: {insights['total_interactions']}")
        print(f"   Avg Session Length: {insights['avg_session_length']}")
        
        if insights['most_worked_files']:
            files = list(insights['most_worked_files'].keys())[:2]
            print(f"   Working on: {', '.join(files)}")
        
        if insights['focus_areas']:
            areas = list(insights['focus_areas'].keys())[:2] 
            print(f"   Focus: {', '.join(areas)}")
        
        activity = insights['recent_activity']
        print(f"   Status: {activity['status']} ({activity['success_rate']:.1%} success rate)")
    
    # Anti-pattern detection demo
    print(f"\n⚠️  ANTI-PATTERN ANALYSIS")
    print("-" * 30)
    
    # Analyze John's stuck pattern
    john_logs = [log for log in demo_logs if log['user_id'] == 'john']
    john_interactions = analyzer.parse_chat_logs(john_logs)
    john_sessions = analyzer.group_into_sessions(john_interactions)
    
    if john_sessions:
        session = john_sessions[0]
        print(f"🔴 STUCK PATTERN DETECTED (John):")
        print(f"   Duration: {session.duration_minutes} minutes")
        print(f"   Iterations: {len(session.interactions)}")
        print(f"   Stuck indicators: {session.stuck_indicators}")
        print(f"   Success indicators: {session.success_indicators}")
        print(f"   → Recommendation: Consider pair programming or escalation")
    
    # Show Sarah's successful flow
    sarah_logs = [log for log in demo_logs if log['user_id'] == 'sarah']
    sarah_interactions = analyzer.parse_chat_logs(sarah_logs)
    sarah_sessions = analyzer.group_into_sessions(sarah_interactions)
    
    if sarah_sessions:
        session = sarah_sessions[0]
        print(f"\n🟢 FLOW PATTERN DETECTED (Sarah):")
        print(f"   Duration: {session.duration_minutes} minutes")
        print(f"   Iterations: {len(session.interactions)}")
        print(f"   Success indicators: {session.success_indicators}")
        print(f"   → Pattern: Efficient problem-solving approach")
    
    print(f"\n🎯 ACTIONABLE INSIGHTS")
    print("-" * 30)
    print("1. 🔴 John needs immediate help - stuck for 2.5 hours on webhook")
    print("2. ⚠️  Collision: Sarah & John both touching auth.js - coordinate!")
    print("3. 🟡 Mike's migration is slow but steady - monitor progress")
    print("4. 🟢 Sarah's approach is working well - could mentor others")
    
    # Save demo results
    with open('demo_results.json', 'w') as f:
        json.dump({
            'dashboard': dashboard,
            'demo_logs': demo_logs
        }, f, indent=2, default=str)
    
    print(f"\n💾 Demo results saved to demo_results.json")

if __name__ == "__main__":
    run_demo()
