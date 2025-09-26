# CodeLens Supabase Integration

Complete integration package for connecting your React frontend with Supabase backend for real-time team coordination analytics.

## 📁 Folder Structure

```
supabase_integration/
├── backend/                     # Python FastAPI backend
│   ├── supabase_integration.py  # Main FastAPI server with Supabase
│   ├── chat_logs_analytics.py   # Analytics engine
│   ├── demo_chat_logs_analytics.py  # Demo/testing script
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment variables template
│   └── .env                    # Your actual environment variables
├── frontend/                   # React components and hooks
│   ├── api.ts                  # API service for backend communication
│   ├── useProjects.ts          # React Query hooks
│   ├── LiveTeamStatus.tsx      # Live team status component
│   ├── LiveDashboard.tsx       # Main dashboard page
│   ├── QueryProvider.tsx       # React Query provider
│   └── .env.example           # Frontend environment template
├── database/                   # Supabase database setup
│   ├── schema.sql             # Database schema and functions
│   └── sample_data.sql        # Test data for development
└── docs/                      # Documentation
    └── setup_supabase_integration.md  # Complete setup guide
```

## 🚀 Quick Start

### 1. Set up Supabase Database
```sql
-- Run in your Supabase SQL Editor
\i database/schema.sql
\i database/sample_data.sql  -- Optional: for testing
```

### 2. Configure Backend
```bash
cd backend/
cp .env.example .env
# Edit .env with your Supabase credentials
pip install -r requirements.txt
python supabase_integration.py
```

### 3. Configure Frontend
```bash
cd ../frontend/
cp .env.example .env
# Copy the React components to your code-lens-flow project
# Update your main.tsx to include QueryProvider
```

### 4. Add Your Supabase Keys
Edit `backend/.env`:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here
```

## 🔑 Environment Variables

### Backend (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `API_PORT` - Backend server port (default: 8000)
- `CORS_ORIGINS` - Allowed frontend origins

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_ENABLE_MOCK_DATA` - Use mock data instead of real API

## 📊 Features

### ✅ Objective Analytics
- **No subjective scoring** - only measurable metrics
- **File collision detection** - when multiple devs work on same files
- **Status indicators** based on chat patterns
- **Real-time team coordination**

### ✅ Live Dashboard
- **15-second updates** from Supabase
- **Team status board** showing current work
- **Collision warnings** for duplicate effort
- **Developer insights** and patterns

### ✅ Evidence-Based Insights
- **Success/stuck indicators** from actual phrases
- **File mentions** extracted from conversations
- **Problem patterns** identified from chat history
- **Team knowledge sharing** opportunities

## 🔧 API Endpoints

- `GET /api/projects` - List all projects
- `GET /api/projects/{id}/dashboard` - Team dashboard
- `GET /api/projects/{id}/developers/{user}/insights` - Developer insights
- `POST /api/chat-logs` - Create chat log entry
- `GET /api/health` - Health check

## 📱 Frontend Components

- `LiveDashboard` - Main dashboard with real-time updates
- `LiveTeamStatus` - Team status board component
- `useProjects` - React Query hooks for data fetching
- `QueryProvider` - React Query configuration

## 🧪 Testing

1. **Backend**: Run `python demo_chat_logs_analytics.py`
2. **Database**: Insert sample data with `sample_data.sql`
3. **Frontend**: Visit `http://localhost:5173/live`

## 📚 Documentation

See `docs/setup_supabase_integration.md` for complete setup instructions.

## 🎯 Next Steps

1. Add your Supabase credentials to `.env` files
2. Run the database schema in Supabase
3. Start the backend server
4. Integrate frontend components into your React app
5. Test with sample data

Transform your isolated Claude conversations into a living map of your team's development process! 🚀
