#!/usr/bin/env python3
"""
Test Supabase Connection and Add Sample Data
Run this to verify your setup is working
"""

import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add the backend directory to path
backend_dir = Path(__file__).parent / "backend"
sys.path.append(str(backend_dir))

try:
    from supabase_integration import SupabaseAnalyticsService, SupabaseConfig
    print("✅ Successfully imported Supabase integration")
except ImportError as e:
    print(f"❌ Failed to import: {e}")
    print("Make sure you're in the right directory and have installed dependencies")
    sys.exit(1)

def test_connection():
    """Test the Supabase connection"""
    print("🔍 Testing Supabase Connection...")
    
    # Load configuration
    config = SupabaseConfig(
        url="https://agfvdbmbebuawvhapmyi.supabase.co",
        key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZnZkYm1iZWJ1YXd2aGFwbXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NzA0MTAsImV4cCI6MjA3NDM0NjQxMH0.Rk83Yj_nzG27KZGYuhVHCuEyIgfO6tYYbMBILbOejqY"
    )
    
    try:
        service = SupabaseAnalyticsService(config)
        print("✅ Supabase client created successfully")
        
        # Test basic connection
        response = service.supabase.table('claude_chat_logs').select('count', count='exact').execute()
        print(f"✅ Database connection successful")
        print(f"📊 Current records in claude_chat_logs: {response.count}")
        
        return service
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return None

def add_sample_data(service):
    """Add sample data for testing"""
    print("\n📝 Adding sample data...")
    
    now = datetime.now(timezone.utc)
    
    sample_logs = [
        {
            "user_query": "I need to implement JWT authentication in auth.js",
            "claude_response": "I'll help you implement JWT authentication. Let's start with token generation...",
            "user_id": "VishiATChoudhary",
            "project_id": "Gooner123",
            "interaction_timestamp": (now - timedelta(minutes=30)).isoformat()
        },
        {
            "user_query": "How do I handle token refresh in the middleware?",
            "claude_response": "For token refresh, you'll want to check expiration and generate new tokens...",
            "user_id": "VishiATChoudhary", 
            "project_id": "Gooner123",
            "interaction_timestamp": (now - timedelta(minutes=15)).isoformat()
        },
        {
            "user_query": "Perfect! The JWT authentication is working now. Thanks!",
            "claude_response": "Excellent! I'm glad we got the JWT implementation working correctly.",
            "user_id": "VishiATChoudhary",
            "project_id": "Gooner123",
            "interaction_timestamp": now.isoformat()
        },
        {
            "user_query": "My Stripe webhook is not working",
            "claude_response": "Let me help you debug the Stripe webhook issue...",
            "user_id": "teammate_john",
            "project_id": "Gooner123", 
            "interaction_timestamp": (now - timedelta(hours=2)).isoformat()
        },
        {
            "user_query": "Still getting the same webhook error",
            "claude_response": "Let's try a different approach...",
            "user_id": "teammate_john",
            "project_id": "Gooner123",
            "interaction_timestamp": (now - timedelta(hours=1)).isoformat()
        }
    ]
    
    success_count = 0
    for log in sample_logs:
        try:
            response = service.supabase.table(service.config.table_name).insert(log).execute()
            print(f"✅ Added: {log['user_id']} - {log['user_query'][:50]}...")
            success_count += 1
        except Exception as e:
            print(f"❌ Error adding log: {e}")
    
    print(f"\n📊 Successfully added {success_count}/{len(sample_logs)} sample records")

def test_analytics(service):
    """Test the analytics functionality"""
    print("\n🔍 Testing Analytics...")
    
    try:
        # Test team dashboard
        dashboard = service.get_team_dashboard_data("Gooner123")
        print(f"✅ Team dashboard generated")
        print(f"📊 Active developers: {len(dashboard['team_status'])}")
        print(f"🔗 Collisions detected: {len(dashboard['collisions'])}")
        
        # Test developer insights
        insights = service.get_developer_insights("VishiATChoudhary", "Gooner123")
        print(f"✅ Developer insights generated")
        print(f"💬 Total sessions: {insights['total_sessions']}")
        print(f"🔄 Total interactions: {insights['total_interactions']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Analytics test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 CodeLens Supabase Integration Test")
    print("=" * 50)
    
    # Test connection
    service = test_connection()
    if not service:
        return False
    
    # Add sample data
    add_sample_data(service)
    
    # Test analytics
    analytics_ok = test_analytics(service)
    
    if analytics_ok:
        print("\n🎉 ALL TESTS PASSED!")
        print("\nNext steps:")
        print("1. Go to your Supabase dashboard to see the data")
        print("2. Start the backend: cd backend && python supabase_integration.py")
        print("3. Start the frontend: cd ../code-lens-flow && npm run dev")
        print("4. Visit http://localhost:5173/live to see your team dashboard")
        return True
    else:
        print("\n❌ Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
