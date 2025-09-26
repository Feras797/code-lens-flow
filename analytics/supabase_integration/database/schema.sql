-- CodeLens Analytics Database Schema
-- Run this in your Supabase SQL Editor

-- Create the main chat logs table
CREATE TABLE IF NOT EXISTS claude_chat_logs (
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
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_project_id ON claude_chat_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_user_id ON claude_chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_timestamp ON claude_chat_logs(interaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_project_timestamp ON claude_chat_logs(project_id, interaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_user_project ON claude_chat_logs(user_id, project_id);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_claude_chat_logs_updated_at ON claude_chat_logs;
CREATE TRIGGER update_claude_chat_logs_updated_at 
    BEFORE UPDATE ON claude_chat_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE claude_chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
DROP POLICY IF EXISTS "Users can view all chat logs" ON claude_chat_logs;
CREATE POLICY "Users can view all chat logs" ON claude_chat_logs
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert chat logs" ON claude_chat_logs;
CREATE POLICY "Users can insert chat logs" ON claude_chat_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own chat logs" ON claude_chat_logs;
CREATE POLICY "Users can update their own chat logs" ON claude_chat_logs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Optional: Create a view for recent activity (last 24 hours)
CREATE OR REPLACE VIEW recent_chat_activity AS
SELECT 
    project_id,
    user_id,
    COUNT(*) as interaction_count,
    MAX(interaction_timestamp) as last_interaction,
    MIN(interaction_timestamp) as first_interaction,
    EXTRACT(EPOCH FROM (MAX(interaction_timestamp) - MIN(interaction_timestamp)))/60 as duration_minutes
FROM claude_chat_logs 
WHERE interaction_timestamp > NOW() - INTERVAL '24 hours'
GROUP BY project_id, user_id
ORDER BY last_interaction DESC;

-- Optional: Create a function to get team status
CREATE OR REPLACE FUNCTION get_team_status(p_project_id TEXT, p_hours_back INTEGER DEFAULT 2)
RETURNS TABLE (
    user_id TEXT,
    interaction_count BIGINT,
    last_interaction TIMESTAMPTZ,
    duration_minutes NUMERIC,
    recent_queries TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.user_id::TEXT,
        COUNT(*)::BIGINT as interaction_count,
        MAX(cl.interaction_timestamp) as last_interaction,
        EXTRACT(EPOCH FROM (MAX(cl.interaction_timestamp) - MIN(cl.interaction_timestamp)))/60 as duration_minutes,
        ARRAY_AGG(cl.user_query ORDER BY cl.interaction_timestamp DESC LIMIT 3) as recent_queries
    FROM claude_chat_logs cl
    WHERE cl.project_id = p_project_id 
    AND cl.interaction_timestamp > NOW() - (p_hours_back || ' hours')::INTERVAL
    GROUP BY cl.user_id
    ORDER BY last_interaction DESC;
END;
$$ LANGUAGE plpgsql;

-- Create sample data (optional - remove in production)
-- INSERT INTO claude_chat_logs (user_query, claude_response, user_id, project_id, interaction_timestamp) VALUES
-- ('I need help with JWT authentication', 'I can help you implement JWT authentication...', 'sarah', 'ecommerce_app', NOW() - INTERVAL '30 minutes'),
-- ('My webhook is not working', 'Let me help you debug the webhook issue...', 'john', 'ecommerce_app', NOW() - INTERVAL '2 hours'),
-- ('Still getting the same error', 'Let''s try a different approach...', 'john', 'ecommerce_app', NOW() - INTERVAL '1 hour');

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON claude_chat_logs TO authenticated;
-- GRANT SELECT ON recent_chat_activity TO authenticated;
