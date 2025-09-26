# Minimal AI Analysis Setup Guide

## 🚀 Quick Start

The Minimal AI Analysis component is now integrated and running! Access it at:
- **URL**: http://localhost:5173/ai-analysis
- **Navigation**: Click the purple "AI Analysis" button in the top navigation bar

## ✅ What's Working Now

1. **Component Integration** ✓
   - Added to App.tsx routing
   - Accessible via `/ai-analysis` route
   - Navigation button added to header

2. **Data Fetching** ✓
   - Uses `useClaudeChatLogs` hook to fetch conversation data
   - Falls back to demo mode if no data exists
   - Pulls from existing `claude_chat_logs` table (if it exists)

3. **AI Analysis** ✓
   - Uses `useTeamHealthAnalysis` hook for real AI analysis
   - Works without database migration
   - Results stored in local state (browser session only)

## 📋 Requirements

### Minimal Requirements (Demo Mode)
- ✅ Supabase connection (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- ✅ User authentication (login required)
- That's it! Works in demo mode without real data

### Full Functionality Requirements
1. **OpenAI API Key** (for real AI analysis)
   ```env
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```

2. **Claude Chat Logs Table** (optional but recommended)
   ```sql
   -- Create the claude_chat_logs table if it doesn't exist
   CREATE TABLE IF NOT EXISTS claude_chat_logs (
     id TEXT PRIMARY KEY,
     user_query TEXT,
     claude_response TEXT,
     user_id TEXT,
     project_id TEXT,
     interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     anonymous_user_id TEXT,
     project_name TEXT,
     installation_id TEXT,
     status TEXT DEFAULT 'pending',
     completed_at TIMESTAMP WITH TIME ZONE
   );
   ```

3. **Sample Data** (optional - for testing)
   - The CSV file at `src/claude_chat_history/claude_chat_logs_rows.csv` contains sample data
   - You can import it to Supabase if needed

## 🎯 How It Works

### Data Flow
```
1. User clicks "Run AI Analysis"
       ↓
2. Fetch claude_chat_logs from Supabase
       ↓
3. If OpenAI key exists:
   → Run real AI analysis with GPT-4
   → Get team health scores, recommendations, etc.
       ↓
4. If no OpenAI key:
   → Run basic JavaScript analysis
   → Extract topics, calculate activity levels
       ↓
5. Display results in UI
   (Results are session-only, lost on refresh)
```

### Features Available

| Feature | Without OpenAI Key | With OpenAI Key |
|---------|-------------------|-----------------|
| Topic Extraction | ✅ Basic keywords | ✅ AI-powered |
| Activity Level | ✅ Count-based | ✅ AI-analyzed |
| Recommendations | ❌ Not available | ✅ AI-generated |
| Team Health Score | ❌ Not available | ✅ 1-10 scale |
| Bottleneck Detection | ❌ Not available | ✅ AI-identified |

## 🔧 Troubleshooting

### "No conversation data found"
- The `claude_chat_logs` table might not exist
- Solution: Create the table using the SQL above or run in demo mode

### "Analysis error: Missing OpenAI API key"
- The OpenAI API key is not configured
- Solution: Add `VITE_OPENAI_API_KEY` to your `.env` file or use demo mode

### "Please log in to analyze your data"
- User authentication is required
- Solution: Log in first, then access the AI Analysis page

### Results disappear on refresh
- This is expected behavior for the minimal implementation
- Results are stored in browser state only, not in database
- To persist results, you would need the full migration

## 📊 What You'll See

### Demo Mode (No Data/No OpenAI)
- Sample metrics and placeholder analysis
- Shows the UI structure and capabilities
- Yellow banner indicating demo mode

### With Real Data (No OpenAI)
- Basic topic extraction from conversations
- Activity level calculations
- Conversation count and timing

### Full Mode (Data + OpenAI)
- Team health score (1-10)
- AI-generated recommendations
- Identified bottlenecks
- Collaboration patterns analysis
- Risk indicators

## 🚦 Next Steps

1. **Test Demo Mode**
   - Click "Run AI Analysis" to see demo results
   - Explore the UI and understand the features

2. **Add OpenAI Key** (Optional)
   ```bash
   echo "VITE_OPENAI_API_KEY=sk-your-key" >> .env
   npm run dev  # Restart server
   ```

3. **Import Sample Data** (Optional)
   - Use the CSV file to populate claude_chat_logs table
   - Or generate your own conversation data

4. **Consider Full Migration** (Later)
   - If you need persistent storage
   - If you want historical tracking
   - If multiple users need to see the same analysis

## 📝 Summary

The Minimal AI Analysis is now fully integrated and functional! It provides:
- ✅ Immediate value without database changes
- ✅ Works with existing Supabase setup
- ✅ Falls back gracefully when data/API keys are missing
- ✅ Clear upgrade path to full functionality

Access it now at: **http://localhost:5173/ai-analysis**
