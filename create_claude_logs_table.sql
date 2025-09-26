-- Minimal table creation for testing the AI Analysis feature
-- Run this in Supabase SQL Editor if you want to test with real data

-- Create the claude_chat_logs table (minimal version)
CREATE TABLE IF NOT EXISTS claude_chat_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_query TEXT NOT NULL,
  claude_response TEXT,
  user_id TEXT NOT NULL,
  project_id TEXT DEFAULT 'default-project',
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  anonymous_user_id TEXT,
  project_name TEXT DEFAULT 'Default Project',
  installation_id TEXT,
  status TEXT DEFAULT 'completed',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_claude_logs_user_id ON claude_chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_claude_logs_project_id ON claude_chat_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_claude_logs_timestamp ON claude_chat_logs(interaction_timestamp DESC);

-- Grant permissions
GRANT ALL ON claude_chat_logs TO authenticated;
GRANT SELECT ON claude_chat_logs TO anon;

-- Insert some sample data (replace user_id with your actual auth user ID)
-- You can get your user_id from: SELECT id FROM auth.users;
/*
INSERT INTO claude_chat_logs (user_query, claude_response, user_id, project_id, project_name) VALUES
  ('How do I optimize database queries?', 'Here are several ways to optimize database queries: 1. Use indexes on frequently queried columns...', 'YOUR-USER-ID-HERE', 'project-1', 'Project Alpha'),
  ('What is the best way to handle authentication in React?', 'For React authentication, consider these approaches: 1. Use context API for state management...', 'YOUR-USER-ID-HERE', 'project-1', 'Project Alpha'),
  ('Can you help me debug this TypeScript error?', 'Let me help you debug that TypeScript error. Could you share the specific error message...', 'YOUR-USER-ID-HERE', 'project-1', 'Project Alpha'),
  ('How should I structure my Next.js project?', 'Here is a recommended Next.js project structure: /app for app router, /components for reusable components...', 'YOUR-USER-ID-HERE', 'project-1', 'Project Alpha'),
  ('What are React Server Components?', 'React Server Components are a new feature that allows components to be rendered on the server...', 'YOUR-USER-ID-HERE', 'project-1', 'Project Alpha');
*/

-- To insert sample data with your actual user ID:
-- 1. First get your user ID:
--    SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- 2. Then uncomment and run the INSERT statement above with your user ID
