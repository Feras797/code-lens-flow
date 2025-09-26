# CodeLens Supabase Integration Setup

This guide shows how to integrate your existing React frontend with the Supabase backend for real-time team coordination analytics.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Python FastAPI │    │    Supabase     │
│   (code-lens-flow)   │◄──►│    Backend      │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    Real-time UI            Analytics Engine         claude_chat_logs
    Team Dashboard          Pattern Detection              table
```

## 📋 Prerequisites

1. **Supabase Project**: Create account at [supabase.com](https://supabase.com)
2. **Python 3.8+**: For the backend analytics service
3. **Node.js 18+**: For the React frontend
4. **Claude Desktop**: To generate chat logs

## 🚀 Setup Steps

### 1. Supabase Database Setup

#### Create the `claude_chat_logs` table:

```sql
-- Create the main chat logs table
CREATE TABLE claude_chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_query TEXT NOT NULL,
  claude_response TEXT NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  project_id VARCHAR(100) NOT NULL,
  interaction_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_claude_chat_logs_project_id ON claude_chat_logs(project_id);
CREATE INDEX idx_claude_chat_logs_user_id ON claude_chat_logs(user_id);
CREATE INDEX idx_claude_chat_logs_timestamp ON claude_chat_logs(interaction_timestamp);
CREATE INDEX idx_claude_chat_logs_project_timestamp ON claude_chat_logs(project_id, interaction_timestamp);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_claude_chat_logs_updated_at 
    BEFORE UPDATE ON claude_chat_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional)
ALTER TABLE claude_chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
CREATE POLICY "Users can view all chat logs" ON claude_chat_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert chat logs" ON claude_chat_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### Get your Supabase credentials:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy your `Project URL` and `anon public key`

### 2. Backend Setup

#### Install Python dependencies:
```bash
cd /Users/neink/TUMai/GoonerSquad
pip install fastapi uvicorn supabase python-multipart
```

#### Create environment file:
```bash
# Create .env file
cat > .env << EOF
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
EOF
```

#### Start the backend server:
```bash
python supabase_integration.py
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install additional dependencies:
```bash
cd code-lens-flow
npm install @tanstack/react-query
```

#### Create environment file:
```bash
# Create .env file in frontend
cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_ENABLE_MOCK_DATA=false
EOF
```

#### Update main.tsx to include QueryProvider:
```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryProvider } from './components/QueryProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>,
)
```

#### Update your router to include LiveDashboard:
```tsx
// Add to your routing configuration
import LiveDashboard from './pages/LiveDashboard'

// Add route
{ path: '/live', element: <LiveDashboard /> }
```

#### Start the frontend:
```bash
npm run dev
```

## 🧪 Testing the Integration

### 1. Add Sample Data

Use this script to add sample chat logs to your database:

```python
# test_data.py
import asyncio
from datetime import datetime, timezone, timedelta
from supabase_integration import SupabaseAnalyticsService, SupabaseConfig

