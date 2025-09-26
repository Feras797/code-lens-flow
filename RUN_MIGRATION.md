# Migration Instructions

## Overview
This migration adds the missing `claude_chat_logs` table and integrates the MinimalAIAnalysis component with your existing analysis infrastructure.

## Step 1: Run the Database Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Run the Migration**
   - Copy the entire contents of `supabase-migrations/analysis_tables.sql`
   - Paste into the SQL editor
   - Click "Run" button (or press Cmd+Enter on Mac)

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check the "Table Editor" to confirm new tables were created

## Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Option 3: Using psql (Advanced)

```bash
# Get your database URL from Supabase dashboard
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase-migrations/analysis_tables.sql
```

## What the Migration Creates

This migration will create:

### 6 Main Tables:
- `team_insights` - Team health analysis results
- `developer_profiles` - Individual developer analytics  
- `conversation_insights` - Per-conversation analysis
- `project_health_metrics` - Project-level health tracking
- `risk_assessments` - Risk identification and tracking
- `analysis_jobs` - Analysis job management and caching

### Additional Infrastructure:
- 7 performance indexes for fast queries
- Automatic timestamp triggers
- Row-level security policies
- 3 convenience views for common queries

## Verification Steps

After running the migration, verify it worked:

1. **Check Tables Were Created**
   ```sql
   -- Run this in SQL Editor
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'team_insights', 
     'developer_profiles', 
     'conversation_insights',
     'project_health_metrics',
     'risk_assessments',
     'analysis_jobs'
   );
   ```

2. **Check Views Were Created**
   ```sql
   SELECT viewname 
   FROM pg_views 
   WHERE schemaname = 'public' 
   AND viewname IN (
     'latest_team_insights',
     'latest_developer_profiles', 
     'active_risks'
   );
   ```

3. **Test Insert (Optional)**
   ```sql
   -- Test insert into team_insights
   INSERT INTO team_insights (
     project_id, 
     project_name, 
     team_health_score,
     collaboration_patterns,
     productivity_trends,
     communication_quality,
     knowledge_sharing_level
   ) VALUES (
     'test-project',
     'Test Project',
     8,
     'Good collaboration observed',
     'Upward trend',
     7,
     8
   );
   
   -- Check it worked
   SELECT * FROM team_insights WHERE project_id = 'test-project';
   
   -- Clean up test data
   DELETE FROM team_insights WHERE project_id = 'test-project';
   ```

## Troubleshooting

### If you get "relation already exists" errors:
The tables might already exist. You can either:
- Skip (tables are already created)
- Drop and recreate (CAUTION: will lose existing data):
  ```sql
  -- Only if you want to start fresh!
  DROP TABLE IF EXISTS conversation_insights CASCADE;
  DROP TABLE IF EXISTS team_insights CASCADE;
  DROP TABLE IF EXISTS developer_profiles CASCADE;
  DROP TABLE IF EXISTS project_health_metrics CASCADE;
  DROP TABLE IF EXISTS risk_assessments CASCADE;
  DROP TABLE IF EXISTS analysis_jobs CASCADE;
  ```

### If you get permission errors:
- Make sure you're using the correct database credentials
- Ensure your user has CREATE TABLE permissions

## Step 2: Add Sample Data (Recommended for Testing)
1. **In the SQL Editor, copy and paste the contents of `supabase-migrations/sample_data.sql`**
2. **Execute the script**

This provides realistic conversation examples for testing the AI analysis pipeline.

## Step 3: Environment Setup
Ensure you have these environment variables in your `.env` file:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Step 4: Test the Complete System
1. **Run your application**: `npm run dev`
2. **Ensure you're logged in** (the component requires authentication)
3. **Navigate to the MinimalAIAnalysis component**
4. **Click "Run AI Analysis"**

## What's New in This Update

The updated system now:

✅ **Includes claude_chat_logs table** - the missing piece your analysis system needed
✅ **Fetches real data** from `claude_chat_logs` instead of `chat_messages`
✅ **Uses proper hooks** (`useClaudeChatLogs`, `useTeamHealthAnalysis`) instead of direct Supabase calls
✅ **Integrates LangChain analysis** with OpenAI for real AI insights
✅ **Displays rich metrics**: team health scores, collaboration patterns, bottlenecks, recommendations
✅ **Handles multiple scenarios**: real data analysis, fallback modes, error handling
✅ **Shows loading states** and provides detailed feedback

## Expected Results
- **With sample data**: Full AI analysis with team health scores, recommendations, and insights
- **Without data**: Demo mode with sample metrics and helpful messaging
- **API errors**: Graceful fallback with basic statistics from available data

## Troubleshooting
- **No data showing**: Verify the migration ran successfully and sample data was inserted
- **Analysis not working**: Check your OpenAI API key is valid and has credits
- **Authentication issues**: Ensure you're logged in through Supabase Auth

## Next Steps

Once the migration is complete:
1. Run the migration and sample data scripts
2. Set up your `.env` file with OpenAI API key
3. Start the development server: `npm run dev`
4. Navigate to the MinimalAIAnalysis component
5. The AI analysis will now use real data and persist results to the analysis tables!