async def add_sample_data():
    config = SupabaseConfig(
        url="your-supabase-url",
        key="your-supabase-key"
    )
    
    service = SupabaseAnalyticsService(config)
    
    # Sample chat logs
    sample_logs = [
        {
            "user_query": "I need to implement JWT authentication in auth.js",
            "claude_response": "I'll help you implement JWT authentication. Let's start with token generation...",
            "user_id": "sarah",
            "project_id": "ecommerce_app",
            "interaction_timestamp": (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
        },
        {
            "user_query": "My Stripe webhook is not working",
            "claude_response": "Let me help you debug the Stripe webhook issue...",
            "user_id": "john", 
            "project_id": "ecommerce_app",
            "interaction_timestamp": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
        },
        {
            "user_query": "Still getting the same webhook error",
            "claude_response": "Let's try a different approach...",
            "user_id": "john",
            "project_id": "ecommerce_app", 
            "interaction_timestamp": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        }
    ]
    
    # Insert sample data
    for log in sample_logs:
        try:
            response = service.supabase.table(service.config.table_name).insert(log).execute()
            print(f"✅ Inserted: {log['user_id']} - {log['user_query'][:50]}...")
        except Exception as e:
            print(f"❌ Error inserting log: {e}")

if __name__ == "__main__":
    asyncio.run(add_sample_data())
```

### 2. Verify the Integration

1. **Check API Health**: Visit `http://localhost:8000/api/health`
2. **Test Projects Endpoint**: Visit `http://localhost:8000/api/projects`
3. **View Frontend**: Visit `http://localhost:5173/live`

You should see:
- ✅ Live team status updates every 15 seconds
- ✅ Real collision detection when multiple users work on same files
- ✅ Objective status indicators (flow/slow/stuck) based on chat patterns
- ✅ Project metrics and developer insights

## 🔄 Data Flow

### Chat Log Creation
```
Claude Conversation → Manual/Automated Log Creation → Supabase → Analytics Processing → Frontend Display
```

### Real-Time Updates
```
Frontend (15s polling) → FastAPI Backend → Supabase Query → Analytics Processing → Live Dashboard Update
```

## 📊 Available Endpoints

### Backend API Endpoints:
- `GET /api/projects` - List all projects with activity
- `GET /api/projects/{project_id}/dashboard` - Team dashboard data
- `GET /api/projects/{project_id}/developers/{user_id}/insights` - Developer insights
- `POST /api/chat-logs` - Create new chat log entry
- `GET /api/health` - Health check

### Frontend Pages:
- `/live` - Live team dashboard with real-time updates
- `/` - Original dashboard with mock data (for comparison)

## 🎯 Key Features

### ✅ Objective Analytics
- **No subjective scoring** - only measurable metrics
- **File collision detection** - when multiple devs work on same files
- **Status indicators** based on chat patterns:
  - 🟢 **Flow**: Quick solutions, steady progress
  - 🟡 **Slow**: Multiple iterations, debugging
  - 🔴 **Stuck**: Extended time on single issue

### ✅ Real-Time Coordination
- **Live updates** every 15 seconds
- **Team status board** showing current work
- **Collision warnings** for duplicate effort
- **Activity duration** tracking

### ✅ Evidence-Based Insights
- **Success/stuck indicators** counted from actual phrases
- **File mentions** extracted from conversations
- **Problem patterns** identified from chat history
- **Learning opportunities** suggested based on team solutions

## 🔧 Customization

### Adding New Analytics
1. Extend `ChatLogsAnalyzer` in `chat_logs_analytics.py`
2. Add new API endpoints in `supabase_integration.py`
3. Create frontend components to display new insights

### Modifying Status Detection
```python
# In ChatLogsAnalyzer._calculate_objective_status()
def _calculate_objective_status(self, sessions: List[ConversationSession]) -> str:
    # Customize the logic for determining developer status
    # Based on your team's specific patterns
```

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure FastAPI CORS middleware includes your frontend URL
2. **Supabase Connection**: Verify your URL and key in environment variables
3. **No Data**: Check that chat logs are being inserted with correct schema
4. **Real-time Updates**: Ensure React Query is properly configured with refetch intervals

### Debug Commands:
```bash
# Test backend health
curl http://localhost:8000/api/health

# Test Supabase connection
python -c "from supabase_integration import *; print('Connection OK')"

# Check frontend API calls (browser dev tools)
# Network tab should show regular API calls every 15 seconds
```

## 🎉 Success!

You now have a fully integrated CodeLens system that:
- ✅ Analyzes real Claude conversations from Supabase
- ✅ Provides objective, evidence-based team coordination
- ✅ Updates in real-time without subjective scoring
- ✅ Detects actual collisions and provides actionable insights

The system transforms isolated Claude conversations into a living map of your team's development process! 🚀
